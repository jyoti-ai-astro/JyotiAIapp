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

function serializeDate(value: any) {
  return toDate(value)?.toISOString() || null
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

      try {
        const { searchParams } = new URL(req.url)
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const status = (searchParams.get('status') || 'all').trim().toLowerCase()
        const risk = (searchParams.get('risk') || 'all').trim().toLowerCase()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '100', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 100

        const [legacySnap, nestedSnap] = await Promise.all([
          adminDb.collection('subscriptions').limit(5000).get(),
          adminDb.collectionGroup('subscriptions').limit(5000).get(),
        ])

        const records = new Map<string, { id: string; userId: string; data: any; source: 'legacy' | 'current' }>()

        legacySnap.docs.forEach((doc: any) => {
          records.set(doc.id, { id: doc.id, userId: doc.id, data: doc.data(), source: 'legacy' })
        })

        nestedSnap.docs
          .filter((doc: any) => doc.id === 'current' && doc.ref.parent.parent?.parent?.id === 'users')
          .forEach((doc: any) => {
            const userId = doc.ref.parent.parent?.id
            if (userId) records.set(userId, { id: doc.id, userId, data: doc.data(), source: 'current' })
          })

        const now = new Date()
        const dayMs = 86_400_000
        const stats = {
          total: records.size,
          active: 0,
          inactive: 0,
          expired: 0,
          pending: 0,
          cancelled: 0,
          expiring7d: 0,
          expiring30d: 0,
          noExpiry: 0,
        }
        const rows: any[] = []

        for (const record of records.values()) {
          const { id, userId, data, source } = record
          const expiry = data.expiryDate ?? data.expiry ?? data.expiresAt ?? data.subscriptionExpiry
          const expiryDate = toDate(expiry)
          const rawStatus = String(data.status || (data.active === true ? 'active' : 'inactive')).toLowerCase()
          const isExpired = !!expiryDate && expiryDate <= now
          const canonicalStatus = isExpired ? 'expired' : rawStatus
          const active = canonicalStatus === 'active' || canonicalStatus === 'authenticated'
          const cancelled = canonicalStatus === 'cancelled' || canonicalStatus === 'canceled'
          const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / dayMs) : null

          if (active) stats.active += 1
          else if (canonicalStatus === 'expired' || canonicalStatus === 'completed') stats.expired += 1
          else if (canonicalStatus === 'pending' || canonicalStatus === 'created') stats.pending += 1
          else if (cancelled) stats.cancelled += 1
          else stats.inactive += 1

          if (active && daysUntilExpiry == null) stats.noExpiry += 1
          if (active && daysUntilExpiry != null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7) stats.expiring7d += 1
          if (active && daysUntilExpiry != null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30) stats.expiring30d += 1

          const email = data.email || ''
          const plan = data.plan || data.planId || data.planName || data.subscriptionProductId || ''
          const razorpaySubscriptionId = data.razorpaySubscriptionId || data.providerSubscriptionId || ''
          const haystack = `${userId} ${email} ${plan} ${razorpaySubscriptionId}`.toLowerCase()

          if (search && !haystack.includes(search)) continue
          if (status !== 'all' && canonicalStatus !== status && !(status === 'cancelled' && cancelled)) continue
          if (risk === '7d' && !(active && daysUntilExpiry != null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7)) continue
          if (risk === '30d' && !(active && daysUntilExpiry != null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30)) continue
          if (risk === 'no-expiry' && !(active && daysUntilExpiry == null)) continue

          rows.push({
            id,
            userId,
            email,
            plan,
            status: cancelled ? 'cancelled' : canonicalStatus,
            active,
            source,
            razorpaySubscriptionId,
            daysUntilExpiry,
            startedAt: serializeDate(data.startedAt ?? data.activatedAt ?? data.createdAt),
            expiresAt: serializeDate(expiry),
            cancelledAt: serializeDate(data.cancelledAt ?? data.canceledAt),
            updatedAt: serializeDate(data.updatedAt ?? data.lastSyncedAt),
          })
        }

        rows.sort((a, b) => String(b.updatedAt || b.startedAt || '').localeCompare(String(a.updatedAt || a.startedAt || '')))

        return NextResponse.json({
          success: true,
          subscriptions: rows.slice(0, limit),
          stats,
          filters: { search, status, risk },
          contract: {
            primaryStore: 'users/{uid}/subscriptions/current',
            legacyStore: 'subscriptions/{uid}',
          },
        })
      } catch (error) {
        console.error('Admin subscriptions error:', error)
        return NextResponse.json({ error: 'Failed to list subscriptions' }, { status: 500 })
      }
    },
    'payments.read'
  )(request)
}
