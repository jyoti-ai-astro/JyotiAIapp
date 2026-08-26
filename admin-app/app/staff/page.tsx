import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'
function date(value: unknown) { if (!value) return '—'; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN') }

export default async function StaffPage() {
  const response = await canonicalAdminFetch('/api/admin/settings/staff')
  if (response.status === 401) redirect('/login')
  const payload = response.ok ? await response.json().catch(() => null) : null
  const staff = Array.isArray(payload?.staff) ? payload.staff : []
  return <main className="main standalone-main">
    <div className="eyebrow">Access control</div><h1>Staff</h1>
    <p className="muted">Authorized control-plane identities and roles. Role changes remain behind <code>staff.manage</code>, require a reason, and are audited.</p>
    {!response.ok && <div className="notice">Staff records are unavailable for this role.</div>}
    <section className="card table-card"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Updated</th></tr></thead><tbody>
      {staff.map((member: any) => <tr key={member.uid}><td><strong>{member.name || 'Unnamed'}</strong><small>{member.uid}</small></td><td>{member.email}</td><td><span className="status-pill">{member.role}</span></td><td>{date(member.createdAt)}</td><td>{date(member.updatedAt)}</td></tr>)}
      {!staff.length && <tr><td colSpan={5}>No staff records available.</td></tr>}
    </tbody></table></section>
  </main>
}
