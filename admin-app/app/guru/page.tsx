import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

export default async function GuruPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const userId = typeof params.userId === 'string' ? params.userId : ''
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '100' })
  if (userId) qs.set('userId', userId)
  const response = await canonicalAdminFetch(`/api/admin/guru?${qs.toString()}`)
  if (response.status === 401) redirect('/login')
  const payload = await response.json().catch(() => null)
  const chats = Array.isArray(payload?.chats) ? payload.chats : []
  const errors = chats.filter((c: any) => c.error).length
  const users = new Set(chats.map((c: any) => c.userId).filter(Boolean)).size
  const assistantMessages = chats.filter((c: any) => ['assistant', 'guru', 'ai'].includes(String(c.role).toLowerCase())).length
  const totalChars = chats.reduce((sum: number, c: any) => sum + Number(c.contentLength || 0), 0)
  const avgChars = chats.length ? Math.round(totalChars / chats.length) : 0
  const providers = Array.from(new Set(chats.map((c: any) => c.model).filter(Boolean)))
  const errorRate = chats.length ? Math.round(errors / chats.length * 100) : 0

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>AI Guru</strong></div>
      <header className="topbar overview-hero"><div><div className="eyebrow">AI operations</div><h1>AI Guru control center</h1><p className="muted">Privacy-safe operational visibility into customer conversations, provider usage and error signals.</p></div><div className="header-actions"><Link className="secondary-button" href="/knowledge">Knowledge</Link><Link className="secondary-button" href="/monitoring">Monitoring</Link></div></header>
      {!response.ok && <div className="notice">Guru intelligence is unavailable for this role or request. Conversation content is never fabricated.</div>}

      <section className="metric-grid executive-metrics">
        <article className="metric-card metric-accent"><span>Visible messages</span><strong>{chats.length}</strong><small>{users} customers represented</small></article>
        <article className="metric-card"><span>AI responses</span><strong>{assistantMessages}</strong><small>Assistant / Guru messages</small></article>
        <article className="metric-card"><span>Error rate</span><strong>{errorRate}%</strong><small>{errors} messages with error state</small></article>
        <article className="metric-card"><span>Average message</span><strong>{avgChars}</strong><small>Characters · privacy-safe metadata</small></article>
      </section>

      <section className="command-grid guru-command-grid">
        <article className="card attention-card"><div className="section-title-row"><div><h2 className="section-title">AI operational health</h2><span>Signals from the visible message window</span></div><Link className="row-action" href="/monitoring">System health →</Link></div><div className="attention-list">
          <div className="attention-item"><div><i className="attention-dot danger"/><strong>Message errors</strong><small>Provider or generation errors captured on message records</small></div><b>{errors}</b></div>
          <div className="attention-item"><div><i className="attention-dot neutral"/><strong>Customers represented</strong><small>Unique users in the operational window</small></div><b>{users}</b></div>
          <div className="attention-item"><div><i className="attention-dot warning"/><strong>Provider/model variants</strong><small>Distinct provider identifiers currently visible</small></div><b>{providers.length}</b></div>
        </div></article>
        <article className="card"><div className="section-title-row"><div><h2 className="section-title">Provider footprint</h2><span>Models/providers recorded by Guru messages</span></div></div><div className="rank-list">
          {providers.slice(0, 6).map((provider: any, index) => { const count = chats.filter((c: any) => c.model === provider).length; return <div className="rank-row" key={provider}><span className="rank">{index + 1}</span><div><strong>{provider}</strong><span>{count} messages</span></div><strong>{chats.length ? Math.round(count / chats.length * 100) : 0}%</strong></div> })}
          {!providers.length && <div className="empty-state">Provider metadata is not present in this window.</div>}
        </div></article>
      </section>

      <section className="card payment-ledger">
        <form className="smart-filterbar guru-filter" method="get"><label className="filter-field wide"><span>Customer UID</span><input name="userId" defaultValue={userId} placeholder="Filter operational messages by exact user ID" /></label><button className="action-primary" type="submit">Inspect customer</button>{userId && <Link className="secondary-button" href="/guru">Clear filter</Link>}</form>
        <div className="table-toolbar"><div><strong>Privacy-safe message stream</strong><span>Content preview capped at 240 characters by the canonical API</span></div><span>{chats.length} messages</span></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Customer</th><th>Role</th><th>Provider</th><th>Message preview</th><th>Health</th></tr></thead><tbody>
          {chats.map((chat: any) => <tr key={`${chat.userId}:${chat.id}`}><td>{date(chat.createdAt)}</td><td>{chat.userId ? <Link className="row-action" href={`/users/${chat.userId}`}>Customer 360 →</Link> : '—'}<small className="cell-sub">{chat.userId || 'No user ID'}</small></td><td><span className="customer-pill neutral">{chat.role || 'unknown'}</span></td><td>{chat.model || '—'}</td><td><div className="guru-preview">{chat.contentPreview || '—'}</div><small className="cell-sub">{chat.contentLength ?? 0} characters · preview only</small></td><td>{chat.error ? <><span className="customer-pill danger">Error</span><small className="cell-error">{chat.error}</small></> : <span className="customer-pill good">OK</span>}</td></tr>)}
          {!chats.length && <tr><td colSpan={6} className="empty"><strong>No Guru messages found</strong><span>Try another customer UID or wait for conversation activity.</span></td></tr>}
        </tbody></table></div>
      </section>
      <div className="notice">This console deliberately exposes previews rather than full conversations. Full-text access should only be introduced later behind a separate privacy permission, explicit purpose and audit trail.</div>
    </main>
  )
}
