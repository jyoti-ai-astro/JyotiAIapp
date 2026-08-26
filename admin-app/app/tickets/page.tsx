'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

const ticketTypes = [
  ['aiGuruTickets', 'AI Guru'],
  ['kundaliTickets', 'Kundali'],
  ['lifetimePredictions', 'Predictions'],
] as const

export default function TicketsPage() {
  const [status, setStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setStatus('')
    const form = new FormData(event.currentTarget)
    const payload = {
      uid: form.get('uid'),
      action: form.get('action'),
      ticketType: form.get('ticketType'),
      amount: Number(form.get('amount')),
      reason: form.get('reason'),
      correlationId: crypto.randomUUID(),
    }

    const response = await fetch('/api/tickets/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setStatus(result.error || 'Ticket adjustment failed')
      return
    }
    setStatus(`Success. ${payload.ticketType}: ${result.before?.[payload.ticketType] ?? '—'} → ${result.after?.[payload.ticketType] ?? '—'}`)
    event.currentTarget.reset()
  }

  return (
    <main className="main full-page">
      <div className="breadcrumbs"><Link href="/">Overview</Link><span>/</span><strong>Tickets</strong></div>
      <header className="topbar">
        <div>
          <div className="eyebrow">Audited entitlement control</div>
          <h1>Tickets</h1>
          <p className="muted">Every manual adjustment is permissioned, transactional, idempotent, and audited.</p>
        </div>
      </header>

      <section className="card narrow-card">
        <div className="notice">Use the user detail screen to inspect current balances before making an adjustment. Manual credits are not payment revenue.</div>
        <form onSubmit={submit} className="stack-form">
          <label>User UID<input name="uid" required placeholder="Firebase user UID" /></label>
          <label>Action<select name="action" defaultValue="add"><option value="add">Add tickets</option><option value="remove">Remove tickets</option></select></label>
          <label>Ticket type<select name="ticketType" defaultValue="aiGuruTickets">{ticketTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Amount<input name="amount" required type="number" min="1" step="1" /></label>
          <label>Reason<textarea name="reason" required minLength={5} placeholder="Required operational reason" /></label>
          <button className="primary" disabled={busy} type="submit">{busy ? 'Applying…' : 'Apply audited adjustment'}</button>
        </form>
        {status && <div className="notice" style={{ marginTop: 16 }}>{status}</div>}
      </section>
    </main>
  )
}
