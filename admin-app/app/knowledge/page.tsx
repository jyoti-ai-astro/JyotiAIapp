import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

export default async function KnowledgePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const category = typeof params.category === 'string' ? params.category : ''
  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '75' })
  if (search) qs.set('search', search)
  if (category) qs.set('category', category)
  const response = await canonicalAdminFetch(`/api/admin/knowledge?${qs.toString()}`)
  if (response.status === 401) redirect('/login')
  const payload = await response.json().catch(() => null)
  const documents = Array.isArray(payload?.documents) ? payload.documents : []
  const indexed = documents.filter((d: any) => d.vectorIndexed).length
  const categories = new Set(documents.map((d: any) => d.category).filter(Boolean)).size

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Knowledge</strong></div>
      <header className="topbar"><div><div className="eyebrow">RAG knowledge operations</div><h1>Knowledge</h1><p className="muted">Read-safe knowledge catalog. Direct Firestore/Pinecone writes are disabled until the retry-safe indexing job is enabled.</p></div></header>
      {!response.ok && <div className="notice">Knowledge data is unavailable for this role or request.</div>}
      <section className="metric-grid">
        <article className="metric-card"><span>Visible documents</span><strong>{documents.length}</strong><small>Current filtered window</small></article>
        <article className="metric-card"><span>Vector indexed</span><strong>{indexed}</strong><small>Observed indexed state</small></article>
        <article className="metric-card"><span>Categories</span><strong>{categories}</strong><small>Distinct categories visible</small></article>
        <article className="metric-card"><span>Write mode</span><strong>Paused</strong><small>Awaiting retry-safe job flow</small></article>
      </section>
      <section className="card">
        <form className="filterbar knowledge-filter" method="get"><input name="search" defaultValue={search} placeholder="Search title, category, tag…" /><input name="category" defaultValue={category} placeholder="Category" /><button type="submit">Filter</button></form>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Updated</th><th>Title</th><th>Category</th><th>Tags</th><th>Index</th><th>Preview</th></tr></thead><tbody>
          {documents.map((doc: any) => <tr key={doc.id}><td>{date(doc.updatedAt || doc.createdAt)}</td><td><strong>{doc.title}</strong><small className="cell-sub">{doc.id}</small></td><td>{doc.category}</td><td>{Array.isArray(doc.tags) && doc.tags.length ? doc.tags.join(', ') : '—'}</td><td><span className={`status ${doc.vectorIndexed ? 'status-success' : 'status-pending'}`}>{doc.vectorIndexed ? 'Indexed' : 'Unknown'}</span></td><td>{doc.contentPreview || '—'}<small className="cell-sub">{doc.contentLength ?? 0} chars</small></td></tr>)}
          {!documents.length && <tr><td colSpan={6} className="empty">No knowledge documents found.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  )
}
