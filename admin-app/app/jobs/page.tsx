import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

function date(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN')
}

export default async function JobsPage() {
  const response = await canonicalAdminFetch('/api/admin/jobs')
  if (response.status === 401) redirect('/login')
  const payload = response.ok ? await response.json().catch(() => null) : null
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : []

  return <main className="main standalone-main">
    <div className="eyebrow">Operations</div><h1>Background jobs</h1>
    <p className="muted">Read-only scheduler and worker state. Manual triggers remain permissioned and audited in the canonical backend.</p>
    {!response.ok && <div className="notice">Job status is unavailable for this role.</div>}
    <section className="card table-card"><table><thead><tr><th>Job</th><th>Schedule</th><th>Status</th><th>Last run</th><th>Next run</th><th>Failures</th></tr></thead><tbody>
      {jobs.map((job: any) => <tr key={job.id}><td><strong>{job.name || job.id}</strong><small>{job.id}</small></td><td>{job.schedule || '—'}</td><td><span className="status-pill">{job.status || 'unknown'}</span></td><td>{date(job.lastRun)}</td><td>{date(job.nextRun)}</td><td>{Number(job.failures || 0)}</td></tr>)}
      {!jobs.length && <tr><td colSpan={6}>No job records available.</td></tr>}
    </tbody></table></section>
  </main>
}
