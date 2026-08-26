import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

const nav = [
  ['Overview', '/'], ['Users', '/users'], ['Payments', '/payments'], ['Subscriptions', '/subscriptions'], ['Tickets', '/tickets'],
  ['Reports', '/reports'], ['Guru', '/guru'], ['Knowledge', '/knowledge'], ['Jobs', '/jobs'], ['Monitoring', '/monitoring'], ['Audit', '/audit'],
  ['Backups', '/backups'], ['Staff', '/staff'], ['Settings', '/settings'],
] as const

type OverviewStats = {
  users?: { total?: number; newToday?: number }
  reports?: { today?: number }
  guru?: { usageToday?: number }
  payments?: { successful?: number; failed?: number; verifiedRevenueTotal?: number; verifiedRevenueToday?: number }
  subscriptions?: { active?: number }
  tickets?: { aiGuruTickets?: number; kundaliTickets?: number; lifetimePredictions?: number }
  system?: { aiProvider?: string; dataSource?: string }
}

function number(value: unknown) { const n = Number(value || 0); return Number.isFinite(n) ? new Intl.NumberFormat('en-IN').format(n) : '0' }
function currency(value: unknown) { const n = Number(value || 0); return Number.isFinite(n) ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n) : '₹0' }

export default async function DashboardPage() {
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')
  const mePayload = await me.json().catch(() => null)
  if (!me.ok || !mePayload) redirect('/login')
  const overview = await canonicalAdminFetch('/api/admin/dashboard/stats')
  const overviewPayload = overview.ok ? await overview.json().catch(() => null) : null
  const stats: OverviewStats = overviewPayload?.stats || {}
  const ticketTotal = Number(stats.tickets?.aiGuruTickets || 0) + Number(stats.tickets?.kundaliTickets || 0) + Number(stats.tickets?.lifetimePredictions || 0)
  const admin = mePayload.admin || mePayload

  return <div className="shell">
    <aside className="sidebar"><div className="brand">JyotiAI Admin</div><div className="environment">admin.jyotiai.in</div><nav className="nav">{nav.map(([item, href]) => <Link className={item === 'Overview' ? 'active' : ''} href={href} key={item}>{item}</Link>)}</nav></aside>
    <main className="main"><header className="topbar"><div><div className="eyebrow">Secure control plane</div><h1>Overview</h1><p className="muted">Canonical operational state for JyotiAI.</p></div><div className="identity"><strong>{admin.name || admin.email || 'Authorized staff'}</strong><span>{admin.role || 'Admin'}</span></div></header>
      {!overview.ok && <div className="notice">Overview metrics are restricted for this role. Authentication is valid, but the canonical API denied financial overview access.</div>}
      <section className="metric-grid"><article className="metric-card"><span>Total users</span><strong>{number(stats.users?.total)}</strong><small>+{number(stats.users?.newToday)} today</small></article><article className="metric-card"><span>Verified revenue</span><strong>{currency(stats.payments?.verifiedRevenueTotal)}</strong><small>{currency(stats.payments?.verifiedRevenueToday)} today</small></article><article className="metric-card"><span>Active subscriptions</span><strong>{number(stats.subscriptions?.active)}</strong><small>Canonical subscription records</small></article><article className="metric-card"><span>Outstanding tickets</span><strong>{number(ticketTotal)}</strong><small>Current entitlement liability</small></article></section>
      <section className="panel-grid"><article className="card"><div className="section-title">Payments</div><div className="rows"><div><span>Successful</span><strong>{number(stats.payments?.successful)}</strong></div><div><span>Failed</span><strong>{number(stats.payments?.failed)}</strong></div><div><span>Revenue source</span><strong>Verified success only</strong></div></div></article><article className="card"><div className="section-title">Ticket liability</div><div className="rows"><div><span>AI Guru</span><strong>{number(stats.tickets?.aiGuruTickets)}</strong></div><div><span>Kundali</span><strong>{number(stats.tickets?.kundaliTickets)}</strong></div><div><span>Predictions</span><strong>{number(stats.tickets?.lifetimePredictions)}</strong></div></div></article><article className="card"><div className="section-title">Usage today</div><div className="rows"><div><span>Reports</span><strong>{number(stats.reports?.today)}</strong></div><div><span>Guru messages</span><strong>{number(stats.guru?.usageToday)}</strong></div><div><span>New users</span><strong>{number(stats.users?.newToday)}</strong></div></div></article><article className="card"><div className="section-title">System contract</div><div className="rows"><div><span>Data source</span><strong>{stats.system?.dataSource || 'canonical'}</strong></div><div><span>AI provider</span><strong>{stats.system?.aiProvider || '—'}</strong></div><div><span>Economic authority</span><strong>jyotiai.in</strong></div></div></article></section>
    </main>
  </div>
}
