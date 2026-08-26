import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

function probeLabel(status: number) {
  if (status === 404) return 'Not deployed'
  if (status === 401) return 'Probe unauthorized'
  if (status === 403) return 'Probe forbidden'
  if (status >= 500) return 'Backend error'
  return `HTTP ${status}`
}

export default async function MonitoringPage() {
  // Only /me is authoritative for deciding whether the browser session is invalid.
  // Operational probes must never log the administrator out merely because an
  // older deployed backend does not expose/authorize a newer Mission Control API.
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const [response, contractResponse] = await Promise.all([
    canonicalAdminFetch('/api/admin/monitoring/health'),
    canonicalAdminFetch('/api/admin/contract'),
  ])

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

    {!backendReady && <div className="notice">Your admin session is valid, but the deployed JyotiAI backend does not yet expose the complete Mission Control contract. Some modules can therefore render their interface while canonical data/actions remain unavailable until that backend batch is deployed.</div>}
    {!response.ok && <div className="notice">Subscription-health probe: {probeLabel(response.status)}. This is a backend endpoint status, not a logout or browser-session failure.</div>}

    <section className="metric-grid">
      <article className="metric-card metric-accent"><span>Backend contract</span><strong>{backendReady ? 'Ready' : 'Upgrade'}</strong><small>{backendReady ? contract.version : probeLabel(contractResponse.status)}</small></article>
      {cards.slice(0,3).map(([label, value]) => <article className="metric-card" key={String(label)}><span>{label}</span><strong>{response.ok ? Number(value || 0).toLocaleString('en-IN') : '—'}</strong></article>)}
    </section>

    <section className="panel-grid" style={{marginTop:16}}>
      <article className="card"><div className="section-title">Contract capabilities</div><div className="rows">{capabilities.length ? capabilities.map((capability: string) => <div key={capability}><span>{capability}</span><strong>Available</strong></div>) : <><div><span>Mission Control API</span><strong>{probeLabel(contractResponse.status)}</strong></div><div><span>Admin session</span><strong>Valid</strong></div></>}</div></article>
      <article className="card"><div className="section-title">Subscription health</div><div className="rows"><div><span>Probe status</span><strong>{response.ok ? 'Available' : probeLabel(response.status)}</strong></div><div><span>Active</span><strong>{response.ok ? Number(health?.totalActive || 0).toLocaleString('en-IN') : '—'}</strong></div><div><span>Pending</span><strong>{response.ok ? Number(health?.totalPending || 0).toLocaleString('en-IN') : '—'}</strong></div><div><span>Cancelled</span><strong>{response.ok ? Number(health?.totalCancelled || 0).toLocaleString('en-IN') : '—'}</strong></div><div><span>Expired</span><strong>{response.ok ? Number(health?.totalExpired || 0).toLocaleString('en-IN') : '—'}</strong></div></div></article>
    </section>
  </main>
}
