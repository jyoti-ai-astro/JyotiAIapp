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
  return withAdminAuth(async (req) => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    try {
      const { searchParams } = new URL(req.url)
      const days = Math.min(90, Math.max(1, Number.parseInt(searchParams.get('days') || '30', 10) || 30))
      const since = new Date(Date.now() - days * 86_400_000)
      const [eventsSnap, paymentsSnap] = await Promise.all([
        adminDb.collection('analyticsEvents').limit(5000).get(),
        adminDb.collection('payments').get(),
      ])

      const events = eventsSnap.docs.map((doc) => doc.data()).filter((event) => {
        const occurred = toDate(event.receivedAt || event.occurredAt)
        return !occurred || occurred >= since
      })
      const count = (name: string) => events.filter((event) => event.eventName === name).length
      const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean)).size
      const visitors = new Set(events.map((event) => event.anonymousId).filter(Boolean)).size
      const landingViews = count('landing_viewed')
      const checkoutStarts = count('checkout_started')
      const reportPurchaseStarts = count('report_purchase_started')
      const pricingViews = count('pricing_viewed')
      const signupStarts = count('signup_started')

      let verifiedPurchases = 0
      let verifiedRevenue = 0
      const revenueBySource = new Map<string, number>()
      paymentsSnap.forEach((doc) => {
        const data = doc.data()
        if (data.status !== 'success') return
        const created = toDate(data.createdAt)
        if (created && created < since) return
        const amount = Number(data.amount || 0)
        verifiedPurchases += 1
        verifiedRevenue += Number.isFinite(amount) ? amount : 0
        const source = String(data.utmSource || data.utm_source || data.source || data.attribution?.latestTouch?.utm_source || 'Direct / unknown')
        revenueBySource.set(source, (revenueBySource.get(source) || 0) + (Number.isFinite(amount) ? amount : 0))
      })

      const sources = new Map<string, { sessions: number; visitors: Set<string> }>()
      for (const event of events) {
        if (event.eventName !== 'session_started') continue
        const source = String(event.attribution?.latestTouch?.utm_source || event.attribution?.firstTouch?.utm_source || (event.attribution?.latestTouch?.referrer ? 'Referral' : 'Direct / unknown'))
        const current = sources.get(source) || { sessions: 0, visitors: new Set<string>() }
        current.sessions += 1
        if (event.anonymousId) current.visitors.add(event.anonymousId)
        sources.set(source, current)
      }

      return NextResponse.json({
        success: true, days,
        metrics: { visitors, sessions, landingViews, signupStarts, pricingViews, checkoutStarts, reportPurchaseStarts, verifiedPurchases, verifiedRevenue },
        funnel: [
          { key: 'landing', label: 'Landing views', value: landingViews },
          { key: 'pricing', label: 'Pricing views', value: pricingViews },
          { key: 'checkout', label: 'Checkout starts', value: checkoutStarts + reportPurchaseStarts },
          { key: 'purchase', label: 'Verified purchases', value: verifiedPurchases },
        ],
        sources: Array.from(sources.entries()).map(([source, value]) => ({ source, sessions: value.sessions, visitors: value.visitors.size, revenue: revenueBySource.get(source) || 0 })).sort((a,b) => b.sessions - a.sessions).slice(0, 12),
        contract: { revenueAuthority: 'provider-verified JyotiAI payments', eventStore: 'analyticsEvents', attribution: 'first-party' },
      })
    } catch (error) {
      console.error('Admin growth analytics error:', error)
      return NextResponse.json({ error: 'Failed to load growth analytics' }, { status: 500 })
    }
  }, 'payments.read')(request)
}
