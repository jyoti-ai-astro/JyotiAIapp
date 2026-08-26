export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { consumeTickets } from '@/lib/payments/ticket-service'

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      try {
        const { uid, tickets } = await req.json()
        if (!uid || !tickets) {
          return NextResponse.json({ error: 'uid and tickets are required' }, { status: 400 })
        }
        const consumed = await consumeTickets(uid, tickets)
        if (!consumed) {
          return NextResponse.json({ error: 'User does not have enough tickets' }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: 'Tickets removed successfully' })
      } catch (error: any) {
        console.error('Remove tickets error:', error)
        return NextResponse.json({ error: error.message || 'Failed to remove tickets' }, { status: 500 })
      }
    },
    'tickets.adjust'
  )(request)
}
