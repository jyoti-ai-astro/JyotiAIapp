import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''
  const type = typeof params.type === 'string' ? params.type : ''
  const status = typeof params.status === 'string' ? params.status : ''

  const me = await canonicalAdminFetch('/api/admin/me')
  if (me.status === 401) redirect('/login')

  const qs = new URLSearchParams({ limit: '75' })
  if (search) qs.set('search', search)
  if (type) qs.set('type', type)
  if (status) qs.set('status', status)

  const response = await canonicalAdminFetch(`/api/admin/reports?${qs.toString()}`)
  if (response.status === 401) redirect('/login')
  const payload = await response.json().catch(() => null)
  const reports = Array.isArray(payload?.reports) ? payload.reports : []

  const completed = reports.filter((r: any) => ['completed', 'success', 'ready'].includes(String(r.status).toLowerCase())).length
  const failed = reports.filter((r: any) => String(r.status).toLowerCase() === 'failed').length
  const pending = reports.filter((r: any) => ['pending', 'queued', 'processing'].includes(String(r.status).toLowerCase())).length

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Reports</strong></div>
      <header className="topbar">
        <div>
          <div className="eyebrow">Report operations</div>
          <h1>Reports</h1>
          <p className="muted">Read-safe report queue and generation history. Generic regeneration is disabled until it has a dedicated audited job path.</p>
        </div>
      </header>

      {!response.ok && <div className="notice">Report data is unavailable for this role or request.</div>}

      <section className="metric-grid">
        <article className="metric-card"><span>Visible reports</span><strong>{reports.length}</strong><small>Current filtered window</small></article>
        <article className="metric-card"><span>Completed</span><strong>{completed}</strong><small>Ready / success</small></article>
        <article className="metric-card"><span>Pending</span><strong>{pending}</strong><small>Queued / processing</small></article>
        <article className="metric-card"><span>Failed</span><strong>{failed}</strong><small>Needs investigation</small></article>
      </section>

      <section className="card">
        <form className="filterbar reports-filter" method="get">
          <input name="search" defaultValue={search} placeholder="Search report, user, type, title…" />
          <input name="type" defaultValue={type} placeholder="Type" />
          <select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <button type="submit">Filter</button>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Created</th><th>User</th><th>Type / Title</th><th>Status</th><th>Completed</th><th>Output / Error</th></tr></thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={`${report.userId || 'unknown'}:${report.id}`}>
                  <td>{date(report.createdAt)}</td>
                  <td>{report.userId ? <Link href={`/users/${report.userId}`}>{report.userId}</Link> : '—'}</td>
                  <td><strong>{report.type || 'unknown'}</strong>{report.title && <small className="cell-sub">{report.title}</small>}<small className="cell-sub">{report.id}</small></td>
                  <td><span className={`status status-${String(report.status || 'unknown').toLowerCase()}`}>{report.status || 'unknown'}</span></td>
                  <td>{date(report.completedAt || report.updatedAt)}</td>
                  <td>
                    {report.storageUrl ? <a className="text-link" href={report.storageUrl} target="_blank" rel="noreferrer">Open output</a> : '—'}
                    {report.error && <small className="cell-error">{report.error}</small>}
                  </td>
                </tr>
              ))}
              {!reports.length && <tr><td colSpan={6} className="empty">No matching reports.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
