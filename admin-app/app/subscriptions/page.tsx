import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function SubscriptionsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status : 'all'
  const risk = typeof params.risk === 'string' ? params.risk : 'all'

  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '150' })
  if (search) qs.set('search', search)
  if (status !== 'all') qs.set('status', status)
  if (risk !== 'all') qs.set('risk', risk)

  const response = await canonicalAdminFetch(`/api/admin/subscriptions?${qs.toString()}`)
  if (response.status === 401) redirect('/login')
  const payload = await response.json().catch(() => null)
  const subscriptions = Array.isArray(payload?.subscriptions) ? payload.subscriptions : []
  const stats = payload?.stats || {}

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Subscriptions</strong></div>
      <header className="topbar">
        <div>
          <div className="eyebrow">Retention & entitlement intelligence</div>
          <h1>Subscriptions</h1>
          <p className="muted">See active entitlement, expiry risk and cancellation state without mutating provider truth.</p>
        </div>
      </header>

      {!response.ok && <div className="notice">Subscription data is unavailable for this role or request.</div>}

      <section className="metric-grid">
        <article className="metric-card"><span>Active</span><strong>{stats.active ?? 0}</strong><small>{stats.total ?? 0} canonical records</small></article>
        <article className="metric-card"><span>Expiring in 7 days</span><strong>{stats.expiring7d ?? 0}</strong><small>Immediate retention window</small></article>
        <article className="metric-card"><span>Expiring in 30 days</span><strong>{stats.expiring30d ?? 0}</strong><small>Upcoming renewal risk</small></article>
        <article className="metric-card"><span>Cancelled</span><strong>{stats.cancelled ?? 0}</strong><small>{stats.expired ?? 0} expired</small></article>
      </section>

      <section className="card filter-panel">
        <form className="smart-filterbar" method="get">
          <label className="filter-field wide"><span>Search</span><input name="search" defaultValue={search} placeholder="User, email, plan, provider subscription ID…" /></label>
          <label className="filter-field"><span>Status</span><select name="status" defaultValue={status}><option value="all">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="inactive">Inactive</option><option value="cancelled">Cancelled</option></select></label>
          <label className="filter-field"><span>Retention risk</span><select name="risk" defaultValue={risk}><option value="all">All windows</option><option value="7d">Expires ≤ 7 days</option><option value="30d">Expires ≤ 30 days</option><option value="no-expiry">No expiry recorded</option></select></label>
          <button className="primary action-primary" type="submit">Apply filters</button>
        </form>
      </section>

      <section className="table-card elevated-table">
        <div className="table-toolbar"><div><strong>Subscription ledger</strong><span>{subscriptions.length} records in this view · provider-linked, read only</span></div></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Retention</th><th>Provider ID</th><th>Started</th><th>Expires</th></tr></thead>
            <tbody>
              {subscriptions.map((sub: any) => (
                <tr key={sub.id}>
                  <td>{sub.userId ? <Link className="row-action" href={`/users/${sub.userId}`}>{sub.email || sub.userId}</Link> : (sub.email || '—')}{sub.userId && <small className="cell-sub">{sub.userId}</small>}</td>
                  <td><span className="badge">{sub.plan || 'Unmapped plan'}</span></td>
                  <td><span className={`status status-${sub.status}`}>{sub.status}</span></td>
                  <td>{sub.daysUntilExpiry == null ? <span className="muted">No expiry</span> : sub.daysUntilExpiry < 0 ? <span className="status status-failed">Expired</span> : sub.daysUntilExpiry <= 7 ? <span className="status status-pending">{sub.daysUntilExpiry}d left</span> : sub.daysUntilExpiry <= 30 ? <span className="badge">{sub.daysUntilExpiry}d left</span> : <span className="muted">Healthy</span>}</td>
                  <td><code>{sub.razorpaySubscriptionId || '—'}</code></td>
                  <td>{date(sub.startedAt)}</td>
                  <td>{date(sub.expiresAt)}</td>
                </tr>
              ))}
              {!subscriptions.length && <tr><td colSpan={7} className="empty"><strong>No subscriptions match these filters.</strong><span>Broaden the status or retention window.</span></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
