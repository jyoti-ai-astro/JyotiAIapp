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

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

    try {
      const [subscriptionsSnap, paymentsSnap] = await Promise.all([
        adminDb.collection('subscriptions').limit(2000).get(),
        adminDb.collection('payments').limit(2000).get(),
      ])

      const now = new Date()
      let active = 0
      let pending = 0
      let cancelled = 0
      let expired = 0

      subscriptionsSnap.forEach((doc) => {
        const data = doc.data()
        const status = String(data.status || '').toLowerCase()
        const expiry = toDate(data.expiry ?? data.expiresAt ?? data.subscriptionExpiry)

        if (expiry && expiry <= now) expired += 1
        else if (data.active === true || status === 'active' || status === 'authenticated') active += 1
        else if (status === 'pending' || status === 'created') pending += 1
        else if (status === 'cancelled' || status === 'canceled') cancelled += 1
      })

      let paymentFailures = 0
      let paymentPending = 0
      paymentsSnap.forEach((doc) => {
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
        checkedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Mission Control health error:', error)
      return NextResponse.json({ error: 'Failed to load Mission Control health' }, { status: 500 })
    }
  }, 'logs.read')(request)
}
