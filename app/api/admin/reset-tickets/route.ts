export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { fetchUserTickets, consumeTickets } from '@/lib/payments/ticket-service'

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      try {
        const { uid } = await req.json()
        if (!uid) {
          return NextResponse.json({ error: 'uid is required' }, { status: 400 })
        }

        const current = await fetchUserTickets(uid)
        if (!current) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const consumed = await consumeTickets(uid, {
          aiGuruTickets: current.aiGuruTickets,
          kundaliTickets: current.kundaliTickets,
          lifetimePredictions: current.lifetimePredictions,
        })

        if (!consumed) {
          return NextResponse.json({ error: 'Ticket reset could not be completed' }, { status: 409 })
        }

        return NextResponse.json({ success: true, message: 'Tickets reset successfully' })
      } catch (error: any) {
        console.error('Reset tickets error:', error)
        return NextResponse.json({ error: error.message || 'Failed to reset tickets' }, { status: 500 })
      }
    },
    'tickets.adjust'
  )(request)
}
