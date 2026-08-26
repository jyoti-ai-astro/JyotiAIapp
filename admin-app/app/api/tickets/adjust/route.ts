import { NextRequest, NextResponse } from 'next/server'
import { canonicalAdminFetch } from '@/lib/canonical-api'

const ALLOWED_KEYS = new Set(['aiGuruTickets', 'kundaliTickets', 'lifetimePredictions'])

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const uid = String(body.uid || '').trim()
  const action = body.action === 'remove' ? 'remove' : body.action === 'add' ? 'add' : ''
  const ticketType = String(body.ticketType || '')
  const amount = Number(body.amount)
  const reason = String(body.reason || '').trim()
  const correlationId = String(body.correlationId || '').trim()

  if (!uid || !action || !ALLOWED_KEYS.has(ticketType) || !Number.isSafeInteger(amount) || amount <= 0 || reason.length < 5 || !correlationId) {
    return NextResponse.json({ error: 'uid, action, valid ticket type, positive integer amount, reason, and correlationId are required' }, { status: 400 })
  }

  const upstream = await canonicalAdminFetch(action === 'add' ? '/api/admin/add-tickets' : '/api/admin/remove-tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, tickets: { [ticketType]: amount }, reason, correlationId }),
  })

  const payload = await upstream.json().catch(() => ({ error: 'Ticket adjustment failed' }))
  return NextResponse.json(payload, { status: upstream.status })
}
