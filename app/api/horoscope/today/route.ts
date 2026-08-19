import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateDailyHoroscope } from '@/lib/engines/horoscope/daily-horoscope'
import { logEvent } from '@/lib/logging/log-event'

export const dynamic = 'force-dynamic'

/**
 * Get Today's Horoscope
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 2
 *
 * Design:
 * - Auth + Firestore failures still return proper error codes.
 * - Horoscope engine failures fall back to a safe canned message
 *   but STILL return success: true so the UI can always render something.
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

    // Get Kundali for additional signs (non-fatal)
    let moonSign: string | undefined = rashi
    let sunSign: string | undefined = undefined
    let ascendant: string | undefined = undefined

    try {
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
    } catch (kundaliError: any) {
      console.warn('Horoscope: failed to read Kundali chart, falling back to rashi only:', kundaliError)
      // Non-fatal – we can still generate using rashi alone.
    }

    // Generate horoscope with graceful fallback
    let horoscopeText =
      'Horoscope engine is warming up. Try again later — dev mode fallback.'
    let mode: 'live' | 'fallback' = 'fallback'

    try {
      const generated = await generateDailyHoroscope(rashi, moonSign, sunSign, ascendant)
      if (generated && typeof generated === 'string') {
        horoscopeText = generated
        mode = 'live'
      }
    } catch (engineError: any) {
      console.error('Daily horoscope generation error:', engineError)
      // Log but do not break the API contract
      try {
        await logEvent(
          'horoscope.error',
          {
            endpoint: '/api/horoscope/today',
            error: engineError?.message || 'Unknown error',
          },
          uid
        )
      } catch (logErr) {
        console.error('Failed to log horoscope error:', logErr)
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      horoscope: horoscopeText,
    })
  } catch (error: any) {
    console.error('Get horoscope error (outer):', error)
    return NextResponse.json(
      {
        success: false,
        horoscope:
          'Horoscope engine is warming up. Try again later — dev mode fallback.',
      },
      { status: 200 }
    )
  }
}
