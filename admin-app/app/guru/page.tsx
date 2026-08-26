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

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Guru</strong></div>
      <header className="topbar"><div><div className="eyebrow">AI Guru operations</div><h1>Guru</h1><p className="muted">Operational message previews only; full conversation documents are not exposed by the listing API.</p></div></header>
      {!response.ok && <div className="notice">Guru data is unavailable for this role or request.</div>}
      <section className="metric-grid">
        <article className="metric-card"><span>Visible messages</span><strong>{chats.length}</strong><small>Latest operational window</small></article>
        <article className="metric-card"><span>Users represented</span><strong>{users}</strong><small>Unique users</small></article>
        <article className="metric-card"><span>Errors</span><strong>{errors}</strong><small>Messages with error state</small></article>
        <article className="metric-card"><span>Privacy mode</span><strong>Preview</strong><small>Content capped to 240 chars</small></article>
      </section>
      <section className="card">
        <form className="filterbar guru-filter" method="get">
          <input name="userId" defaultValue={userId} placeholder="Filter by user ID" />
          <button type="submit">Filter</button>
        </form>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>User</th><th>Role</th><th>Provider</th><th>Preview</th><th>Error</th></tr></thead><tbody>
          {chats.map((chat: any) => <tr key={`${chat.userId}:${chat.id}`}><td>{date(chat.createdAt)}</td><td>{chat.userId ? <Link href={`/users/${chat.userId}`}>{chat.userId}</Link> : '—'}</td><td>{chat.role || 'unknown'}</td><td>{chat.model || '—'}</td><td>{chat.contentPreview || '—'}<small className="cell-sub">{chat.contentLength ?? 0} chars</small></td><td>{chat.error ? <small className="cell-error">{chat.error}</small> : '—'}</td></tr>)}
          {!chats.length && <tr><td colSpan={6} className="empty">No Guru messages found.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  )
}
