export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

function toDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIso(value: any) { return toDate(value)?.toISOString() || null }

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  return withAdminAuth(async () => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

    try {
      const { uid } = params
      const userRef = adminDb.collection('users').doc(uid)
      const [userSnap, subscriptionSnap, reportsSnapshot, paymentsSnapshot, analyticsSnapshot] = await Promise.all([
        userRef.get(),
        adminDb.collection('subscriptions').doc(uid).get(),
        adminDb.collection('reports').doc(uid).collection('items').orderBy('createdAt', 'desc').limit(20).get(),
        adminDb.collection('payments').where('userId', '==', uid).get(),
        adminDb.collection('analyticsEvents').where('userUid', '==', uid).limit(300).get().catch(() => null),
      ])

      if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const data = userSnap.data() || {}
      const subscription = subscriptionSnap.exists ? subscriptionSnap.data() || {} : null
      const reports = reportsSnapshot.docs.map((doc) => {
        const report = doc.data()
        return { id: doc.id, type: report.type || report.reportType || null, title: report.title || report.name || null, status: report.status || null, createdAt: toIso(report.createdAt) }
      })

      let lifetimeValue = 0
      let successfulPurchases = 0
      let failedPayments = 0
      let firstPaidAt: Date | null = null
      let lastPaidAt: Date | null = null
      const products = new Map<string, { purchases: number; revenue: number }>()
      const allPayments = paymentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as any }))

      for (const payment of allPayments) {
        const created = toDate(payment.createdAt)
        if (payment.status === 'success') {
          const amount = Number(payment.amount || 0)
          const safeAmount = Number.isFinite(amount) ? amount : 0
          lifetimeValue += safeAmount
          successfulPurchases += 1
          if (created && (!firstPaidAt || created < firstPaidAt)) firstPaidAt = created
          if (created && (!lastPaidAt || created > lastPaidAt)) lastPaidAt = created
          const product = String(payment.productId || payment.planId || payment.type || 'Unmapped')
          const current = products.get(product) || { purchases: 0, revenue: 0 }
          current.purchases += 1
          current.revenue += safeAmount
          products.set(product, current)
        } else if (payment.status === 'failed') failedPayments += 1
      }

      const payments = allPayments
        .sort((a: any, b: any) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
        .slice(0, 20)
        .map((payment: any) => ({
          id: payment.id,
          paymentId: payment.razorpayPaymentId || payment.paymentId || null,
          orderId: payment.razorpayOrderId || payment.orderId || null,
          amount: Number(payment.amount || 0), currency: payment.currency || 'INR', status: payment.status || null,
          type: payment.type || null, productId: payment.productId || payment.planId || null,
          source: payment.utmSource || payment.utm_source || payment.source || payment.attribution?.latestTouch?.utm_source || null,
          campaign: payment.utmCampaign || payment.utm_campaign || payment.attribution?.latestTouch?.utm_campaign || null,
          createdAt: toIso(payment.createdAt), verifiedAt: toIso(payment.verifiedAt || payment.completedAt),
        }))

      const analyticsEvents = analyticsSnapshot ? analyticsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) : []
      analyticsEvents.sort((a: any, b: any) => String(a.occurredAt || '').localeCompare(String(b.occurredAt || '')))
      const firstEvent: any = analyticsEvents[0] || null
      const lastEvent: any = analyticsEvents[analyticsEvents.length - 1] || null
      const attribution = firstEvent?.attribution?.firstTouch || lastEvent?.attribution?.firstTouch || null
      const latestAttribution = lastEvent?.attribution?.latestTouch || attribution
      const recentActivity = analyticsEvents.slice(-20).reverse().map((event: any) => ({
        id: event.id, eventName: event.eventName || 'unknown', occurredAt: event.occurredAt || toIso(event.receivedAt), currentPath: event.currentPath || null, sessionId: event.sessionId || null,
      }))

      return NextResponse.json({
        success: true,
        user: {
          uid,
          email: data.email || '',
          displayName: data.name || data.displayName || '',
          createdAt: toIso(data.createdAt), lastLoginAt: toIso(data.lastLoginAt),
          blocked: data.blocked === true, onboardingComplete: data.onboardingComplete === true,
          phone: data.phone || data.phoneNumber || null,
          tickets: { aiGuruTickets: Number(data.aiGuruTickets || 0), kundaliTickets: Number(data.kundaliTickets || 0), lifetimePredictions: Number(data.lifetimePredictions || 0) },
          subscription: subscription ? {
            status: subscription.status || null, planId: subscription.planId || subscription.plan || null,
            active: subscription.active === true || subscription.status === 'active',
            startedAt: toIso(subscription.startedAt || subscription.activatedAt || subscription.createdAt),
            expiresAt: toIso(subscription.expiry || subscription.expiresAt || subscription.subscriptionExpiry),
            cancelledAt: toIso(subscription.cancelledAt), razorpaySubscriptionId: subscription.razorpaySubscriptionId || null,
          } : null,
          commerce: {
            lifetimeValue, successfulPurchases, failedPayments,
            averageOrderValue: successfulPurchases ? lifetimeValue / successfulPurchases : 0,
            firstPaidAt: firstPaidAt?.toISOString() || null, lastPaidAt: lastPaidAt?.toISOString() || null,
            products: Array.from(products.entries()).map(([product, value]) => ({ product, ...value })).sort((a,b) => b.revenue - a.revenue),
          },
          acquisition: {
            firstTouch: attribution ? {
              source: attribution.utm_source || (attribution.referrer ? 'Referral' : 'Direct / unknown'), medium: attribution.utm_medium || null,
              campaign: attribution.utm_campaign || null, landingPath: attribution.landingPath || null, referrer: attribution.referrer || null, capturedAt: attribution.capturedAt || null,
            } : null,
            latestTouch: latestAttribution ? {
              source: latestAttribution.utm_source || (latestAttribution.referrer ? 'Referral' : 'Direct / unknown'), medium: latestAttribution.utm_medium || null,
              campaign: latestAttribution.utm_campaign || null, landingPath: latestAttribution.landingPath || null, referrer: latestAttribution.referrer || null, capturedAt: latestAttribution.capturedAt || null,
            } : null,
          },
          analytics: { eventCount: analyticsEvents.length, firstActivityAt: firstEvent?.occurredAt || null, lastActivityAt: lastEvent?.occurredAt || null, recentActivity },
          reports,
          payments,
        },
      })
    } catch (error: any) {
      console.error('Get user error:', error)
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
    }
  }, 'users.read')(request)
}

export async function PATCH(request: NextRequest) {
  return withAdminAuth(async () => NextResponse.json({ error: 'User mutations are retired from this generic endpoint. Use dedicated audited actions.', code: 'ADMIN_USER_MUTATION_RETIRED' }, { status: 410 }), 'users.write')(request)
}
