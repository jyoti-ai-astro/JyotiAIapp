export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { adjustTicketsByAdmin } from '@/lib/payments/ticket-service'

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      try {
        const { uid, tickets, reason, correlationId } = await req.json()
        if (!uid || !tickets || !reason || !correlationId) {
          return NextResponse.json(
            { error: 'uid, tickets, reason, and correlationId are required' },
            { status: 400 }
          )
        }

        const deltas = Object.fromEntries(
          Object.entries(tickets).map(([key, value]) => [key, Math.abs(Number(value))])
        )
        const result = await adjustTicketsByAdmin({
          uid,
          actorAdminUid: admin.uid,
          reason,
          correlationId,
          deltas,
        })

        return NextResponse.json({ success: true, ...result })
      } catch (error: any) {
        console.error('Add tickets error:', error)
        const status = /required|Invalid|negative|Correlation/.test(error.message || '') ? 400 : 500
        return NextResponse.json({ error: error.message || 'Failed to add tickets' }, { status })
      }
    },
    'tickets.adjust'
  )(request)
}
