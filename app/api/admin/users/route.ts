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
        // Firestore doesn't support full-text search, so we'll filter client-side
        // In production, use Algolia or similar
        query = query.limit(limit * 3) // Get more to filter
      } else {
        query = query.limit(limit).offset(offset)
      }

      const snapshot = await query.get()
      const users: any[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        const user = {
          uid: doc.id,
          email: data.email || '',
          displayName: data.name || data.displayName || 'No name',
          isAdmin: false, // Will check separately
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
          lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt || null,
          subscriptionStatus: data.subscriptionStatus || 'free',
          legacyTickets: data.legacyTickets || {},
        }

        // Apply search filter
        if (!search || 
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.displayName.toLowerCase().includes(search.toLowerCase())) {
          users.push(user)
        }
      })

      // Limit to requested page size
      const paginatedUsers = users.slice(0, limit)

      // Check admin status for each user
      for (const user of paginatedUsers) {
        user.isAdmin = await isAdmin(user.uid)
      }

      // Get subscription status
      for (const user of paginatedUsers) {
        const subRef = adminDb.collection('subscriptions').doc(user.uid)
        const subSnap = await subRef.get()
        if (subSnap.exists) {
          const subData = subSnap.data()
          user.subscriptionStatus = subData?.status === 'active' ? 'active' : 'inactive'
        }
      }

      return NextResponse.json({
        success: true,
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: users.length, // Approximate
          hasMore: users.length >= limit,
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
              // Add to admins collection
              await adminDb.collection('admins').doc(uid).set({
                email: userSnap.data()?.email || '',
                role: 'Support', // Default role
                name: userSnap.data()?.name || '',
                createdAt: new Date(),
              })
            } else {
              // Remove from admins collection
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

