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

function iso(value: any): string | null { return toDate(value)?.toISOString() || null }

function attribution(data: any) {
  const touch = data?.attribution?.latestTouch || data?.attribution?.firstTouch || data?.attribution || {}
  return {
    source: touch.utm_source || data.utm_source || '',
    medium: touch.utm_medium || data.utm_medium || '',
    campaign: touch.utm_campaign || data.utm_campaign || '',
    landingPath: touch.landingPath || data.landingPath || '',
  }
}

function rangeStart(range: string): Date | null {
  const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 0
  if (!days) return null
  const start = new Date()
  if (range === 'today') start.setHours(0, 0, 0, 0)
  else start.setTime(Date.now() - days * 24 * 60 * 60 * 1000)
  return start
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

      try {
        const { searchParams } = new URL(req.url)
        const status = (searchParams.get('status') || '').trim().toLowerCase()
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const range = (searchParams.get('range') || '30d').trim().toLowerCase()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '75', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 75
        const start = rangeStart(range)

        let query: any = adminDb.collection('payments')
        if (status && status !== 'all') query = query.where('status', '==', status)
        const snapshot = await query.orderBy('createdAt', 'desc').limit(search ? Math.min(limit * 4, 300) : limit * 2).get()

        const payments = snapshot.docs
          .map((doc: any) => {
            const data = doc.data()
            return {
              id: doc.id,
              userId: data.userId || data.uid || '',
              email: data.email || data.userEmail || '',
              status: data.status || 'unknown',
              type: data.type || data.paymentType || '',
              productId: data.productId || data.planId || data.plan || '',
              amount: Number(data.amount || 0),
              currency: data.currency || 'INR',
              razorpayPaymentId: data.razorpayPaymentId || data.paymentId || '',
              razorpayOrderId: data.razorpayOrderId || data.orderId || '',
              razorpaySubscriptionId: data.razorpaySubscriptionId || '',
              createdAt: iso(data.createdAt),
              verifiedAt: iso(data.verifiedAt || data.completedAt),
              failureCode: data.failureCode || data.errorCode || '',
              failureDescription: data.failureDescription || data.errorDescription || data.error || '',
              attribution: attribution(data),
            }
          })
          .filter((payment: any) => {
            const createdAt = toDate(payment.createdAt)
            if (start && (!createdAt || createdAt < start)) return false
            if (!search) return true
            return [payment.id, payment.userId, payment.email, payment.razorpayPaymentId, payment.razorpayOrderId, payment.razorpaySubscriptionId, payment.productId, payment.attribution?.source, payment.attribution?.campaign]
              .some((value) => String(value || '').toLowerCase().includes(search))
          })
          .slice(0, limit)

        const allPaymentsSnapshot = await adminDb.collection('payments').get()
        let verifiedRevenue = 0
        let successfulPayments = 0
        let failedPayments = 0
        let pendingPayments = 0
        const products: Record<string, { revenue: number; count: number }> = {}
        const sources: Record<string, { revenue: number; count: number }> = {}

        allPaymentsSnapshot.forEach((doc) => {
          const data = doc.data()
          const createdAt = toDate(data.createdAt)
          if (start && (!createdAt || createdAt < start)) return
          const paymentStatus = String(data.status || '').toLowerCase()
          if (paymentStatus === 'success') {
            const amount = Number(data.amount || 0)
            const safeAmount = Number.isFinite(amount) ? amount : 0
            verifiedRevenue += safeAmount
            successfulPayments += 1
            const product = String(data.productId || data.planId || data.plan || data.type || 'Unclassified')
            products[product] ||= { revenue: 0, count: 0 }
            products[product].revenue += safeAmount
            products[product].count += 1
            const source = attribution(data).source || 'Direct / unknown'
            sources[source] ||= { revenue: 0, count: 0 }
            sources[source].revenue += safeAmount
            sources[source].count += 1
          } else if (paymentStatus === 'failed') failedPayments += 1
          else if (paymentStatus === 'pending' || paymentStatus === 'created') pendingPayments += 1
        })

        const attempts = successfulPayments + failedPayments
        const averageOrderValue = successfulPayments ? verifiedRevenue / successfulPayments : 0
        const successRate = attempts ? (successfulPayments / attempts) * 100 : 0

        return NextResponse.json({
          success: true,
          payments,
          stats: { verifiedRevenue, successfulPayments, failedPayments, pendingPayments, averageOrderValue, successRate },
          breakdowns: {
            products: Object.entries(products).map(([name, value]) => ({ name, ...value })).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
            sources: Object.entries(sources).map(([name, value]) => ({ name, ...value })).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
          },
          filters: { status: status || 'all', search, range },
        })
      } catch (error) {
        console.error('List payments error:', error)
        return NextResponse.json({ error: 'Failed to list payments' }, { status: 500 })
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
        if (!paymentId || !signature || !orderId) return NextResponse.json({ error: 'paymentId, signature, and orderId are required' }, { status: 400 })
        const razorpayKeySecret = (await import('@/lib/env/env.mjs')).envVars.razorpay.keySecret
        if (!razorpayKeySecret) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
        const crypto = await import('crypto')
        const generatedSignature = crypto.createHmac('sha256', razorpayKeySecret).update(`${orderId}|${paymentId}`).digest('hex')
        const provided = Buffer.from(String(signature))
        const expected = Buffer.from(generatedSignature)
        const isValid = provided.length === expected.length && crypto.timingSafeEqual(provided, expected)
        return NextResponse.json({ success: true, isValid })
      } catch (error) {
        console.error('Verify payment error:', error)
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
      }
    },
    'payments.read'
  )(request)
}
