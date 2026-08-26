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
  return withAdminAuth(async (req) => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

    try {
      const { searchParams } = new URL(req.url)
      const days = Math.min(90, Math.max(1, Number.parseInt(searchParams.get('days') || '30', 10) || 30))
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const periodStart = new Date(now.getTime() - days * 86_400_000)
      const todayTimestamp = Timestamp.fromDate(todayStart)
      const periodTimestamp = Timestamp.fromDate(periodStart)

      const [
        usersCount,
        newUsersCount,
        periodUsersCount,
        reportsCount,
        guruCount,
        paymentsSnapshot,
        subscriptionsSnapshot,
        usersSnapshot,
        eventsSnapshot,
      ] = await Promise.all([
        adminDb.collection('users').count().get(),
        adminDb.collection('users').where('createdAt', '>=', todayTimestamp).count().get(),
        adminDb.collection('users').where('createdAt', '>=', periodTimestamp).count().get(),
        adminDb.collection('reports').where('createdAt', '>=', todayTimestamp).count().get(),
        adminDb.collectionGroup('messages').where('createdAt', '>=', todayTimestamp).count().get(),
        adminDb.collection('payments').get(),
        adminDb.collection('subscriptions').limit(1000).get(),
        adminDb.collection('users').select('aiGuruTickets', 'kundaliTickets', 'lifetimePredictions').get(),
        adminDb.collection('analyticsEvents').limit(5000).get(),
      ])

      let verifiedRevenueTotal = 0
      let verifiedRevenueToday = 0
      let verifiedRevenuePeriod = 0
      let successfulPayments = 0
      let successfulPeriod = 0
      let failedPayments = 0
      let failedPeriod = 0
      let pendingPayments = 0
      let pendingPeriod = 0
      const productRevenue = new Map<string, number>()

      paymentsSnapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = toDate(data.createdAt)
        const inPeriod = !createdAt || createdAt >= periodStart
        const amount = Number(data.amount || 0)
        if (data.status === 'success') {
          verifiedRevenueTotal += Number.isFinite(amount) ? amount : 0
          successfulPayments += 1
          if (createdAt && createdAt >= todayStart) verifiedRevenueToday += Number.isFinite(amount) ? amount : 0
          if (inPeriod) {
            verifiedRevenuePeriod += Number.isFinite(amount) ? amount : 0
            successfulPeriod += 1
            const product = String(data.productId || data.planId || data.plan || data.type || 'Unmapped')
            productRevenue.set(product, (productRevenue.get(product) || 0) + (Number.isFinite(amount) ? amount : 0))
          }
        } else if (data.status === 'failed') {
          failedPayments += 1
          if (inPeriod) failedPeriod += 1
        } else if (data.status === 'pending' || data.status === 'created') {
          pendingPayments += 1
          if (inPeriod) pendingPeriod += 1
        }
      })

      let activeSubscriptions = 0
      let expiring7d = 0
      let expiring30d = 0
      let cancelledSubscriptions = 0
      const dayMs = 86_400_000
      subscriptionsSnapshot.forEach((doc) => {
        const data = doc.data()
        const status = String(data.status || '').toLowerCase()
        const expiry = toDate(data.expiry ?? data.expiresAt ?? data.subscriptionExpiry)
        const activeByStatus = status === 'active' || status === 'authenticated' || data.active === true
        const cancelled = status === 'cancelled' || status === 'canceled'
        if (cancelled) cancelledSubscriptions += 1
        if (activeByStatus && (!expiry || expiry > now)) {
          activeSubscriptions += 1
          if (expiry) {
            const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / dayMs)
            if (daysLeft >= 0 && daysLeft <= 7) expiring7d += 1
            if (daysLeft >= 0 && daysLeft <= 30) expiring30d += 1
          }
        }
      })

      const ticketLiability = { aiGuruTickets: 0, kundaliTickets: 0, lifetimePredictions: 0 }
      usersSnapshot.forEach((doc) => {
        const data = doc.data()
        ticketLiability.aiGuruTickets += Number(data.aiGuruTickets || 0)
        ticketLiability.kundaliTickets += Number(data.kundaliTickets || 0)
        ticketLiability.lifetimePredictions += Number(data.lifetimePredictions || 0)
      })

      const events = eventsSnapshot.docs.map((doc) => doc.data()).filter((event) => {
        const occurred = toDate(event.receivedAt || event.occurredAt)
        return !occurred || occurred >= periodStart
      })
      const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean)).size
      const visitors = new Set(events.map((event) => event.anonymousId).filter(Boolean)).size
      const countEvent = (name: string) => events.filter((event) => event.eventName === name).length
      const checkoutIntent = countEvent('checkout_started') + countEvent('report_purchase_started')

      const { envVars } = await import('@/lib/env/env.mjs')
      return NextResponse.json({
        success: true,
        stats: {
          windowDays: days,
          users: { total: usersCount.data().count, newToday: newUsersCount.data().count, newPeriod: periodUsersCount.data().count },
          reports: { today: reportsCount.data().count },
          guru: { usageToday: guruCount.data().count },
          growth: { visitors, sessions, landingViews: countEvent('landing_viewed'), pricingViews: countEvent('pricing_viewed'), checkoutIntent },
          payments: {
            successful: successfulPayments, failed: failedPayments, pending: pendingPayments,
            successfulPeriod, failedPeriod, pendingPeriod,
            verifiedRevenueTotal, verifiedRevenueToday, verifiedRevenuePeriod,
            averageOrderValuePeriod: successfulPeriod > 0 ? verifiedRevenuePeriod / successfulPeriod : 0,
            successRatePeriod: (successfulPeriod + failedPeriod) > 0 ? successfulPeriod / (successfulPeriod + failedPeriod) : null,
            topProducts: Array.from(productRevenue.entries()).map(([product, revenue]) => ({ product, revenue })).sort((a,b) => b.revenue - a.revenue).slice(0,5),
          },
          subscriptions: { active: activeSubscriptions, expiring7d, expiring30d, cancelled: cancelledSubscriptions },
          tickets: ticketLiability,
          attention: { failedPayments: failedPeriod, pendingPayments: pendingPeriod, expiring7d, expiring30d },
          system: { aiProvider: envVars.ai.provider, dataSource: 'canonical', analyticsEventStore: 'analyticsEvents' },
        },
      })
    } catch (error: any) {
      console.error('Dashboard stats error:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 })
    }
  }, 'payments.read')(request)
}
