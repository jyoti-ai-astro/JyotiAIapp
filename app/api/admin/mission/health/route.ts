import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

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

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

    try {
      const [legacySubscriptionsSnap, nestedSubscriptionsSnap, ordersSnap, oneTimeOrdersSnap] = await Promise.all([
        adminDb.collection('subscriptions').limit(5000).get(),
        adminDb.collectionGroup('subscriptions').limit(5000).get(),
        adminDb.collectionGroup('orders').limit(5000).get(),
        adminDb.collectionGroup('one_time_orders').limit(5000).get(),
      ])

      const subscriptionsByUser = new Map<string, any>()
      legacySubscriptionsSnap.docs.forEach((doc: any) => {
        subscriptionsByUser.set(doc.id, doc.data())
      })
      nestedSubscriptionsSnap.docs
        .filter((doc: any) => doc.id === 'current' && doc.ref.parent.parent?.parent?.id === 'users')
        .forEach((doc: any) => {
          const userId = doc.ref.parent.parent?.id
          if (userId) subscriptionsByUser.set(userId, doc.data())
        })

      const now = new Date()
      let active = 0
      let pending = 0
      let cancelled = 0
      let expired = 0

      subscriptionsByUser.forEach((data) => {
        const status = String(data.status || (data.active === true ? 'active' : '')).toLowerCase()
        const expiry = toDate(data.expiryDate ?? data.expiry ?? data.expiresAt ?? data.subscriptionExpiry)

        if (expiry && expiry <= now) expired += 1
        else if (data.active === true || status === 'active' || status === 'authenticated') active += 1
        else if (status === 'pending' || status === 'created') pending += 1
        else if (status === 'cancelled' || status === 'canceled') cancelled += 1
      })

      const paymentDocs = [
        ...ordersSnap.docs.filter((doc: any) => isCanonicalPaymentDoc(doc, 'orders')),
        ...oneTimeOrdersSnap.docs.filter((doc: any) => isCanonicalPaymentDoc(doc, 'one_time_orders')),
      ]

      let paymentFailures = 0
      let paymentPending = 0
      paymentDocs.forEach((doc: any) => {
        const status = String(doc.data().status || '').toLowerCase()
        if (status === 'failed') paymentFailures += 1
        if (status === 'pending' || status === 'created') paymentPending += 1
      })

      return NextResponse.json({
        success: true,
        status: 'operational',
        totalActive: active,
        totalPending: pending,
        totalCancelled: cancelled,
        totalExpired: expired,
        subscriptions: { active, pending, cancelled, expired },
        payments: { failed: paymentFailures, pending: paymentPending },
        contract: {
          paymentStores: ['payments/{uid}/orders', 'payments/{uid}/one_time_orders'],
          subscriptionStores: ['users/{uid}/subscriptions/current', 'subscriptions/{uid} (legacy)'],
        },
        checkedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Mission Control health error:', error)
      return NextResponse.json({ error: 'Failed to load Mission Control health' }, { status: 500 })
    }
  }, 'logs.read')(request)
}
