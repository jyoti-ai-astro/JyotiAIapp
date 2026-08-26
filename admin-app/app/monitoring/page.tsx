import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

export default async function MonitoringPage() {
  const [response, contractResponse] = await Promise.all([
    canonicalAdminFetch('/api/admin/monitoring/health'),
    canonicalAdminFetch('/api/admin/contract'),
  ])
  if (response.status === 401 || contractResponse.status === 401) redirect('/login')
  const health = response.ok ? await response.json().catch(() => null) : null
  const contractPayload = contractResponse.ok ? await contractResponse.json().catch(() => null) : null
  const contract = contractPayload?.contract
  const capabilities = Array.isArray(contract?.capabilities) ? contract.capabilities : []
  const backendReady = contractResponse.ok && contract?.contract === 'mission-control'
  const cards = [
    ['Active subscriptions', health?.totalActive],
    ['Pending subscriptions', health?.totalPending],
    ['Cancelled subscriptions', health?.totalCancelled],
    ['Expired subscriptions', health?.totalExpired],
  ]

  return <main className="main full-page">
    <div className="eyebrow">Observability</div><h1>Monitoring</h1>
    <p className="muted">Canonical service health plus Mission Control backend-contract readiness.</p>
    {!backendReady && <div className="notice">The deployed JyotiAI backend is older than the current Mission Control API contract. Some admin modules may show unavailable/zero states until the canonical backend branch is deployed.</div>}
    {!response.ok && <div className="notice">Subscription monitoring data is unavailable from the current canonical backend.</div>}

    <section className="metric-grid">
      <article className="metric-card metric-accent"><span>Backend contract</span><strong>{backendReady ? 'Ready' : 'Upgrade'}</strong><small>{backendReady ? contract.version : `HTTP ${contractResponse.status}`}</small></article>
      {cards.slice(0,3).map(([label, value]) => <article className="metric-card" key={String(label)}><span>{label}</span><strong>{Number(value || 0).toLocaleString('en-IN')}</strong></article>)}
    </section>

    <section className="panel-grid" style={{marginTop:16}}>
      <article className="card"><div className="section-title">Contract capabilities</div><div className="rows">{capabilities.length ? capabilities.map((capability: string) => <div key={capability}><span>{capability}</span><strong>Available</strong></div>) : <div><span>Mission Control API</span><strong>Not deployed yet</strong></div>}</div></article>
      <article className="card"><div className="section-title">Subscription health</div><div className="rows"><div><span>Active</span><strong>{Number(health?.totalActive || 0).toLocaleString('en-IN')}</strong></div><div><span>Pending</span><strong>{Number(health?.totalPending || 0).toLocaleString('en-IN')}</strong></div><div><span>Cancelled</span><strong>{Number(health?.totalCancelled || 0).toLocaleString('en-IN')}</strong></div><div><span>Expired</span><strong>{Number(health?.totalExpired || 0).toLocaleString('en-IN')}</strong></div></div></article>
    </section>
  </main>
}
