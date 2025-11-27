import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateDailyHoroscope } from '@/lib/engines/horoscope/daily-horoscope'

/**
 * Get Today's Horoscope
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 2
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

    // Get user profile
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    const rashi = userData?.rashi

    if (!rashi) {
      return NextResponse.json(
        { error: 'Rashi not found. Please complete onboarding.' },
        { status: 400 }
      )
    }

    // Get Kundali for additional signs
    let moonSign = rashi
    let sunSign = undefined
    let ascendant = undefined

    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (kundaliSnap.exists) {
      const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
      if (D1Snap.exists) {
        const D1Data = D1Snap.data()
        moonSign = D1Data?.grahas?.moon?.sign || rashi
        sunSign = D1Data?.grahas?.sun?.sign
        ascendant = D1Data?.lagna?.sign
      }
    }

    // Generate horoscope
    const horoscope = await generateDailyHoroscope(rashi, moonSign, sunSign, ascendant)

    return NextResponse.json({
      success: true,
      horoscope,
    })
  } catch (error: any) {
    console.error('Get horoscope error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get horoscope' },
      { status: 500 }
    )
  }
}

