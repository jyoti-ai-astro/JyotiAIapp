import { NextRequest, NextResponse } from 'next/server'
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
    async (req) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50

        let query: any = adminDb.collection('payments')
        if (status) query = query.where('status', '==', status)

        const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get()
        const payments = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))

        const [allPayments, subscriptionsSnapshot] = await Promise.all([
          adminDb.collection('payments').get(),
          adminDb.collection('subscriptions').get(),
        ])

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let verifiedRevenueTotal = 0
        let verifiedRevenueToday = 0
        let successfulPayments = 0
        let failedPayments = 0

        allPayments.forEach((doc) => {
          const data = doc.data()
          if (data.status === 'success') {
            const amount = Number(data.amount || 0)
            verifiedRevenueTotal += Number.isFinite(amount) ? amount : 0
            successfulPayments += 1
            const createdAt = toDate(data.createdAt)
            if (createdAt && createdAt >= today) {
              verifiedRevenueToday += Number.isFinite(amount) ? amount : 0
            }
          } else if (data.status === 'failed') {
            failedPayments += 1
          }
        })

        const now = new Date()
        let activeSubscriptions = 0
        subscriptionsSnapshot.forEach((doc) => {
          const data = doc.data()
          const expiry = toDate(data.expiry ?? data.expiresAt ?? data.subscriptionExpiry)
          const activeByStatus = data.status === 'active' || data.status === 'authenticated' || data.active === true
          if (activeByStatus && (!expiry || expiry > now)) activeSubscriptions += 1
        })

        return NextResponse.json({
          success: true,
          payments,
          stats: {
            verifiedRevenueTotal,
            verifiedRevenueToday,
            successfulPayments,
            failedPayments,
            activeSubscriptions,
          },
        })
      } catch (error: any) {
        console.error('List payments error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to list payments' },
          { status: 500 }
        )
      }
    },
    'payments.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      try {
        const { paymentId, signature, orderId } = await req.json()
        if (!paymentId || !signature || !orderId) {
          return NextResponse.json(
            { error: 'paymentId, signature, and orderId are required' },
            { status: 400 }
          )
        }

        const razorpayKeySecret = (await import('@/lib/env/env.mjs')).envVars.razorpay.keySecret
        if (!razorpayKeySecret) {
          return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
        }

        const crypto = await import('crypto')
        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${orderId}|${paymentId}`)
          .digest('hex')

        const provided = Buffer.from(String(signature))
        const expected = Buffer.from(generatedSignature)
        const isValid = provided.length === expected.length && crypto.timingSafeEqual(provided, expected)

        return NextResponse.json({ success: true, isValid })
      } catch (error: any) {
        console.error('Verify payment error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to verify payment' },
          { status: 500 }
        )
      }
    },
    'payments.read'
  )(request)
}
