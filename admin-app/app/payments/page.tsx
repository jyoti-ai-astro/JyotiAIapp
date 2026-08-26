import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

function money(value: unknown) {
  const n = Number(value || 0)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)
}

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function PaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status : 'all'

  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '75' })
  if (search) qs.set('search', search)
  if (status && status !== 'all') qs.set('status', status)

  const response = await canonicalAdminFetch(`/api/admin/payments?${qs.toString()}`)
  if (response.status === 401) redirect('/login')
  const payload = await response.json().catch(() => null)
  const payments = Array.isArray(payload?.payments) ? payload.payments : []
  const stats = payload?.stats || {}

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Payments</strong></div>
      <header className="topbar">
        <div>
          <div className="eyebrow">Canonical payment ledger</div>
          <h1>Payments</h1>
          <p className="muted">Read-only financial truth. Success is provider-verified; admin cannot manufacture it.</p>
        </div>
      </header>

      {!response.ok && <div className="notice">Payment data is unavailable for this role or request.</div>}

      <section className="metric-grid">
        <article className="metric-card"><span>Verified revenue</span><strong>{money(stats.verifiedRevenueTotal)}</strong><small>{money(stats.verifiedRevenueToday)} today</small></article>
        <article className="metric-card"><span>Successful</span><strong>{stats.successfulPayments ?? 0}</strong><small>Verified status</small></article>
        <article className="metric-card"><span>Failed</span><strong>{stats.failedPayments ?? 0}</strong><small>Requires investigation</small></article>
        <article className="metric-card"><span>Pending</span><strong>{stats.pendingPayments ?? 0}</strong><small>Created / pending</small></article>
      </section>

      <section className="card">
        <form className="filterbar" method="get">
          <input name="search" defaultValue={search} placeholder="Search email, user, payment, order, subscription…" />
          <select name="status" defaultValue={status}>
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="created">Created</option>
          </select>
          <button type="submit">Filter</button>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>User</th><th>Amount</th><th>Status</th><th>Type / Product</th><th>Provider IDs</th></tr></thead>
            <tbody>
              {payments.map((payment: any) => (
                <tr key={payment.id}>
                  <td>{date(payment.createdAt)}</td>
                  <td>
                    {payment.userId ? <Link href={`/users/${payment.userId}`}>{payment.email || payment.userId}</Link> : (payment.email || '—')}
                    {payment.userId && <small className="cell-sub">{payment.userId}</small>}
                  </td>
                  <td>{money(payment.amount)}</td>
                  <td><span className={`status status-${payment.status}`}>{payment.status}</span></td>
                  <td>{payment.type || '—'}<small className="cell-sub">{payment.productId || '—'}</small></td>
                  <td>
                    <code>{payment.razorpayPaymentId || '—'}</code>
                    <small className="cell-sub">Order: {payment.razorpayOrderId || '—'}</small>
                    {payment.razorpaySubscriptionId && <small className="cell-sub">Sub: {payment.razorpaySubscriptionId}</small>}
                    {payment.status === 'failed' && payment.failureDescription && <small className="cell-error">{payment.failureCode ? `${payment.failureCode}: ` : ''}{payment.failureDescription}</small>}
                  </td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan={6} className="empty">No matching payments.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
