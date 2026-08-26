export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { addTickets } from '@/lib/payments/ticket-service'

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      try {
        const { uid, tickets } = await req.json()
        if (!uid || !tickets) {
          return NextResponse.json({ error: 'uid and tickets are required' }, { status: 400 })
        }
        await addTickets(uid, tickets)
        return NextResponse.json({ success: true, message: 'Tickets added successfully' })
      } catch (error: any) {
        console.error('Add tickets error:', error)
        return NextResponse.json({ error: error.message || 'Failed to add tickets' }, { status: 500 })
      }
    },
    'tickets.adjust'
  )(request)
}
