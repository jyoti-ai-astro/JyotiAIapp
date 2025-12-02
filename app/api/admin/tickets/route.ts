/**
 * Admin: Get All User Tickets
 * 
 * Pricing & Payments v3 - Phase I
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { adminDb } from '@/lib/firebase/admin'
import { fetchUserTickets } from '@/lib/payments/ticket-service'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const users: any[] = []
      const usersSnapshot = await adminDb.collection('users').get()

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        const tickets = await fetchUserTickets(userDoc.id)
        
        if (tickets) {
          users.push({
            uid: userDoc.id,
            email: userData?.email || 'N/A',
            ...tickets,
          })
        }
      }

      return NextResponse.json({
        success: true,
        users,
      })
    } catch (error: any) {
      console.error('Get tickets error:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch tickets' }, { status: 500 })
    }
  })(request)
}

