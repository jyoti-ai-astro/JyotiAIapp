/**
 * Admin Users API
 * Read-only user listing. Economic-state and staff mutations live behind
 * dedicated permissioned endpoints.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function iso(value: any) {
  return value?.toDate?.()?.toISOString?.() || (value instanceof Date ? value.toISOString() : value || null)
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

      try {
        const { searchParams } = new URL(req.url)
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const subscription = (searchParams.get('subscription') || 'all').trim().toLowerCase()
        const staff = (searchParams.get('staff') || 'all').trim().toLowerCase()
        const joined = (searchParams.get('joined') || 'all').trim().toLowerCase()
        const offset = (page - 1) * limit

        let query: any = adminDb.collection('users').orderBy('createdAt', 'desc')
        const joinedDays = joined === '7d' ? 7 : joined === '30d' ? 30 : joined === '90d' ? 90 : 0
        if (joinedDays) query = query.where('createdAt', '>=', new Date(Date.now() - joinedDays * 24 * 60 * 60 * 1000))

        const needsPostFilter = Boolean(search || subscription !== 'all' || staff !== 'all')
        query = needsPostFilter ? query.limit(Math.min(500, limit * 6)) : query.limit(limit).offset(offset)

        const [snapshot, adminsSnapshot] = await Promise.all([
          query.get(),
          adminDb.collection('admins').select().get(),
        ])
        const adminIds = new Set(adminsSnapshot.docs.map((doc: any) => doc.id))

        const baseUsers = snapshot.docs.map((doc: any) => {
          const data = doc.data()
          return {
            uid: doc.id,
            email: data.email || '',
            displayName: data.name || data.displayName || 'No name',
            isAdmin: adminIds.has(doc.id),
            createdAt: iso(data.createdAt),
            lastLoginAt: iso(data.lastLoginAt),
            subscriptionStatus: data.subscriptionStatus || 'free',
            onboardingComplete: Boolean(data.onboardingComplete),
          }
        })

        const subscriptionDocs = await Promise.all(baseUsers.map((user: any) => adminDb.collection('subscriptions').doc(user.uid).get()))
        const users = baseUsers.map((user: any, index: number) => {
          const sub = subscriptionDocs[index]
          if (!sub?.exists) return user
          const status = String(sub.data()?.status || 'inactive').toLowerCase()
          return { ...user, subscriptionStatus: status === 'active' ? 'active' : status }
        }).filter((user: any) => {
          if (search && !user.email.toLowerCase().includes(search) && !user.displayName.toLowerCase().includes(search) && !user.uid.toLowerCase().includes(search)) return false
          if (subscription === 'paid' && user.subscriptionStatus !== 'active') return false
          if (subscription === 'free' && user.subscriptionStatus === 'active') return false
          if (subscription === 'active' && user.subscriptionStatus !== 'active') return false
          if (subscription === 'inactive' && !['inactive', 'cancelled', 'expired'].includes(user.subscriptionStatus)) return false
          if (staff === 'yes' && !user.isAdmin) return false
          if (staff === 'no' && user.isAdmin) return false
          return true
        })

        const paginatedUsers = needsPostFilter ? users.slice(offset, offset + limit) : users
        const totalUsersSnapshot = await adminDb.collection('users').count().get()
        const totalUsers = Number(totalUsersSnapshot.data().count || 0)

        return NextResponse.json({
          success: true,
          users: paginatedUsers,
          summary: {
            totalUsers,
            visibleUsers: users.length,
            activeOnPage: paginatedUsers.filter((user: any) => user.subscriptionStatus === 'active').length,
            staffOnPage: paginatedUsers.filter((user: any) => user.isAdmin).length,
          },
          filters: { search, subscription, staff, joined },
          pagination: {
            page,
            limit,
            total: needsPostFilter ? users.length : totalUsers,
            hasMore: needsPostFilter ? offset + limit < users.length : offset + limit < totalUsers,
          },
        })
      } catch (error) {
        console.error('Admin users list error:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
      }
    },
    'users.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json(
      { error: 'This mutation endpoint is retired. Use dedicated staff or ticket endpoints.', code: 'ADMIN_USERS_MUTATION_RETIRED' },
      { status: 410 }
    ),
    'users.write'
  )(request)
}
