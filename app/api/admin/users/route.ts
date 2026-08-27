/**
 * Admin Users API
 *
 * Mega Build 4 - Admin Command Center
 * Full user management with pagination and actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { isAdmin } from '@/lib/admin/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * GET - Paginated list of users
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const search = searchParams.get('search') || ''
      const offset = (page - 1) * limit

      let query = adminDb.collection('users').orderBy('createdAt', 'desc')

      // Apply search filter if provided
      if (search) {
        // Firestore doesn't support full-text search, so we'll filter client-side.
        // In production, use a dedicated search index for unbounded datasets.
        query = query.limit(limit * 3)
      } else {
        query = query.limit(limit).offset(offset)
      }

      const [snapshot, totalSnapshot] = await Promise.all([
        query.get(),
        adminDb.collection('users').count().get(),
      ])

      const totalUsers = Number(totalSnapshot.data().count || 0)
      const users: any[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        const user = {
          uid: doc.id,
          email: data.email || '',
          displayName: data.name || data.displayName || 'No name',
          isAdmin: false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
          lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt || null,
          subscriptionStatus: data.subscriptionStatus || 'free',
          onboardingComplete: Boolean(
            data.onboardingComplete ??
            data.onboardingCompleted ??
            data.profileComplete ??
            data.profileCompleted ??
            false
          ),
          legacyTickets: data.legacyTickets || {},
        }

        if (
          !search ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.displayName.toLowerCase().includes(search.toLowerCase()) ||
          user.uid.toLowerCase().includes(search.toLowerCase())
        ) {
          users.push(user)
        }
      })

      const paginatedUsers = users.slice(0, limit)

      // Check admin status for each visible user.
      for (const user of paginatedUsers) {
        user.isAdmin = await isAdmin(user.uid)
      }

      // Resolve canonical subscription status for each visible user.
      // Current subscriptions live at users/{uid}/subscriptions/current; the
      // legacy fallback remains subscriptions/{uid}. This mirrors the canonical
      // subscription reader used by Mission Control.
      await Promise.all(
        paginatedUsers.map(async (user) => {
          const currentSnap = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('subscriptions')
            .doc('current')
            .get()

          let subData = currentSnap.exists ? currentSnap.data() : undefined

          if (!subData) {
            const legacySnap = await adminDb.collection('subscriptions').doc(user.uid).get()
            subData = legacySnap.exists ? legacySnap.data() : undefined
          }

          if (subData) {
            const rawStatus = String(subData.status || (subData.active === true ? 'active' : 'inactive')).toLowerCase()
            user.subscriptionStatus = rawStatus === 'active' || rawStatus === 'authenticated' ? 'active' : 'inactive'
          }
        })
      )

      const activeOnPage = paginatedUsers.filter((user) => user.subscriptionStatus === 'active').length
      const staffOnPage = paginatedUsers.filter((user) => user.isAdmin).length

      return NextResponse.json({
        success: true,
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: search ? users.length : totalUsers,
          hasMore: search ? users.length > limit : offset + paginatedUsers.length < totalUsers,
        },
        summary: {
          totalUsers,
          visibleUsers: search ? users.length : paginatedUsers.length,
          activeOnPage,
          staffOnPage,
        },
      })
    } catch (error: any) {
      console.error('Admin users list error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST - Update user actions
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const body = await req.json()
        const { action, uid, ...params } = body

        if (!action || !uid) {
          return NextResponse.json({ error: 'Action and uid are required' }, { status: 400 })
        }

        const userRef = adminDb.collection('users').doc(uid)
        const userSnap = await userRef.get()

        if (!userSnap.exists) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        switch (action) {
          case 'setAdmin': {
            const { isAdmin: shouldBeAdmin } = params
            if (typeof shouldBeAdmin !== 'boolean') {
              return NextResponse.json({ error: 'isAdmin must be boolean' }, { status: 400 })
            }

            if (shouldBeAdmin) {
              await adminDb.collection('admins').doc(uid).set({
                email: userSnap.data()?.email || '',
                role: 'Support',
                name: userSnap.data()?.name || '',
                createdAt: new Date(),
              })
            } else {
              await adminDb.collection('admins').doc(uid).delete()
            }

            return NextResponse.json({ success: true, message: `User ${shouldBeAdmin ? 'promoted to' : 'removed from'} admin` })
          }

          case 'resetTickets': {
            await userRef.update({
              legacyTickets: {
                ai_questions: 0,
                kundali_basic: 0,
              },
            })
            return NextResponse.json({ success: true, message: 'Tickets reset' })
          }

          case 'updateTickets': {
            const { ai_questions, kundali_basic } = params
            const currentTickets = userSnap.data()?.legacyTickets || {}

            await userRef.update({
              legacyTickets: {
                ai_questions: typeof ai_questions === 'number' ? ai_questions : currentTickets.ai_questions || 0,
                kundali_basic: typeof kundali_basic === 'number' ? kundali_basic : currentTickets.kundali_basic || 0,
              },
            })
            return NextResponse.json({ success: true, message: 'Tickets updated' })
          }

          default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
      } catch (error: any) {
        console.error('Admin user action error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to perform action' },
          { status: 500 }
        )
      }
    },
    'users.write'
  )(request)
}
