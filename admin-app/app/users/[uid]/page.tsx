import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

function fmtDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN')
}

function money(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0)
}

export default async function UserDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const { uid } = await params
  const response = await canonicalAdminFetch(`/api/admin/users/${encodeURIComponent(uid)}`)
  if (response.status === 401) redirect('/login')
  if (response.status === 404) notFound()

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.user) redirect('/users')
  const user = payload.user

  return (
    <div className="module-page">
      <header className="module-header">
        <div>
          <div className="muted">User detail</div>
          <h1>{user.displayName || 'Unnamed user'}</h1>
          <p className="muted">{user.email || user.uid}</p>
        </div>
        <Link className="text-link" href="/users">← Users</Link>
      </header>

      <section className="grid detail-grid">
        <div className="card"><div className="muted">Status</div><h2>{user.blocked ? 'Blocked' : 'Active'}</h2><div className="small muted">Onboarding: {user.onboardingComplete ? 'complete' : 'incomplete'}</div></div>
        <div className="card"><div className="muted">Subscription</div><h2>{user.subscription?.status || 'None'}</h2><div className="small muted">{user.subscription?.planId || 'No plan'}</div></div>
        <div className="card"><div className="muted">AI Guru tickets</div><h2>{user.tickets?.aiGuruTickets ?? 0}</h2></div>
        <div className="card"><div className="muted">Kundali tickets</div><h2>{user.tickets?.kundaliTickets ?? 0}</h2></div>
      </section>

      <section className="card detail-section">
        <div className="section-heading"><h2>Account</h2><span className="muted small">Read-only canonical state</span></div>
        <div className="facts">
          <div><span className="muted">UID</span><strong>{user.uid}</strong></div>
          <div><span className="muted">Created</span><strong>{fmtDate(user.createdAt)}</strong></div>
          <div><span className="muted">Last login</span><strong>{fmtDate(user.lastLoginAt)}</strong></div>
          <div><span className="muted">Prediction tickets</span><strong>{user.tickets?.lifetimePredictions ?? 0}</strong></div>
          <div><span className="muted">Subscription expiry</span><strong>{fmtDate(user.subscription?.expiresAt)}</strong></div>
          <div><span className="muted">Razorpay subscription</span><strong>{user.subscription?.razorpaySubscriptionId || '—'}</strong></div>
        </div>
      </section>

      <section className="card detail-section">
        <div className="section-heading"><h2>Recent payments</h2><span className="muted small">Last 20 records</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Payment</th><th>Type</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {user.payments?.length ? user.payments.map((payment: any) => (
                <tr key={payment.id}>
                  <td><div className="cell-title">{payment.paymentId || payment.id}</div><div className="muted small">{payment.orderId || 'No order ID'}</div></td>
                  <td>{payment.type || payment.productId || '—'}</td>
                  <td><span className="badge">{payment.status || 'unknown'}</span></td>
                  <td>{money(payment.amount, payment.currency || 'INR')}</td>
                  <td>{fmtDate(payment.createdAt)}</td>
                </tr>
              )) : <tr><td colSpan={5} className="empty">No payment records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card detail-section">
        <div className="section-heading"><h2>Recent reports</h2><span className="muted small">Last 20 records</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Report</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {user.reports?.length ? user.reports.map((report: any) => (
                <tr key={report.id}>
                  <td className="cell-title">{report.title || report.id}</td>
                  <td>{report.type || '—'}</td>
                  <td><span className="badge">{report.status || 'unknown'}</span></td>
                  <td>{fmtDate(report.createdAt)}</td>
                </tr>
              )) : <tr><td colSpan={4} className="empty">No reports found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="notice">Ticket adjustments are intentionally not exposed here. Use the dedicated Tickets module so every economic change requires permission, reason and audit metadata.</div>
    </div>
  )
}
