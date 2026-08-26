/**
 * Admin Users API
 * Read-only user listing. Economic-state and staff mutations live behind
 * dedicated permissioned endpoints.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { isAdmin } from '@/lib/admin/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const offset = (page - 1) * limit

        let query = adminDb.collection('users').orderBy('createdAt', 'desc')
        query = search ? query.limit(limit * 3) : query.limit(limit).offset(offset)

        const snapshot = await query.get()
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
          }
          if (!search || user.email.toLowerCase().includes(search) || user.displayName.toLowerCase().includes(search)) {
            users.push(user)
          }
        })

        const paginatedUsers = users.slice(0, limit)
        for (const user of paginatedUsers) user.isAdmin = await isAdmin(user.uid)

        for (const user of paginatedUsers) {
          const subSnap = await adminDb.collection('subscriptions').doc(user.uid).get()
          if (subSnap.exists) {
            user.subscriptionStatus = subSnap.data()?.status === 'active' ? 'active' : 'inactive'
          }
        }

        return NextResponse.json({
          success: true,
          users: paginatedUsers,
          pagination: { page, limit, total: users.length, hasMore: users.length >= limit },
        })
      } catch (error: any) {
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
      {
        error: 'This mutation endpoint is retired. Use dedicated staff or ticket endpoints.',
        code: 'ADMIN_USERS_MUTATION_RETIRED',
      },
      { status: 410 }
    ),
    'users.write'
  )(request)
}
