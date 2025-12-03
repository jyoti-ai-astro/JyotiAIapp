export const dynamic = 'force-dynamic'
/**
 * Admin: Add Tickets
 * 
 * Pricing & Payments v3 - Phase I
 * 
 * Admin API to add tickets to user accounts
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { addTickets } from '@/lib/payments/ticket-service'
import { adminDb } from '@/lib/firebase/admin'

export async function POST(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { uid, tickets } = await req.json()

      if (!uid || !tickets) {
        return NextResponse.json({ error: 'uid and tickets are required' }, { status: 400 })
      }

      await addTickets(uid, tickets)

      return NextResponse.json({
        success: true,
        message: 'Tickets added successfully',
      })
    } catch (error: any) {
      console.error('Add tickets error:', error)
      return NextResponse.json({ error: error.message || 'Failed to add tickets' }, { status: 500 })
    }
  })(request)
}

