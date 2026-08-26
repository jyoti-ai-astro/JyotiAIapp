import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function toDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayTimestamp = Timestamp.fromDate(todayStart)

        const [
          usersCount,
          newUsersCount,
          reportsCount,
          guruCount,
          paymentsSnapshot,
          subscriptionsSnapshot,
          usersSnapshot,
        ] = await Promise.all([
          adminDb.collection('users').count().get(),
          adminDb.collection('users').where('createdAt', '>=', todayTimestamp).count().get(),
          adminDb.collection('reports').where('createdAt', '>=', todayTimestamp).count().get(),
          adminDb.collectionGroup('messages').where('createdAt', '>=', todayTimestamp).count().get(),
          adminDb.collection('payments').get(),
          adminDb.collection('subscriptions').get(),
          adminDb.collection('users').select('aiGuruTickets', 'kundaliTickets', 'lifetimePredictions').get(),
        ])

        let verifiedRevenueTotal = 0
        let verifiedRevenueToday = 0
        let successfulPayments = 0
        let failedPayments = 0

        paymentsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.status === 'success') {
            const amount = Number(data.amount || 0)
            verifiedRevenueTotal += Number.isFinite(amount) ? amount : 0
            successfulPayments += 1

            const createdAt = toDate(data.createdAt)
            if (createdAt && createdAt >= todayStart) {
              verifiedRevenueToday += Number.isFinite(amount) ? amount : 0
            }
          } else if (data.status === 'failed') {
            failedPayments += 1
          }
        })

        let activeSubscriptions = 0
        subscriptionsSnapshot.forEach((doc) => {
          const data = doc.data()
          const status = data.status
          const expiry = toDate(data.expiry ?? data.expiresAt ?? data.subscriptionExpiry)
          const activeByStatus = status === 'active' || status === 'authenticated' || data.active === true
          if (activeByStatus && (!expiry || expiry > now)) activeSubscriptions += 1
        })

        const ticketLiability = {
          aiGuruTickets: 0,
          kundaliTickets: 0,
          lifetimePredictions: 0,
        }

        usersSnapshot.forEach((doc) => {
          const data = doc.data()
          ticketLiability.aiGuruTickets += Number(data.aiGuruTickets || 0)
          ticketLiability.kundaliTickets += Number(data.kundaliTickets || 0)
          ticketLiability.lifetimePredictions += Number(data.lifetimePredictions || 0)
        })

        const { envVars } = await import('@/lib/env/env.mjs')

        return NextResponse.json({
          success: true,
          stats: {
            users: {
              total: usersCount.data().count,
              newToday: newUsersCount.data().count,
            },
            reports: { today: reportsCount.data().count },
            guru: { usageToday: guruCount.data().count },
            payments: {
              successful: successfulPayments,
              failed: failedPayments,
              verifiedRevenueTotal,
              verifiedRevenueToday,
            },
            subscriptions: { active: activeSubscriptions },
            tickets: ticketLiability,
            system: {
              aiProvider: envVars.ai.provider,
              dataSource: 'canonical',
            },
          },
        })
      } catch (error: any) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to fetch stats' },
          { status: 500 }
        )
      }
    },
    'payments.read'
  )(request)
}
