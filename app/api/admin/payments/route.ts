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

function toIso(value: any): string | null {
  return toDate(value)?.toISOString() || null
}

function isCanonicalPaymentDoc(doc: any, collectionName: string) {
  return doc.ref.parent.id === collectionName && doc.ref.parent.parent?.parent?.id === 'payments'
}

function normalizeStatus(value: unknown) {
  const status = String(value || '').toLowerCase()
  if (status === 'completed' || status === 'success') return 'success'
  if (status === 'failed') return 'failed'
  if (status === 'pending') return 'pending'
  if (status === 'created') return 'created'
  return status || 'unknown'
}

function rangeStart(range: string): Date | null {
  const now = new Date()
  if (range === 'all') return null
  if (range === 'today') {
    now.setHours(0, 0, 0, 0)
    return now
  }
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  return new Date(Date.now() - days * 86_400_000)
}

/**
 * Canonical payment ledger for Mission Control.
 * Current checkout flows persist orders below payments/{uid}/orders and
 * payments/{uid}/one_time_orders. Only completed/provider-verified orders
 * contribute to revenue metrics.
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const requestedStatus = (searchParams.get('status') || 'all').trim().toLowerCase()
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const range = (searchParams.get('range') || '30d').trim().toLowerCase()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 50
        const since = rangeStart(range)

        const [ordersSnap, oneTimeOrdersSnap] = await Promise.all([
          adminDb.collectionGroup('orders').limit(5000).get(),
          adminDb.collectionGroup('one_time_orders').limit(5000).get(),
        ])

        const rawRows = [
          ...ordersSnap.docs
            .filter((doc: any) => isCanonicalPaymentDoc(doc, 'orders'))
            .map((doc: any) => ({ doc, kind: 'report_or_legacy_order' as const })),
          ...oneTimeOrdersSnap.docs
            .filter((doc: any) => isCanonicalPaymentDoc(doc, 'one_time_orders'))
            .map((doc: any) => ({ doc, kind: 'one_time' as const })),
        ]

        const normalized = rawRows.map(({ doc, kind }) => {
          const data = doc.data()
          const userId = doc.ref.parent.parent?.id || data.userId || null
          const status = normalizeStatus(data.status)
          const createdAt = toDate(data.completedAt ?? data.createdAt)
          const amount = Number(data.amount || 0)
          const safeAmount = Number.isFinite(amount) ? amount : 0
          const source = String(
            data.attribution?.latestTouch?.utm_source ||
            data.utmSource ||
            data.utm_source ||
            data.source ||
            'Direct / unknown'
          )
          const medium = data.attribution?.latestTouch?.utm_medium || data.utmMedium || data.utm_medium || null
          const campaign = data.attribution?.latestTouch?.utm_campaign || data.utmCampaign || data.utm_campaign || null

          return {
            id: data.paymentId || data.orderId || doc.id,
            userId,
            email: data.email || null,
            amount: safeAmount,
            status,
            rawStatus: String(data.status || ''),
            type: kind === 'one_time' ? 'one_time' : String(data.reportType || data.type || data.planName || 'order'),
            productId: data.productId || data.productIdInternal || data.planId || data.planName || null,
            createdAt: createdAt?.toISOString() || toIso(data.createdAt),
            completedAt: toIso(data.completedAt),
            razorpayPaymentId: data.paymentId || data.razorpayPaymentId || null,
            razorpayOrderId: data.orderId || doc.id,
            razorpaySubscriptionId: data.razorpaySubscriptionId || null,
            failureCode: data.failureCode || data.errorCode || null,
            failureDescription: data.failureDescription || data.errorDescription || data.error || null,
            attribution: { source, medium, campaign },
          }
        })

        const inWindow = normalized.filter((payment) => {
          if (!since) return true
          const createdAt = payment.createdAt ? new Date(payment.createdAt) : null
          return !!createdAt && createdAt >= since
        })

        let verifiedRevenue = 0
        let successfulPayments = 0
        let failedPayments = 0
        let pendingPayments = 0
        const products = new Map<string, { count: number; revenue: number }>()
        const sources = new Map<string, { count: number; revenue: number }>()

        inWindow.forEach((payment) => {
          if (payment.status === 'success') {
            verifiedRevenue += payment.amount
            successfulPayments += 1

            const productName = String(payment.productId || payment.type || 'Unmapped')
            const product = products.get(productName) || { count: 0, revenue: 0 }
            product.count += 1
            product.revenue += payment.amount
            products.set(productName, product)

            const sourceName = payment.attribution.source || 'Direct / unknown'
            const source = sources.get(sourceName) || { count: 0, revenue: 0 }
            source.count += 1
            source.revenue += payment.amount
            sources.set(sourceName, source)
          } else if (payment.status === 'failed') {
            failedPayments += 1
          } else if (payment.status === 'pending' || payment.status === 'created') {
            pendingPayments += 1
          }
        })

        const attempts = successfulPayments + failedPayments + pendingPayments
        const stats = {
          verifiedRevenue,
          successfulPayments,
          failedPayments,
          pendingPayments,
          averageOrderValue: successfulPayments ? verifiedRevenue / successfulPayments : 0,
          successRate: attempts ? (successfulPayments / attempts) * 100 : 0,
        }

        let visible = inWindow.filter((payment) => {
          if (requestedStatus !== 'all') {
            if (requestedStatus === 'pending') {
              if (payment.status !== 'pending') return false
            } else if (payment.status !== requestedStatus) {
              return false
            }
          }

          if (search) {
            const haystack = [
              payment.id,
              payment.userId,
              payment.email,
              payment.razorpayPaymentId,
              payment.razorpayOrderId,
              payment.type,
              payment.productId,
              payment.attribution.source,
              payment.attribution.medium,
              payment.attribution.campaign,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
            if (!haystack.includes(search)) return false
          }

          return true
        })

        visible.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
        visible = visible.slice(0, limit)

        // Enrich only the visible rows with user email; do not scan the entire users collection.
        const missingEmailUserIds = Array.from(new Set(visible.filter((row) => !row.email && row.userId).map((row) => row.userId as string)))
        if (missingEmailUserIds.length) {
          const userEntries = await Promise.all(
            missingEmailUserIds.map(async (uid) => {
              const snap = await adminDb!.collection('users').doc(uid).get()
              return [uid, snap.exists ? snap.data()?.email || null : null] as const
            })
          )
          const emailByUser = new Map(userEntries)
          visible = visible.map((row) => ({ ...row, email: row.email || (row.userId ? emailByUser.get(row.userId) || null : null) }))
        }

        return NextResponse.json({
          success: true,
          payments: visible,
          stats,
          breakdowns: {
            products: Array.from(products.entries())
              .map(([name, value]) => ({ name, ...value }))
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 12),
            sources: Array.from(sources.entries())
              .map(([name, value]) => ({ name, ...value }))
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 12),
          },
          filters: { search, status: requestedStatus, range },
          contract: {
            stores: ['payments/{uid}/orders', 'payments/{uid}/one_time_orders'],
            verifiedStatus: 'completed',
          },
        })
      } catch (error: any) {
        console.error('List payments error:', error)
        return NextResponse.json({ error: error.message || 'Failed to list payments' }, { status: 500 })
      }
    },
    'payments.read'
  )(request)
}

/**
 * Verify Payment Signature API
 * Milestone 10 - Step 5
 */
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

        const crypto = require('crypto')
        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(orderId + '|' + paymentId)
          .digest('hex')

        return NextResponse.json({
          success: true,
          isValid: generatedSignature === signature,
        })
      } catch (error: any) {
        console.error('Verify payment error:', error)
        return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 })
      }
    },
    'payments.read'
  )(request)
}
