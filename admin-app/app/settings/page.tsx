import { redirect } from 'next/navigation'
import { canonicalAdminFetch } from '@/lib/canonical-api'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const response = await canonicalAdminFetch('/api/admin/settings')
  if (response.status === 401) redirect('/login')
  const payload = response.ok ? await response.json().catch(() => null) : null
  const settings = payload?.settings || {}
  const rows = [
    ['AI provider', settings.aiProvider],
    ['Embedding provider', settings.embeddingProvider],
    ['Beta mode', String(Boolean(settings.betaMode))],
    ['Guru usage limit', settings.guruUsageLimit],
    ['Daily horoscope time', settings.dailyHoroscopeTime],
    ['Maintenance mode', String(Boolean(settings.maintenanceMode))],
  ]
  return <main className="main standalone-main">
    <div className="eyebrow">Configuration</div><h1>Settings</h1>
    <p className="muted">Current allowlisted system settings. Mutations remain server-validated, reason-required and audited.</p>
    {!response.ok && <div className="notice">Settings are unavailable for this role.</div>}
    <section className="card"><div className="rows">{rows.map(([label, value]) => <div key={String(label)}><span>{label}</span><strong>{value == null || value === '' ? '—' : String(value)}</strong></div>)}</div></section>
  </main>
}
