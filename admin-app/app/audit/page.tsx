import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

function date(value: unknown) { if (!value) return '—'; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN') }

export default async function AuditPage() {
  const response = await canonicalAdminFetch('/api/admin/audit?limit=100')
  if (response.status === 401) redirect('/login')
  const payload = response.ok ? await response.json().catch(() => null) : null
  const events = Array.isArray(payload?.events) ? payload.events : []
  return <main className="main standalone-main">
    <div className="eyebrow">Accountability</div><h1>Admin audit</h1>
    <p className="muted">Append-style operational events for privileged actions. Sensitive before/after payloads are intentionally not exposed in this list.</p>
    {!response.ok && <div className="notice">Audit events are unavailable for this role.</div>}
    <section className="card table-card"><table><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Target</th><th>Reason / request</th></tr></thead><tbody>
      {events.map((event: any) => <tr key={event.id}><td>{date(event.createdAt)}</td><td><strong>{event.action}</strong><small>{event.permission || '—'}</small></td><td>{event.actorUid || '—'}</td><td>{[event.targetType, event.targetId].filter(Boolean).join(': ') || '—'}</td><td>{event.reason || event.requestId || '—'}</td></tr>)}
      {!events.length && <tr><td colSpan={5}>No audit events available.</td></tr>}
    </tbody></table></section>
  </main>
}
