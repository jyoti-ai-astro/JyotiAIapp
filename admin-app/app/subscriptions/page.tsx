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

  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '150' })
  if (search) qs.set('search', search)
  if (status && status !== 'all') qs.set('status', status)

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
          <div className="eyebrow">Canonical entitlement state</div>
          <h1>Subscriptions</h1>
          <p className="muted">Provider-linked subscription records. This screen is read-only and never invents paid state.</p>
        </div>
      </header>

      {!response.ok && <div className="notice">Subscription data is unavailable for this role or request.</div>}

      <section className="metric-grid">
        <article className="metric-card"><span>Total records</span><strong>{stats.total ?? 0}</strong><small>Canonical subscription documents</small></article>
        <article className="metric-card"><span>Active</span><strong>{stats.active ?? 0}</strong><small>Not expired</small></article>
        <article className="metric-card"><span>Expired</span><strong>{stats.expired ?? 0}</strong><small>Expiry reached</small></article>
        <article className="metric-card"><span>Pending</span><strong>{stats.pending ?? 0}</strong><small>Created / pending</small></article>
      </section>

      <section className="card">
        <form className="filterbar" method="get">
          <input name="search" defaultValue={search} placeholder="Search user, email, plan, Razorpay subscription…" />
          <select name="status" defaultValue={status}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit">Filter</button>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Provider ID</th><th>Started</th><th>Expires</th></tr></thead>
            <tbody>
              {subscriptions.map((sub: any) => (
                <tr key={sub.id}>
                  <td>
                    {sub.userId ? <Link href={`/users/${sub.userId}`}>{sub.email || sub.userId}</Link> : (sub.email || '—')}
                    {sub.userId && <small className="cell-sub">{sub.userId}</small>}
                  </td>
                  <td>{sub.plan || '—'}</td>
                  <td><span className={`status status-${sub.status}`}>{sub.status}</span></td>
                  <td><code>{sub.razorpaySubscriptionId || '—'}</code></td>
                  <td>{date(sub.startedAt)}</td>
                  <td>{date(sub.expiresAt)}</td>
                </tr>
              ))}
              {!subscriptions.length && <tr><td colSpan={6} className="empty">No matching subscriptions.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
