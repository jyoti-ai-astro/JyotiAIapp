import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { Timestamp } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

function toDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function isCanonicalPaymentDoc(doc: any, collectionName: string) {
  return doc.ref.parent.id === collectionName && doc.ref.parent.parent?.parent?.id === 'payments'
}

function normalizeSubscription(data: any, userId: string, source: 'current' | 'legacy') {
  const status = String(data.status || (data.active === true ? 'active' : 'inactive')).toLowerCase()
  const expiry = toDate(data.expiryDate ?? data.expiry ?? data.expiresAt ?? data.subscriptionExpiry)
  return { data, userId, status, expiry, source }
}

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req) => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

    try {
      const { searchParams } = new URL(req.url)
      const days = Math.min(90, Math.max(1, Number.parseInt(searchParams.get('days') || '30', 10) || 30))
      const since = new Date(Date.now() - days * 86_400_000)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [
        usersCount,
        newUsersCount,
        newUsersTodayCount,
        ordersSnap,
        oneTimeOrdersSnap,
        legacySubscriptionsSnap,
        nestedSubscriptionsSnap,
        analyticsSnap,
      ] = await Promise.all([
        adminDb.collection('users').count().get(),
        adminDb.collection('users').where('createdAt', '>=', Timestamp.fromDate(since)).count().get(),
        adminDb.collection('users').where('createdAt', '>=', Timestamp.fromDate(todayStart)).count().get(),
        adminDb.collectionGroup('orders').limit(5000).get(),
        adminDb.collectionGroup('one_time_orders').limit(5000).get(),
        adminDb.collection('subscriptions').limit(5000).get(),
        adminDb.collectionGroup('subscriptions').limit(5000).get(),
        adminDb.collection('analyticsEvents').limit(5000).get().catch(() => null),
      ])

      const paymentDocs = [
        ...ordersSnap.docs.filter((doc: any) => isCanonicalPaymentDoc(doc, 'orders')),
        ...oneTimeOrdersSnap.docs.filter((doc: any) => isCanonicalPaymentDoc(doc, 'one_time_orders')),
      ]

      let verifiedRevenue = 0
      let verifiedRevenueToday = 0
      let successful = 0
      let failed = 0
      let pending = 0
      const products = new Map<string, { purchases: number; revenue: number }>()

      paymentDocs.forEach((doc: any) => {
        const data = doc.data()
        const status = String(data.status || '').toLowerCase()
        const created = toDate(data.completedAt ?? data.createdAt)
        if (created && created < since) return

        if (status === 'completed' || status === 'success') {
          const amount = Number(data.amount || 0)
          const safeAmount = Number.isFinite(amount) ? amount : 0
          verifiedRevenue += safeAmount
          successful += 1
          if (created && created >= todayStart) verifiedRevenueToday += safeAmount

          const product = String(data.productId || data.productIdInternal || data.planId || data.planName || data.reportType || 'Unmapped')
          const current = products.get(product) || { purchases: 0, revenue: 0 }
          current.purchases += 1
          current.revenue += safeAmount
          products.set(product, current)
        } else if (status === 'failed') {
          failed += 1
        } else if (status === 'pending' || status === 'created') {
          pending += 1
        }
      })

      const subscriptionsByUser = new Map<string, ReturnType<typeof normalizeSubscription>>()

      legacySubscriptionsSnap.docs.forEach((doc: any) => {
        subscriptionsByUser.set(doc.id, normalizeSubscription(doc.data(), doc.id, 'legacy'))
      })

      nestedSubscriptionsSnap.docs
        .filter((doc: any) => doc.id === 'current' && doc.ref.parent.parent?.parent?.id === 'users')
        .forEach((doc: any) => {
          const userId = doc.ref.parent.parent?.id
          if (userId) subscriptionsByUser.set(userId, normalizeSubscription(doc.data(), userId, 'current'))
        })

      let activeSubscriptions = 0
      let expiring7d = 0
      let expiring30d = 0
      let cancelled = 0
      const now = new Date()
      const dayMs = 86_400_000

      subscriptionsByUser.forEach(({ data, status, expiry }) => {
        const isExpired = !!expiry && expiry <= now
        const active = !isExpired && (data.active === true || status === 'active' || status === 'authenticated')

        if (active) {
          activeSubscriptions += 1
          if (expiry) {
            const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / dayMs)
            if (daysUntil >= 0 && daysUntil <= 7) expiring7d += 1
            if (daysUntil >= 0 && daysUntil <= 30) expiring30d += 1
          }
        }

        if (status === 'cancelled' || status === 'canceled') cancelled += 1
      })

      const events = analyticsSnap
        ? analyticsSnap.docs.map((doc) => doc.data()).filter((event) => {
            const occurred = toDate(event.receivedAt || event.occurredAt)
            return !occurred || occurred >= since
          })
        : []

      const countEvent = (name: string) => events.filter((event) => event.eventName === name).length
      const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean)).size
      const visitors = new Set(events.map((event) => event.anonymousId).filter(Boolean)).size
      const checkoutIntent = countEvent('checkout_started') + countEvent('report_purchase_started')
      const paymentAttempts = successful + failed + pending
      const averageOrderValue = successful ? verifiedRevenue / successful : 0
      const successRate = paymentAttempts ? successful / paymentAttempts : 0
      const topProducts = Array.from(products.entries())
        .map(([product, value]) => ({ product, ...value }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)

      return NextResponse.json({
        success: true,
        days,
        stats: {
          users: {
            total: usersCount.data().count,
            newPeriod: newUsersCount.data().count,
            newInWindow: newUsersCount.data().count,
            newToday: newUsersTodayCount.data().count,
          },
          payments: {
            verifiedRevenuePeriod: verifiedRevenue,
            verifiedRevenue,
            verifiedRevenueToday,
            successfulPeriod: successful,
            successful,
            failedPeriod: failed,
            failed,
            pendingPeriod: pending,
            pending,
            averageOrderValuePeriod: averageOrderValue,
            averageOrderValue,
            successRatePeriod: successRate,
            successRate,
            topProducts,
          },
          subscriptions: {
            active: activeSubscriptions,
            expiring7d,
            expiring30d,
            cancelled,
          },
          growth: {
            visitors,
            sessions,
            landingViews: countEvent('landing_viewed'),
            pricingViews: countEvent('pricing_viewed'),
            checkoutIntent,
          },
          attention: {
            failedPayments: failed,
            pendingPayments: pending,
            expiring7d,
            expiringSubscriptions7d: expiring7d,
          },
          system: {
            dataSource: 'canonical',
            paymentStores: ['payments/{uid}/orders', 'payments/{uid}/one_time_orders'],
            subscriptionStores: ['users/{uid}/subscriptions/current', 'subscriptions/{uid} (legacy)'],
            analyticsEventStore: 'analyticsEvents',
            financialAuthority: 'provider-verified completed payments only',
          },
        },
      })
    } catch (error) {
      console.error('Mission Control overview error:', error)
      return NextResponse.json({ error: 'Failed to load Mission Control overview' }, { status: 500 })
    }
  }, 'payments.read')(request)
}
