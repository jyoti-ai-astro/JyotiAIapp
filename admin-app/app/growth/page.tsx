import Link from 'next/link'
import { canonicalAdminFetch } from '@/lib/canonical-api'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function money(value: unknown) { const n = Number(value || 0); return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0) }
function num(value: unknown) { const n = Number(value || 0); return Number.isFinite(n) ? new Intl.NumberFormat('en-IN').format(n) : '0' }
function pct(value: number, base: number) { return base > 0 ? `${((value / base) * 100).toFixed(1)}%` : '—' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function GrowthPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const days = typeof params.days === 'string' ? params.days : '30'
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')
  const response = await canonicalAdminFetch(`/api/admin/growth?days=${encodeURIComponent(days)}`)
  if (response.status === 401) redirect('/login')
  const payload = response.ok ? await response.json().catch(() => null) : null
  const metrics = payload?.metrics || {}
  const funnel = Array.isArray(payload?.funnel) ? payload.funnel : []
  const sources = Array.isArray(payload?.sources) ? payload.sources : []

  return <main className="module-page">
    <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Growth</strong></div>
    <div className="module-header"><div><div className="eyebrow">Growth intelligence</div><h1>Growth & attribution</h1><p className="muted">First-party acquisition and funnel behavior joined to provider-verified JyotiAI revenue.</p></div></div>
    {!response.ok && <div className="notice">Growth analytics is not available yet. The dashboard will populate as first-party events arrive.</div>}

    <section className="card filter-panel"><form className="smart-filterbar" method="get"><label className="filter-field"><span>Analysis window</span><select name="days" defaultValue={days}><option value="1">Today / 24h</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><button className="primary action-primary" type="submit">Apply window</button></form></section>

    <section className="metric-grid">
      <article className="metric-card"><span>Visitors</span><strong>{num(metrics.visitors)}</strong><small>{num(metrics.sessions)} sessions</small></article>
      <article className="metric-card"><span>Checkout intent</span><strong>{num(Number(metrics.checkoutStarts || 0) + Number(metrics.reportPurchaseStarts || 0))}</strong><small>{pct(Number(metrics.checkoutStarts || 0) + Number(metrics.reportPurchaseStarts || 0), Number(metrics.landingViews || 0))} of landing views</small></article>
      <article className="metric-card"><span>Verified purchases</span><strong>{num(metrics.verifiedPurchases)}</strong><small>{pct(Number(metrics.verifiedPurchases || 0), Number(metrics.checkoutStarts || 0) + Number(metrics.reportPurchaseStarts || 0))} from checkout intent</small></article>
      <article className="metric-card"><span>Verified revenue</span><strong>{money(metrics.verifiedRevenue)}</strong><small>Provider-verified success only</small></article>
    </section>

    <section className="panel-grid">
      <article className="card"><div className="section-title">Conversion funnel</div><div className="rows">{funnel.map((step: any, index: number) => <div key={step.key}><span>{step.label}</span><strong>{num(step.value)}{index > 0 ? ` · ${pct(Number(step.value || 0), Number(funnel[index - 1]?.value || 0))}` : ''}</strong></div>)}{!funnel.length && <div><span>No event data yet</span><strong>Waiting for analyticsEvents</strong></div>}</div></article>
      <article className="card"><div className="section-title">Acquisition sources</div><div className="rows">{sources.map((source: any) => <div key={source.source}><span>{source.source}<small className="cell-sub">{num(source.visitors)} visitors · {num(source.sessions)} sessions</small></span><strong>{money(source.revenue)}</strong></div>)}{!sources.length && <div><span>Direct / unknown</span><strong>Awaiting attribution traffic</strong></div>}</div></article>
    </section>

    <section className="card" style={{marginTop:16}}><div className="section-title">Launch measurement contract</div><div className="rows"><div><span>Acquisition</span><strong>UTM + click IDs + referrer</strong></div><div><span>Journey</span><strong>anonymous ID + session ID + landing path</strong></div><div><span>Conversion</span><strong>client intent → verified payment</strong></div><div><span>Revenue authority</span><strong>JyotiAI canonical payments</strong></div></div></section>
  </main>
}
