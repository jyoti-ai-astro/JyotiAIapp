import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function serializeDate(value: any) {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

      try {
        const { searchParams } = new URL(req.url)
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const status = (searchParams.get('status') || 'all').trim().toLowerCase()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '100', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 100

        const snapshot = await adminDb.collection('subscriptions').limit(500).get()
        const now = new Date()
        let active = 0
        let inactive = 0
        let expired = 0
        let pending = 0

        const rows: any[] = []
        for (const doc of snapshot.docs) {
          const data = doc.data()
          const expiry = data.expiry ?? data.expiresAt ?? data.subscriptionExpiry
          const expiryDate = expiry?.toDate?.() || (expiry ? new Date(expiry) : null)
          const rawStatus = String(data.status || (data.active === true ? 'active' : 'inactive')).toLowerCase()
          const isExpired = !!expiryDate && !Number.isNaN(expiryDate.getTime()) && expiryDate <= now
          const canonicalStatus = isExpired ? 'expired' : rawStatus

          if (canonicalStatus === 'active' || canonicalStatus === 'authenticated') active += 1
          else if (canonicalStatus === 'expired' || canonicalStatus === 'completed') expired += 1
          else if (canonicalStatus === 'pending' || canonicalStatus === 'created') pending += 1
          else inactive += 1

          const userId = data.userId || doc.id
          const email = data.email || ''
          const plan = data.plan || data.planId || data.planName || ''
          const razorpaySubscriptionId = data.razorpaySubscriptionId || ''
          const haystack = `${userId} ${email} ${plan} ${razorpaySubscriptionId}`.toLowerCase()

          if (search && !haystack.includes(search)) continue
          if (status !== 'all' && canonicalStatus !== status) continue

          rows.push({
            id: doc.id,
            userId,
            email,
            plan,
            status: canonicalStatus,
            active: canonicalStatus === 'active' || canonicalStatus === 'authenticated',
            razorpaySubscriptionId,
            startedAt: serializeDate(data.startedAt ?? data.activatedAt ?? data.createdAt),
            expiresAt: serializeDate(expiry),
            cancelledAt: serializeDate(data.cancelledAt),
            updatedAt: serializeDate(data.updatedAt),
          })
        }

        rows.sort((a, b) => String(b.updatedAt || b.startedAt || '').localeCompare(String(a.updatedAt || a.startedAt || '')))

        return NextResponse.json({
          success: true,
          subscriptions: rows.slice(0, limit),
          stats: { total: snapshot.size, active, inactive, expired, pending },
        })
      } catch (error: any) {
        console.error('Admin subscriptions error:', error)
        return NextResponse.json({ error: 'Failed to list subscriptions' }, { status: 500 })
      }
    },
    'payments.read'
  )(request)
}
