export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

function toIso(value: any) {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  return withAdminAuth(
    async () => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { uid } = params
        const userRef = adminDb.collection('users').doc(uid)
        const [userSnap, subscriptionSnap, reportsSnapshot, paymentsSnapshot] = await Promise.all([
          userRef.get(),
          adminDb.collection('subscriptions').doc(uid).get(),
          adminDb.collection('reports').doc(uid).collection('items').orderBy('createdAt', 'desc').limit(20).get(),
          adminDb.collection('payments').where('userId', '==', uid).orderBy('createdAt', 'desc').limit(20).get(),
        ])

        if (!userSnap.exists) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const data = userSnap.data() || {}
        const subscription = subscriptionSnap.exists ? subscriptionSnap.data() || {} : null

        const reports = reportsSnapshot.docs.map((doc) => {
          const report = doc.data()
          return {
            id: doc.id,
            type: report.type || report.reportType || null,
            title: report.title || report.name || null,
            status: report.status || null,
            createdAt: toIso(report.createdAt),
          }
        })

        const payments = paymentsSnapshot.docs.map((doc) => {
          const payment = doc.data()
          return {
            id: doc.id,
            paymentId: payment.razorpayPaymentId || payment.paymentId || null,
            orderId: payment.razorpayOrderId || payment.orderId || null,
            amount: Number(payment.amount || 0),
            currency: payment.currency || 'INR',
            status: payment.status || null,
            type: payment.type || null,
            productId: payment.productId || null,
            createdAt: toIso(payment.createdAt),
          }
        })

        return NextResponse.json({
          success: true,
          user: {
            uid,
            email: data.email || '',
            displayName: data.name || data.displayName || '',
            createdAt: toIso(data.createdAt),
            lastLoginAt: toIso(data.lastLoginAt),
            blocked: data.blocked === true,
            onboardingComplete: data.onboardingComplete === true,
            tickets: {
              aiGuruTickets: Number(data.aiGuruTickets || 0),
              kundaliTickets: Number(data.kundaliTickets || 0),
              lifetimePredictions: Number(data.lifetimePredictions || 0),
            },
            subscription: subscription
              ? {
                  status: subscription.status || null,
                  planId: subscription.planId || subscription.plan || null,
                  active: subscription.active === true || subscription.status === 'active',
                  expiresAt: toIso(subscription.expiry || subscription.expiresAt || subscription.subscriptionExpiry),
                  razorpaySubscriptionId: subscription.razorpaySubscriptionId || null,
                }
              : null,
            reports,
            payments,
          },
        })
      } catch (error: any) {
        console.error('Get user error:', error)
        return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
      }
    },
    'users.read'
  )(request)
}

export async function PATCH(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json(
      {
        error: 'User mutations are retired from this generic endpoint. Use dedicated audited actions.',
        code: 'ADMIN_USER_MUTATION_RETIRED',
      },
      { status: 410 }
    ),
    'users.write'
  )(request)
}
