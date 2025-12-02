/**
 * Get User Tickets (Client API)
 * 
 * Pricing & Payments v3 - Phase L
 * 
 * Client-side API to get user ticket info
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { splitSubscriptionAndTickets } from '@/lib/payments/ticket-service'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    const info = await splitSubscriptionAndTickets(uid)
    return NextResponse.json(info)
  } catch (error: any) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get tickets' }, { status: 500 })
  }
}

