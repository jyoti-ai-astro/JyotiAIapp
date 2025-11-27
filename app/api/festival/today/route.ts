import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getFestivalToday, checkDashaSensitivity } from '@/lib/engines/festival/festival-engine'

/**
 * Get Today's Festival
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 4
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

    // Get festival for today
    const festival = getFestivalToday()

    if (!festival) {
      return NextResponse.json({
        success: true,
        festival: null,
        message: 'No festival today',
      })
    }

    // Check Dasha sensitivity
    let dashaSensitive = false
    let currentDasha = ''

    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (kundaliSnap.exists) {
      const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
      if (dashaSnap.exists) {
        currentDasha = dashaSnap.data()?.currentMahadasha?.planet || ''
        dashaSensitive = checkDashaSensitivity(festival, currentDasha)
      }
    }

    return NextResponse.json({
      success: true,
      festival: {
        ...festival,
        date: festival.date.toISOString(),
      },
      dashaSensitive,
      currentDasha,
    })
  } catch (error: any) {
    console.error('Get festival error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get festival' },
      { status: 500 }
    )
  }
}

