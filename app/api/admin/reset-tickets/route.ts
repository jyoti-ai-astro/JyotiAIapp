export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { adjustTicketsByAdmin } from '@/lib/payments/ticket-service'

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      try {
        const { uid, reason, correlationId } = await req.json()
        if (!uid || !reason || !correlationId) {
          return NextResponse.json(
            { error: 'uid, reason, and correlationId are required' },
            { status: 400 }
          )
        }

        const result = await adjustTicketsByAdmin({
          uid,
          actorAdminUid: admin.uid,
          reason,
          correlationId,
          reset: true,
        })

        return NextResponse.json({ success: true, ...result })
      } catch (error: any) {
        console.error('Reset tickets error:', error)
        const status = /required|Invalid|negative|Correlation/.test(error.message || '') ? 400 : 500
        return NextResponse.json({ error: error.message || 'Failed to reset tickets' }, { status })
      }
    },
    'tickets.adjust'
  )(request)
}
