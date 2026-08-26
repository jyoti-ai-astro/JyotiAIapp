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

function initials(name: string, email: string) {
  const source = (name || email || '?').trim()
  return source.split(/\s+/).slice(0,2).map((part) => part[0]?.toUpperCase()).join('') || '?'
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
  const commerce = user.commerce || {}
  const acquisition = user.acquisition || {}
  const analytics = user.analytics || {}

  return (
    <div className="module-page customer360">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><Link href="/users">Users</Link><span>/</span><strong>Customer 360</strong></div>

      <header className="customer-hero">
        <div className="customer-identity">
          <div className="customer-avatar">{initials(user.displayName, user.email)}</div>
          <div>
            <div className="eyebrow">Customer 360</div>
            <h1>{user.displayName || 'Unnamed user'}</h1>
            <p className="muted">{user.email || user.uid}</p>
            <div className="customer-badges">
              <span className={`status ${user.blocked ? 'status-failed' : 'status-success'}`}>{user.blocked ? 'Blocked' : 'Active'}</span>
              <span className="badge">{user.subscription?.status || 'Free / no subscription'}</span>
              <span className="badge">{user.onboardingComplete ? 'Onboarded' : 'Onboarding incomplete'}</span>
            </div>
          </div>
        </div>
        <div className="header-actions"><Link className="secondary-link" href={`/payments?search=${encodeURIComponent(user.email || user.uid)}`}>Payments</Link><Link className="secondary-link" href="/tickets">Tickets</Link></div>
      </header>

      <section className="metric-grid">
        <article className="metric-card"><span>Lifetime value</span><strong>{money(Number(commerce.lifetimeValue || 0))}</strong><small>{commerce.successfulPurchases || 0} verified purchases</small></article>
        <article className="metric-card"><span>Average order value</span><strong>{money(Number(commerce.averageOrderValue || 0))}</strong><small>{commerce.failedPayments || 0} failed payments</small></article>
        <article className="metric-card"><span>Subscription</span><strong>{user.subscription?.active ? 'Active' : (user.subscription?.status || 'None')}</strong><small>{user.subscription?.planId || 'No mapped plan'}</small></article>
        <article className="metric-card"><span>Product activity</span><strong>{analytics.eventCount || 0}</strong><small>First-party events stitched to this user</small></article>
      </section>

      <section className="customer-grid">
        <article className="card"><div className="section-title">Account & access</div><div className="rows"><div><span>UID</span><strong className="wrap-value">{user.uid}</strong></div><div><span>Created</span><strong>{fmtDate(user.createdAt)}</strong></div><div><span>Last login</span><strong>{fmtDate(user.lastLoginAt)}</strong></div><div><span>Phone</span><strong>{user.phone || '—'}</strong></div><div><span>Onboarding</span><strong>{user.onboardingComplete ? 'Complete' : 'Incomplete'}</strong></div></div></article>

        <article className="card"><div className="section-title">Acquisition</div><div className="rows"><div><span>First-touch source</span><strong>{acquisition.firstTouch?.source || 'Not captured yet'}</strong></div><div><span>Medium</span><strong>{acquisition.firstTouch?.medium || '—'}</strong></div><div><span>Campaign</span><strong>{acquisition.firstTouch?.campaign || '—'}</strong></div><div><span>Landing page</span><strong className="wrap-value">{acquisition.firstTouch?.landingPath || '—'}</strong></div><div><span>Latest source</span><strong>{acquisition.latestTouch?.source || '—'}</strong></div></div></article>

        <article className="card"><div className="section-title">Entitlements</div><div className="ticket-stack"><div><span>AI Guru</span><strong>{user.tickets?.aiGuruTickets ?? 0}</strong></div><div><span>Kundali</span><strong>{user.tickets?.kundaliTickets ?? 0}</strong></div><div><span>Predictions</span><strong>{user.tickets?.lifetimePredictions ?? 0}</strong></div></div><div className="subtle-note">Adjustments remain in the audited Tickets module.</div></article>

        <article className="card"><div className="section-title">Subscription lifecycle</div><div className="rows"><div><span>Status</span><strong>{user.subscription?.status || 'None'}</strong></div><div><span>Plan</span><strong>{user.subscription?.planId || '—'}</strong></div><div><span>Started</span><strong>{fmtDate(user.subscription?.startedAt)}</strong></div><div><span>Expires</span><strong>{fmtDate(user.subscription?.expiresAt)}</strong></div><div><span>Provider ID</span><strong className="wrap-value">{user.subscription?.razorpaySubscriptionId || '—'}</strong></div></div></article>
      </section>

      <section className="customer-grid two-one">
        <article className="card"><div className="section-title">Commerce profile</div><div className="rows"><div><span>First paid</span><strong>{fmtDate(commerce.firstPaidAt)}</strong></div><div><span>Last paid</span><strong>{fmtDate(commerce.lastPaidAt)}</strong></div>{Array.isArray(commerce.products) && commerce.products.length ? commerce.products.slice(0,5).map((item: any) => <div key={item.product}><span>{item.product}<small className="cell-sub">{item.purchases} purchases</small></span><strong>{money(Number(item.revenue || 0))}</strong></div>) : <div><span>Products</span><strong>No verified purchases</strong></div>}</div></article>
        <article className="card"><div className="section-title">Activity summary</div><div className="rows"><div><span>First tracked activity</span><strong>{fmtDate(analytics.firstActivityAt)}</strong></div><div><span>Latest tracked activity</span><strong>{fmtDate(analytics.lastActivityAt)}</strong></div><div><span>Analytics events</span><strong>{analytics.eventCount || 0}</strong></div></div></article>
      </section>

      <section className="card detail-section">
        <div className="section-heading"><h2>Recent customer activity</h2><span className="muted small">First-party journey events</span></div>
        <div className="activity-list">{analytics.recentActivity?.length ? analytics.recentActivity.map((event: any) => <div className="activity-row" key={event.id}><span className="activity-dot"/><div><strong>{String(event.eventName || '').replaceAll('_',' ')}</strong><span>{event.currentPath || 'Unknown path'}</span></div><time>{fmtDate(event.occurredAt)}</time></div>) : <div className="empty-state">No stitched analytics events yet. Historical users will populate as the first-party stream rolls out.</div>}</div>
      </section>

      <section className="card detail-section">
        <div className="section-heading"><h2>Recent payments</h2><span className="muted small">Last 20 records</span></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Payment</th><th>Product</th><th>Attribution</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>
          {user.payments?.length ? user.payments.map((payment: any) => <tr key={payment.id}><td><div className="cell-title">{payment.paymentId || payment.id}</div><div className="muted small">{payment.orderId || 'No order ID'}</div></td><td>{payment.productId || payment.type || '—'}</td><td>{payment.source || 'Direct / unknown'}<small className="cell-sub">{payment.campaign || 'No campaign'}</small></td><td><span className={`status status-${payment.status}`}>{payment.status || 'unknown'}</span></td><td>{money(payment.amount, payment.currency || 'INR')}</td><td>{fmtDate(payment.createdAt)}</td></tr>) : <tr><td colSpan={6} className="empty">No payment records found.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="card detail-section">
        <div className="section-heading"><h2>Recent reports</h2><span className="muted small">Last 20 records</span></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Report</th><th>Type</th><th>Status</th><th>Date</th></tr></thead><tbody>
          {user.reports?.length ? user.reports.map((report: any) => <tr key={report.id}><td className="cell-title">{report.title || report.id}</td><td>{report.type || '—'}</td><td><span className="badge">{report.status || 'unknown'}</span></td><td>{fmtDate(report.createdAt)}</td></tr>) : <tr><td colSpan={4} className="empty">No reports found.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  )
}
