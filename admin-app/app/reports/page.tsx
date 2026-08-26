import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

function statusTone(status: unknown) {
  const value = String(status || 'unknown').toLowerCase()
  if (['completed', 'success', 'ready'].includes(value)) return 'good'
  if (['failed', 'error'].includes(value)) return 'danger'
  if (['pending', 'queued', 'processing'].includes(value)) return 'warning'
  return 'neutral'
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
  const failed = reports.filter((r: any) => ['failed', 'error'].includes(String(r.status).toLowerCase())).length
  const pending = reports.filter((r: any) => ['pending', 'queued', 'processing'].includes(String(r.status).toLowerCase())).length
  const completionRate = reports.length ? Math.round((completed / reports.length) * 100) : 0
  const types = Array.from(new Set(reports.map((r: any) => r.type).filter(Boolean)))

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Reports</strong></div>
      <header className="topbar overview-hero">
        <div><div className="eyebrow">Report operations</div><h1>Report control center</h1><p className="muted">Generation health, delivery failures and customer report history from the canonical report ledger.</p></div>
        <div className="header-actions"><Link className="secondary-button" href="/jobs">Generation jobs</Link><Link className="secondary-button" href="/monitoring">System health</Link></div>
      </header>

      {!response.ok && <div className="notice">Report intelligence is unavailable for this role or request. No operational state is fabricated.</div>}

      <section className="metric-grid executive-metrics">
        <article className="metric-card metric-accent"><span>Completion rate</span><strong>{completionRate}%</strong><small>{completed} completed in visible window</small></article>
        <article className="metric-card"><span>In flight</span><strong>{pending}</strong><small>Queued / processing</small></article>
        <article className="metric-card"><span>Failed</span><strong>{failed}</strong><small>{failed ? 'Needs operational attention' : 'No visible failures'}</small></article>
        <article className="metric-card"><span>Report products</span><strong>{types.length}</strong><small>{reports.length} visible generation records</small></article>
      </section>

      <section className="command-grid reports-command-grid">
        <article className="card attention-card">
          <div className="section-title-row"><div><h2 className="section-title">Generation health</h2><span>Immediate queue and delivery posture</span></div><Link className="row-action" href="/jobs">Open jobs →</Link></div>
          <div className="attention-list">
            <div className="attention-item"><div><i className="attention-dot danger"/><strong>Failed generations</strong><small>Report records requiring investigation</small></div><b>{failed}</b></div>
            <div className="attention-item"><div><i className="attention-dot warning"/><strong>In-flight generations</strong><small>Queued or processing in this window</small></div><b>{pending}</b></div>
            <div className="attention-item"><div><i className="attention-dot neutral"/><strong>Completed outputs</strong><small>Ready / success / completed records</small></div><b>{completed}</b></div>
          </div>
        </article>
        <article className="card">
          <div className="section-title-row"><div><h2 className="section-title">Product mix</h2><span>Report types in the current window</span></div></div>
          <div className="rank-list">
            {types.slice(0, 6).map((reportType: any, index) => {
              const count = reports.filter((r: any) => r.type === reportType).length
              return <div className="rank-row" key={reportType}><span className="rank">{index + 1}</span><div><strong>{reportType}</strong><span>{count} generation records</span></div><strong>{reports.length ? Math.round(count / reports.length * 100) : 0}%</strong></div>
            })}
            {!types.length && <div className="empty-state">No report product data in this window.</div>}
          </div>
        </article>
      </section>

      <section className="card payment-ledger">
        <form className="smart-filterbar reports-filter" method="get">
          <label className="filter-field wide"><span>Search</span><input name="search" defaultValue={search} placeholder="Report ID, customer, type or title…" /></label>
          <label className="filter-field"><span>Report type</span><input name="type" defaultValue={type} placeholder="All types" /></label>
          <label className="filter-field"><span>Status</span><select name="status" defaultValue={status}><option value="">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option></select></label>
          <button className="action-primary" type="submit">Apply filters</button>
        </form>
        <div className="table-toolbar"><div><strong>Generation ledger</strong><span>Canonical report records · newest first</span></div><span>{reports.length} records</span></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Created</th><th>Customer</th><th>Report</th><th>Status</th><th>Completed</th><th>Output / error</th></tr></thead><tbody>
          {reports.map((report: any) => <tr key={`${report.userId || 'unknown'}:${report.id}`}><td>{date(report.createdAt)}</td><td>{report.userId ? <Link className="row-action" href={`/users/${report.userId}`}>Customer 360 →</Link> : '—'}<small className="cell-sub">{report.userId || 'No user ID'}</small></td><td><strong>{report.title || report.type || 'Unknown report'}</strong><small className="cell-sub">{report.type || 'unknown'} · {report.id}</small></td><td><span className={`customer-pill ${statusTone(report.status)}`}>{report.status || 'unknown'}</span></td><td>{date(report.completedAt || report.updatedAt)}</td><td>{report.storageUrl ? <a className="text-link" href={report.storageUrl} target="_blank" rel="noreferrer">Open output ↗</a> : '—'}{report.error && <small className="cell-error">{report.error}</small>}</td></tr>)}
          {!reports.length && <tr><td colSpan={6} className="empty"><strong>No matching reports</strong><span>Change the filters or wait for report generation activity.</span></td></tr>}
        </tbody></table></div>
      </section>
      <div className="notice">Report regeneration remains intentionally disabled here. Recovery must use a dedicated audited job action so retries cannot silently duplicate customer entitlements or provider cost.</div>
    </main>
  )
}
