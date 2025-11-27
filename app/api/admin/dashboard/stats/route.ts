import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * Admin Dashboard Stats API
 * Milestone 10 - Step 2
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Total users
      const usersSnapshot = await adminDb.collection('users').count().get()
      const totalUsers = usersSnapshot.data().count

      // New users today
      const newUsersSnapshot = await adminDb
        .collection('users')
        .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
        .count()
        .get()
      const newUsersToday = newUsersSnapshot.data().count

      // Reports today
      const reportsSnapshot = await adminDb
        .collection('reports')
        .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
        .count()
        .get()
      const reportsToday = reportsSnapshot.data().count

      // AI Guru usage (chats today)
      const guruChatsSnapshot = await adminDb
        .collectionGroup('messages')
        .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
        .count()
        .get()
      const guruUsageToday = guruChatsSnapshot.data().count

      // Uploads today (palmistry + aura)
      const palmistrySnapshot = await adminDb
        .collectionGroup('palmistry')
        .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
        .count()
        .get()
      const auraSnapshot = await adminDb
        .collectionGroup('aura')
        .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
        .count()
        .get()
      const uploadsToday = palmistrySnapshot.data().count + auraSnapshot.data().count

      // Revenue stats
      const paymentsSnapshot = await adminDb.collection('payments').get()
      let totalRevenue = 0
      let todayRevenue = 0
      let activeSubscriptions = 0

      paymentsSnapshot.forEach((doc) => {
        const data = doc.data()
        const amount = data.amount || 0
        totalRevenue += amount

        if (data.createdAt && data.createdAt.toDate() >= todayStart) {
          todayRevenue += amount
        }

        if (data.status === 'success' && data.type === 'subscription') {
          activeSubscriptions++
        }
      })

      // System health (simplified - in production, check actual services)
      const systemHealth = {
        pinecone: 'healthy', // Should check actual Pinecone status
        workers: 'healthy',
        cron: 'healthy',
        // Phase 31 - F46: Use validated environment variables
        aiProvider: (await import('@/lib/env/env.mjs')).envVars.ai.provider,
      }

      return NextResponse.json({
        success: true,
        stats: {
          users: {
            total: totalUsers,
            newToday: newUsersToday,
          },
          reports: {
            today: reportsToday,
          },
          guru: {
            usageToday: guruUsageToday,
          },
          uploads: {
            today: uploadsToday,
          },
          revenue: {
            total: totalRevenue,
            today: todayRevenue,
            activeSubscriptions,
          },
          system: systemHealth,
        },
      })
    } catch (error: any) {
      console.error('Dashboard stats error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch stats' },
        { status: 500 }
      )
    }
  })(request)
}

