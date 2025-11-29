import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * Decrement User Ticket
 * 
 * Decrements a ticket count after feature usage
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const { ticketType } = await request.json()

    if (!ticketType || !['ai_questions', 'kundali_basic'].includes(ticketType)) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 })
    }

    // Get current user data
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    const currentTickets = userData?.tickets || {}
    const currentCount = currentTickets[ticketType] || 0

    // Only decrement if count > 0
    if (currentCount <= 0) {
      return NextResponse.json({ error: 'No tickets available' }, { status: 400 })
    }

    // Decrement ticket
    const updatedTickets = {
      ...currentTickets,
      [ticketType]: Math.max(currentCount - 1, 0),
    }

    await userRef.update({
      tickets: updatedTickets,
    })

    return NextResponse.json({
      success: true,
      tickets: updatedTickets,
    })
  } catch (error: any) {
    console.error('Decrement ticket error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decrement ticket' },
      { status: 500 }
    )
  }
}

