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
}

function fmtDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN')
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')
  if (!me.ok) redirect('/')

  const { q = '', page = '1' } = await searchParams
  const params = new URLSearchParams({ page, limit: '50' })
  if (q.trim()) params.set('search', q.trim())

  const response = await canonicalAdminFetch(`/api/admin/users?${params.toString()}`)
  const payload = await response.json().catch(() => null)
  const users: UserRow[] = response.ok && payload?.users ? payload.users : []
  const pagination = payload?.pagination || { page: 1, hasMore: false }

  return (
    <div className="module-page">
      <header className="module-header">
        <div>
          <div className="muted">User operations</div>
          <h1>Users</h1>
          <p className="muted">Search and inspect user state. Economic changes remain in dedicated audited modules.</p>
        </div>
        <Link className="text-link" href="/">← Overview</Link>
      </header>

      <form className="searchbar" action="/users" method="get">
        <input name="q" defaultValue={q} placeholder="Search by email or name" aria-label="Search users" />
        <button className="secondary" type="submit">Search</button>
      </form>

      {!response.ok ? (
        <div className="notice error">Unable to load users. Your role may not have users.read permission.</div>
      ) : null}

      <section className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Subscription</th>
                <th>Created</th>
                <th>Last login</th>
                <th>Staff</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length ? users.map((user) => (
                <tr key={user.uid}>
                  <td>
                    <div className="cell-title">{user.displayName || 'Unnamed user'}</div>
                    <div className="muted small">{user.email || user.uid}</div>
                  </td>
                  <td><span className="badge">{user.subscriptionStatus || 'free'}</span></td>
                  <td>{fmtDate(user.createdAt)}</td>
                  <td>{fmtDate(user.lastLoginAt)}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                  <td><Link className="text-link" href={`/users/${encodeURIComponent(user.uid)}`}>View</Link></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="empty">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="pager">
        {Number(pagination.page) > 1 ? (
          <Link className="secondary-link" href={`/users?page=${Number(pagination.page) - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}>Previous</Link>
        ) : <span />}
        <span className="muted">Page {pagination.page || 1}</span>
        {pagination.hasMore ? (
          <Link className="secondary-link" href={`/users?page=${Number(pagination.page || 1) + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}>Next</Link>
        ) : <span />}
      </div>
    </div>
  )
}
