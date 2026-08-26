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
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const [response, contractResponse] = await Promise.all([
    canonicalAdminFetch('/api/admin/mission/health'),
    canonicalAdminFetch('/api/admin/contract'),
  ])

  const health = response.ok ? await response.json().catch(() => null) : null
  const contractPayload = contractResponse.ok ? await contractResponse.json().catch(() => null) : null
  const contract = contractPayload?.contract
  const capabilities = Array.isArray(contract?.capabilities) ? contract.capabilities : []
  const backendReady = contractResponse.ok && contract?.contract === 'mission-control'
  const subscriptionHealth = health?.subscriptions || {}
  const cards = [
    ['Active subscriptions', subscriptionHealth.active],
    ['Pending subscriptions', subscriptionHealth.pending],
    ['Cancelled subscriptions', subscriptionHealth.cancelled],
    ['Expired subscriptions', subscriptionHealth.expired],
  ]

  return <main className="main full-page">
    <div className="eyebrow">Observability</div><h1>Monitoring</h1>
    <p className="muted">Canonical service health plus Mission Control backend-contract readiness.</p>

    {!backendReady && <div className="notice">Your admin session is valid, but the deployed JyotiAI backend does not yet expose the complete Mission Control contract. Some modules can therefore render their interface while canonical data/actions remain unavailable until that backend batch is deployed.</div>}
    {!response.ok && <div className="notice">Mission Control health probe: {probeLabel(response.status)}. This is a backend endpoint status, not a logout or browser-session failure.</div>}

    <section className="metric-grid">
      <article className="metric-card metric-accent"><span>Backend contract</span><strong>{backendReady ? 'Ready' : 'Upgrade'}</strong><small>{backendReady ? contract.version : probeLabel(contractResponse.status)}</small></article>
      {cards.slice(0,3).map(([label, value]) => <article className="metric-card" key={String(label)}><span>{label}</span><strong>{response.ok ? Number(value || 0).toLocaleString('en-IN') : '—'}</strong></article>)}
    </section>

    <section className="panel-grid" style={{marginTop:16}}>
      <article className="card"><div className="section-title">Contract capabilities</div><div className="rows">{capabilities.length ? capabilities.map((capability: string) => <div key={capability}><span>{capability}</span><strong>Available</strong></div>) : <><div><span>Mission Control API</span><strong>{probeLabel(contractResponse.status)}</strong></div><div><span>Admin session</span><strong>Valid</strong></div></>}</div></article>
      <article className="card"><div className="section-title">Service health</div><div className="rows"><div><span>Probe status</span><strong>{response.ok ? 'Available' : probeLabel(response.status)}</strong></div><div><span>Active subscriptions</span><strong>{response.ok ? Number(subscriptionHealth.active || 0).toLocaleString('en-IN') : '—'}</strong></div><div><span>Failed payments</span><strong>{response.ok ? Number(health?.payments?.failed || 0).toLocaleString('en-IN') : '—'}</strong></div><div><span>Pending payments</span><strong>{response.ok ? Number(health?.payments?.pending || 0).toLocaleString('en-IN') : '—'}</strong></div><div><span>Checked</span><strong>{response.ok && health?.checkedAt ? new Date(health.checkedAt).toLocaleString('en-IN') : '—'}</strong></div></div></article>
    </section>
  </main>
}
