import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

export default async function MonitoringPage() {
  const response = await canonicalAdminFetch('/api/admin/monitoring/health')
  if (response.status === 401) redirect('/login')
  const health = response.ok ? await response.json().catch(() => null) : null
  const cards = [
    ['Active subscriptions', health?.totalActive],
    ['Pending subscriptions', health?.totalPending],
    ['Cancelled subscriptions', health?.totalCancelled],
    ['Expired subscriptions', health?.totalExpired],
  ]
  return <main className="main standalone-main">
    <div className="eyebrow">Observability</div><h1>Monitoring</h1>
    <p className="muted">Canonical subscription health. Additional webhook, payment and worker health signals will join this surface as their contracts are hardened.</p>
    {!response.ok && <div className="notice">Monitoring data is unavailable for this role.</div>}
    <section className="metric-grid">{cards.map(([label, value]) => <article className="metric-card" key={String(label)}><span>{label}</span><strong>{Number(value || 0).toLocaleString('en-IN')}</strong></article>)}</section>
  </main>
}
