import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function number(value: unknown) { const n = Number(value || 0); return Number.isFinite(n) ? new Intl.NumberFormat('en-IN').format(n) : '0' }
function currency(value: unknown) { const n = Number(value || 0); return Number.isFinite(n) ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '₹0' }
function pct(value: unknown) { const n = Number(value); return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : '—' }

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const days = typeof params.days === 'string' ? params.days : '30'

  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')
  const mePayload = await me.json().catch(() => null)
  if (!me.ok || !mePayload) redirect('/login')

  const overview = await canonicalAdminFetch(`/api/admin/dashboard/stats?days=${encodeURIComponent(days)}`)
  const overviewPayload = overview.ok ? await overview.json().catch(() => null) : null
  const stats = overviewPayload?.stats || {}
  const admin = mePayload.admin || mePayload
  const ticketTotal = Number(stats.tickets?.aiGuruTickets || 0) + Number(stats.tickets?.kundaliTickets || 0) + Number(stats.tickets?.lifetimePredictions || 0)
  const attentionCount = Number(stats.attention?.failedPayments || 0) + Number(stats.attention?.pendingPayments || 0) + Number(stats.attention?.expiring7d || 0)
  const topProducts = Array.isArray(stats.payments?.topProducts) ? stats.payments.topProducts : []

  return <main className="module-page overview-command-center">
    <header className="module-header overview-hero">
      <div>
        <div className="eyebrow">JyotiAI Mission Control</div>
        <h1>Operations overview</h1>
        <p className="muted">Executive view of customer growth, verified revenue, retention, product usage and immediate operational attention.</p>
      </div>
      <div className="header-actions">
        <form method="get" className="compact-window"><select name="days" defaultValue={days}><option value="1">24 hours</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select><button className="secondary" type="submit">Apply</button></form>
        <div className="identity"><strong>{admin.name || admin.email || 'Authorized staff'}</strong><span>{admin.role || 'Admin'}</span></div>
      </div>
    </header>

    {!overview.ok && <div className="notice">Overview intelligence is unavailable from the current canonical backend. Authentication is valid; this screen will never fabricate financial values.</div>}

    <section className="metric-grid executive-metrics">
      <article className="metric-card metric-accent"><span>Verified revenue</span><strong>{currency(stats.payments?.verifiedRevenuePeriod)}</strong><small>{currency(stats.payments?.verifiedRevenueToday)} today · {number(stats.payments?.successfulPeriod)} verified purchases</small></article>
      <article className="metric-card"><span>New users</span><strong>{number(stats.users?.newPeriod)}</strong><small>{number(stats.users?.newToday)} today · {number(stats.users?.total)} total users</small></article>
      <article className="metric-card"><span>Active subscriptions</span><strong>{number(stats.subscriptions?.active)}</strong><small>{number(stats.subscriptions?.expiring7d)} expiring ≤7d · {number(stats.subscriptions?.expiring30d)} ≤30d</small></article>
      <article className="metric-card"><span>Operational attention</span><strong>{number(attentionCount)}</strong><small>Failed/pending payments + near-term expiries</small></article>
    </section>

    <section className="command-grid">
      <article className="card attention-card">
        <div className="section-title-row"><div><div className="section-title">Operational attention</div><span>Items most likely to affect revenue or customer experience</span></div><Link className="row-action" href="/monitoring">System health →</Link></div>
        <div className="attention-list">
          <Link href="/payments?status=failed" className="attention-item"><div><span className="attention-dot danger"/><strong>Failed payments</strong><small>Current analysis window</small></div><b>{number(stats.attention?.failedPayments)}</b></Link>
          <Link href="/payments?status=pending" className="attention-item"><div><span className="attention-dot warning"/><strong>Pending payments</strong><small>Created / unresolved</small></div><b>{number(stats.attention?.pendingPayments)}</b></Link>
          <Link href="/subscriptions?risk=7d" className="attention-item"><div><span className="attention-dot warning"/><strong>Subscriptions expiring in 7 days</strong><small>Immediate retention window</small></div><b>{number(stats.attention?.expiring7d)}</b></Link>
          <Link href="/tickets" className="attention-item"><div><span className="attention-dot neutral"/><strong>Outstanding ticket liability</strong><small>AI Guru + Kundali + Predictions</small></div><b>{number(ticketTotal)}</b></Link>
        </div>
      </article>

      <article className="card">
        <div className="section-title-row"><div><div className="section-title">Growth funnel</div><span>First-party event stream · {days}-day window</span></div><Link className="row-action" href={`/growth?days=${encodeURIComponent(days)}`}>Open Growth →</Link></div>
        <div className="funnel-stack">
          <div><span>Visitors</span><strong>{number(stats.growth?.visitors)}</strong></div>
          <div><span>Sessions</span><strong>{number(stats.growth?.sessions)}</strong></div>
          <div><span>Landing views</span><strong>{number(stats.growth?.landingViews)}</strong></div>
          <div><span>Pricing views</span><strong>{number(stats.growth?.pricingViews)}</strong></div>
          <div><span>Checkout intent</span><strong>{number(stats.growth?.checkoutIntent)}</strong></div>
          <div><span>Verified purchases</span><strong>{number(stats.payments?.successfulPeriod)}</strong></div>
        </div>
      </article>
    </section>

    <section className="command-grid lower-grid">
      <article className="card">
        <div className="section-title-row"><div><div className="section-title">Revenue intelligence</div><span>Provider-verified successful payments only</span></div><Link className="row-action" href={`/payments?days=${encodeURIComponent(days)}`}>Open ledger →</Link></div>
        <div className="rows"><div><span>Average order value</span><strong>{currency(stats.payments?.averageOrderValuePeriod)}</strong></div><div><span>Payment success rate</span><strong>{pct(stats.payments?.successRatePeriod)}</strong></div><div><span>Failed attempts</span><strong>{number(stats.payments?.failedPeriod)}</strong></div><div><span>Pending attempts</span><strong>{number(stats.payments?.pendingPeriod)}</strong></div></div>
        <div className="mini-breakdown"><div className="mini-breakdown-title">Top products by verified revenue</div>{topProducts.length ? topProducts.map((item: any) => <div className="mini-breakdown-row" key={item.product}><span>{item.product}</span><strong>{currency(item.revenue)}</strong></div>) : <div className="mini-breakdown-empty">No mapped product revenue in this window.</div>}</div>
      </article>

      <article className="card">
        <div className="section-title-row"><div><div className="section-title">Retention & entitlement</div><span>Canonical subscription and ticket state</span></div><Link className="row-action" href="/subscriptions">Subscriptions →</Link></div>
        <div className="rows"><div><span>Active subscriptions</span><strong>{number(stats.subscriptions?.active)}</strong></div><div><span>Expiring ≤7 days</span><strong>{number(stats.subscriptions?.expiring7d)}</strong></div><div><span>Expiring ≤30 days</span><strong>{number(stats.subscriptions?.expiring30d)}</strong></div><div><span>Cancelled</span><strong>{number(stats.subscriptions?.cancelled)}</strong></div></div>
        <div className="ticket-strip"><div><span>AI Guru</span><strong>{number(stats.tickets?.aiGuruTickets)}</strong></div><div><span>Kundali</span><strong>{number(stats.tickets?.kundaliTickets)}</strong></div><div><span>Predictions</span><strong>{number(stats.tickets?.lifetimePredictions)}</strong></div></div>
      </article>
    </section>

    <section className="command-grid lower-grid">
      <article className="card"><div className="section-title-row"><div><div className="section-title">Product usage today</div><span>Signals from JyotiAI product activity</span></div></div><div className="usage-tiles"><Link href="/reports"><span>Reports generated</span><strong>{number(stats.reports?.today)}</strong></Link><Link href="/guru"><span>Guru messages</span><strong>{number(stats.guru?.usageToday)}</strong></Link><Link href="/users?signup=today"><span>New users</span><strong>{number(stats.users?.newToday)}</strong></Link></div></article>
      <article className="card"><div className="section-title">System contract</div><div className="rows"><div><span>Operational data</span><strong>{stats.system?.dataSource || 'canonical'}</strong></div><div><span>Analytics ledger</span><strong>{stats.system?.analyticsEventStore || 'analyticsEvents'}</strong></div><div><span>AI provider</span><strong>{stats.system?.aiProvider || '—'}</strong></div><div><span>Economic authority</span><strong>jyotiai.in</strong></div></div></article>
    </section>
  </main>
}
