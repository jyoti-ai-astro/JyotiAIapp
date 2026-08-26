import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

function money(value: unknown) {
  const n = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)
}
function date(value: unknown) { if (!value) return '—'; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN') }
function percent(value: unknown) { const n = Number(value || 0); return `${Number.isFinite(n) ? n.toFixed(1) : '0.0'}%` }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function PaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status : 'all'
  const range = typeof params.range === 'string' ? params.range : '30d'

  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '75', range })
  if (search) qs.set('search', search)
  if (status && status !== 'all') qs.set('status', status)

  const response = await canonicalAdminFetch(`/api/admin/payments?${qs.toString()}`)
  if (response.status === 401) redirect('/login')
  const payload = await response.json().catch(() => null)
  const payments = Array.isArray(payload?.payments) ? payload.payments : []
  const stats = payload?.stats || {}
  const products = Array.isArray(payload?.breakdowns?.products) ? payload.breakdowns.products : []
  const sources = Array.isArray(payload?.breakdowns?.sources) ? payload.breakdowns.sources : []

  return (
    <main className="module-page">
      <header className="module-header">
        <div><div className="eyebrow">Finance intelligence</div><h1>Payments</h1><p className="muted">Provider-verified financial truth with product and acquisition context. Admin cannot manufacture successful revenue.</p></div>
        <div className="header-actions"><Link className="secondary-link" href="/growth">Growth attribution</Link></div>
      </header>

      {!response.ok && <div className="notice">Payment data is unavailable for this role or request.</div>}

      <section className="metric-grid">
        <article className="metric-card"><span>Verified revenue</span><strong>{money(stats.verifiedRevenue)}</strong><small>{range === 'all' ? 'All time' : `Selected ${range} window`}</small></article>
        <article className="metric-card"><span>Successful payments</span><strong>{Number(stats.successfulPayments || 0).toLocaleString('en-IN')}</strong><small>{percent(stats.successRate)} success rate</small></article>
        <article className="metric-card"><span>Average order value</span><strong>{money(stats.averageOrderValue)}</strong><small>Verified successful payments</small></article>
        <article className="metric-card"><span>Attention required</span><strong>{Number(stats.failedPayments || 0) + Number(stats.pendingPayments || 0)}</strong><small>{stats.failedPayments || 0} failed · {stats.pendingPayments || 0} pending</small></article>
      </section>

      <section className="card filter-panel">
        <div className="section-heading"><div><div className="section-title">Finance filters</div><div className="muted small">Search payment, order, user, product or campaign context.</div></div><Link className="text-link" href="/payments">Reset filters</Link></div>
        <form className="smart-filterbar payment-filterbar" method="get">
          <label className="filter-field wide"><span>Search</span><input name="search" defaultValue={search} placeholder="Email, payment, order, product, campaign…" /></label>
          <label className="filter-field"><span>Status</span><select name="status" defaultValue={status}><option value="all">All statuses</option><option value="success">Success</option><option value="failed">Failed</option><option value="pending">Pending</option><option value="created">Created</option></select></label>
          <label className="filter-field"><span>Date window</span><select name="range" defaultValue={range}><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="all">All time</option></select></label>
          <button className="primary action-primary" type="submit">Apply</button>
        </form>
      </section>

      <section className="panel-grid finance-breakdowns">
        <article className="card"><div className="section-title">Revenue by product</div><div className="rank-list">{products.length ? products.map((item: any, index: number) => <div className="rank-row" key={item.name}><span className="rank">{index + 1}</span><div><strong>{item.name}</strong><span>{item.count} successful payments</span></div><strong>{money(item.revenue)}</strong></div>) : <div className="empty-state">No verified product revenue in this window.</div>}</div></article>
        <article className="card"><div className="section-title">Revenue by acquisition source</div><div className="rank-list">{sources.length ? sources.map((item: any, index: number) => <div className="rank-row" key={item.name}><span className="rank">{index + 1}</span><div><strong>{item.name}</strong><span>{item.count} successful payments</span></div><strong>{money(item.revenue)}</strong></div>) : <div className="empty-state">Attribution will populate as first-party tracking rolls out.</div>}</div></article>
      </section>

      <section className="table-card elevated-table payment-ledger">
        <div className="table-toolbar"><div><strong>Payment ledger</strong><span>{payments.length} visible records · verified economics remain canonical</span></div><span className="status-pill">Razorpay-linked</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>User</th><th>Amount</th><th>Status</th><th>Product</th><th>Acquisition</th><th>Provider IDs</th></tr></thead>
            <tbody>
              {payments.map((payment: any) => (
                <tr key={payment.id}>
                  <td>{date(payment.createdAt)}</td>
                  <td>{payment.userId ? <Link className="row-action" href={`/users/${payment.userId}`}>{payment.email || payment.userId}</Link> : (payment.email || '—')}{payment.userId && <small className="cell-sub">{payment.userId}</small>}</td>
                  <td><strong>{money(payment.amount)}</strong></td>
                  <td><span className={`status status-${payment.status}`}>{payment.status}</span></td>
                  <td>{payment.type || '—'}<small className="cell-sub">{payment.productId || '—'}</small></td>
                  <td>{payment.attribution?.source || 'Direct / unknown'}<small className="cell-sub">{[payment.attribution?.medium, payment.attribution?.campaign].filter(Boolean).join(' · ') || 'No campaign metadata'}</small></td>
                  <td><code>{payment.razorpayPaymentId || '—'}</code><small className="cell-sub">Order: {payment.razorpayOrderId || '—'}</small>{payment.razorpaySubscriptionId && <small className="cell-sub">Sub: {payment.razorpaySubscriptionId}</small>}{payment.status === 'failed' && payment.failureDescription && <small className="cell-error">{payment.failureCode ? `${payment.failureCode}: ` : ''}{payment.failureDescription}</small>}</td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan={7} className="empty"><strong>No matching payments.</strong><span>Change the date window or status filter.</span></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
