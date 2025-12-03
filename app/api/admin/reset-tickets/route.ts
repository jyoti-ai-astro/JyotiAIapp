/**
 * Admin: Reset Tickets
 * 
 * Pricing & Payments v3 - Phase I
 * 
 * Admin API to reset all tickets for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { uid } = await req.json()

      if (!uid) {
        return NextResponse.json({ error: 'uid is required' }, { status: 400 })
      }

      const userRef = adminDb.collection('users').doc(uid)
      await userRef.update({
        aiGuruTickets: 0,
        kundaliTickets: 0,
        lifetimePredictions: 0,
        tickets: 0,
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: 'Tickets reset successfully',
      })
    } catch (error: any) {
      console.error('Reset tickets error:', error)
      return NextResponse.json({ error: error.message || 'Failed to reset tickets' }, { status: 500 })
    }
  })(request)
}

