import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

type UserRow = {
  uid: string
  email: string
  displayName: string
  isAdmin?: boolean
  createdAt?: string | null
  lastLoginAt?: string | null
  subscriptionStatus?: string
  onboardingComplete?: boolean
}

function fmtDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function pct(part: number, whole: number) {
  if (!whole) return '0%'
  return `${Math.round((part / whole) * 100)}%`
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; subscription?: string; joined?: string; staff?: string }> }) {
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')
  if (!me.ok) redirect('/')

  const { q = '', page = '1', subscription = 'all', joined = 'all', staff = 'all' } = await searchParams
  const params = new URLSearchParams({ page, limit: '50', subscription, joined, staff })
  if (q.trim()) params.set('search', q.trim())

  const response = await canonicalAdminFetch(`/api/admin/users?${params.toString()}`)
  const payload = await response.json().catch(() => null)
  const users: UserRow[] = response.ok && payload?.users ? payload.users : []
  const pagination = payload?.pagination || { page: 1, hasMore: false, total: 0 }
  const summary = payload?.summary || { totalUsers: 0, visibleUsers: users.length, activeOnPage: 0, staffOnPage: 0 }
  const active = users.filter((user) => user.subscriptionStatus === 'active').length
  const onboarded = users.filter((user) => user.onboardingComplete).length

  const queryBase = new URLSearchParams()
  if (q) queryBase.set('q', q)
  if (subscription !== 'all') queryBase.set('subscription', subscription)
  if (joined !== 'all') queryBase.set('joined', joined)
  if (staff !== 'all') queryBase.set('staff', staff)

  return (
    <main className="module-page">
      <header className="module-header">
        <div>
          <div className="eyebrow">Customer operations</div>
          <h1>Users</h1>
          <p className="muted">Segment, inspect and understand customer state without mixing support actions with financial authority.</p>
        </div>
        <div className="header-actions"><Link className="secondary-link" href="/growth">View acquisition</Link></div>
      </header>

      <section className="metric-grid">
        <article className="metric-card"><span>Total users</span><strong>{Number(summary.totalUsers || 0).toLocaleString('en-IN')}</strong><small>Canonical user records</small></article>
        <article className="metric-card"><span>Visible segment</span><strong>{Number(pagination.total || summary.visibleUsers || users.length).toLocaleString('en-IN')}</strong><small>After current filters</small></article>
        <article className="metric-card"><span>Active paid on page</span><strong>{active}</strong><small>{pct(active, users.length)} of visible rows</small></article>
        <article className="metric-card"><span>Onboarding complete</span><strong>{onboarded}</strong><small>{pct(onboarded, users.length)} of visible rows</small></article>
      </section>

      <section className="card filter-panel">
        <div className="section-heading"><div><div className="section-title">Segment users</div><div className="muted small">Search by name, email or UID and combine filters.</div></div><Link className="text-link" href="/users">Reset filters</Link></div>
        <form className="smart-filterbar" action="/users" method="get">
          <label className="filter-field wide"><span>Search</span><input name="q" defaultValue={q} placeholder="Email, name or UID" /></label>
          <label className="filter-field"><span>Subscription</span><select name="subscription" defaultValue={subscription}><option value="all">All users</option><option value="paid">Paid / active</option><option value="free">Free</option><option value="inactive">Inactive / expired</option></select></label>
          <label className="filter-field"><span>Joined</span><select name="joined" defaultValue={joined}><option value="all">Any time</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select></label>
          <label className="filter-field"><span>Staff</span><select name="staff" defaultValue={staff}><option value="all">All</option><option value="no">Customers only</option><option value="yes">Staff only</option></select></label>
          <button className="primary action-primary" type="submit">Apply filters</button>
        </form>
      </section>

      {!response.ok ? <div className="notice error">Unable to load users. The canonical users API denied or failed this request.</div> : null}

      <section className="table-card elevated-table">
        <div className="table-toolbar"><div><strong>{Number(pagination.total || 0).toLocaleString('en-IN')} users in this segment</strong><span>Page {pagination.page || 1}</span></div><span className="status-pill">Read-only customer state</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>User</th><th>Plan</th><th>Joined</th><th>Last login</th><th>Onboarding</th><th>Access</th><th></th></tr></thead>
            <tbody>
              {users.length ? users.map((user) => (
                <tr key={user.uid}>
                  <td><div className="identity-cell"><div className="mini-avatar">{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</div><div><div className="cell-title">{user.displayName || 'Unnamed user'}</div><div className="cell-sub">{user.email || user.uid}</div></div></div></td>
                  <td><span className={`status status-${user.subscriptionStatus === 'active' ? 'success' : 'created'}`}>{user.subscriptionStatus || 'free'}</span></td>
                  <td>{fmtDate(user.createdAt)}</td>
                  <td>{fmtDate(user.lastLoginAt)}</td>
                  <td>{user.onboardingComplete ? <span className="status status-success">Complete</span> : <span className="status status-created">Incomplete</span>}</td>
                  <td>{user.isAdmin ? <span className="status-pill">Staff</span> : <span className="muted">Customer</span>}</td>
                  <td><Link className="row-action" href={`/users/${encodeURIComponent(user.uid)}`}>Open profile →</Link></td>
                </tr>
              )) : <tr><td colSpan={7} className="empty"><strong>No users match this segment.</strong><span>Try widening your date or subscription filters.</span></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="pager">
        {Number(pagination.page) > 1 ? <Link className="secondary-link" href={`/users?${new URLSearchParams({ ...Object.fromEntries(queryBase.entries()), page: String(Number(pagination.page) - 1) }).toString()}`}>Previous</Link> : <span />}
        <span className="muted">Page {pagination.page || 1}</span>
        {pagination.hasMore ? <Link className="secondary-link" href={`/users?${new URLSearchParams({ ...Object.fromEntries(queryBase.entries()), page: String(Number(pagination.page || 1) + 1) }).toString()}`}>Next</Link> : <span />}
      </div>
    </main>
  )
}
