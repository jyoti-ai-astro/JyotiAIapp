import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'
function date(value: unknown) { if (!value) return '—'; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN') }

export default async function BackupsPage() {
  const response = await canonicalAdminFetch('/api/admin/backup')
  if (response.status === 401) redirect('/login')
  const payload = response.ok ? await response.json().catch(() => null) : null
  const backups = Array.isArray(payload?.backups) ? payload.backups : []
  return <main className="main standalone-main">
    <div className="eyebrow">Recovery</div><h1>Backups</h1>
    <div className="notice">Backup creation is intentionally disabled until durable object storage, encryption, retention and restore verification are implemented. Legacy /tmp backups are not considered production backups.</div>
    {!response.ok && <div className="notice">Backup metadata is unavailable for this role.</div>}
    <section className="card table-card"><table><thead><tr><th>Created</th><th>Status</th><th>Storage</th><th>Collections</th><th>Created by</th></tr></thead><tbody>
      {backups.map((backup: any) => <tr key={backup.id}><td>{date(backup.createdAt)}</td><td>{backup.status || 'unknown'}</td><td>{backup.storage || '—'}</td><td>{Array.isArray(backup.collections) ? backup.collections.join(', ') : backup.collections || 'all'}</td><td>{backup.createdBy || '—'}</td></tr>)}
      {!backups.length && <tr><td colSpan={5}>No backup metadata available.</td></tr>}
    </tbody></table></section>
  </main>
}
