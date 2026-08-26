import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

const nav = ['Overview', 'Users', 'Payments', 'Subscriptions', 'Tickets', 'Reports', 'Guru', 'Knowledge', 'Jobs', 'Monitoring', 'Audit', 'Backups', 'Staff', 'Settings']

export default async function DashboardPage() {
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const payload = await me.json().catch(() => null)
  if (!me.ok || !payload) redirect('/login')

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">JyotiAI Admin</div>
        <nav className="nav">
          {nav.map((item) => <a href="#" key={item}>{item}</a>)}
        </nav>
      </aside>
      <main className="main">
        <div className="muted">Secure control plane</div>
        <h1>Overview</h1>
        <p className="muted">Signed in as {payload.admin?.email || payload.email || 'authorized staff'}.</p>
        <section className="grid">
          <div className="card"><div className="muted">Users</div><h2>—</h2></div>
          <div className="card"><div className="muted">Payments</div><h2>—</h2></div>
          <div className="card"><div className="muted">Ticket liability</div><h2>—</h2></div>
          <div className="card"><div className="muted">System health</div><h2>—</h2></div>
        </section>
      </main>
    </div>
  )
}
