import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * Get Guru Chat History
 * Part B - Section 5: AI Guru
 * Milestone 5 - Step 5
 */
export async function GET(request: NextRequest) {
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

    const { limit = 50 } = Object.fromEntries(new URL(request.url).searchParams)

    // Get chat history
    const chatRef = adminDb.collection('guruChat').doc(uid).collection('messages')
    const chatSnap = await chatRef.orderBy('createdAt', 'desc').limit(parseInt(limit as string)).get()

    const messages = chatSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }))

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error: any) {
    console.error('Get chat history error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get chat history' },
      { status: 500 }
    )
  }
}

