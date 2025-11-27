import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { calculatePlanetPositions, longitudeToRashi, longitudeToNakshatra } from '@/lib/engines/kundali/swisseph-wrapper'

/**
 * Calculate Rashi and Nakshatra from birth details
 * Part B - Section 3: Onboarding Flow
 * Part B - Section 4: Rashi + Nakshatra Pre-Calculation
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

    // Get user birth details
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    if (!userData?.dob || !userData?.tob || !userData?.lat || !userData?.lng) {
      return NextResponse.json(
        { error: 'Birth details not found. Please complete birth details first.' },
        { status: 400 }
      )
    }

    // Parse birth details
    const dob = new Date(userData.dob)
    const [hours, minutes] = userData.tob.split(':').map(Number)

    const birthDetails = {
      year: dob.getFullYear(),
      month: dob.getMonth() + 1,
      day: dob.getDate(),
      hour: hours,
      minute: minutes,
      second: 0,
      lat: userData.lat,
      lng: userData.lng,
      timezone: userData.timezone || 'Asia/Kolkata',
    }

    // Calculate planet positions
    const positions = await calculatePlanetPositions(birthDetails)

    // Calculate Rashi for Sun, Moon, and Ascendant
    const sunRashi = longitudeToRashi(positions.sun.longitude)
    const moonRashi = longitudeToRashi(positions.moon.longitude)
    const ascendantRashi = longitudeToRashi(positions.lagna)

    // Calculate Nakshatra for Moon (most important for Indian astrology)
    const moonNakshatra = longitudeToNakshatra(positions.moon.longitude)

    // Update user profile with calculated values
    await userRef.update({
      rashiMoon: moonRashi,
      rashiSun: sunRashi,
      ascendant: ascendantRashi,
      nakshatra: moonNakshatra,
      // Default to Moon Rashi (most common in India)
      rashi: moonRashi,
      rashiPreferred: 'moon',
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      rashi: {
        moon: moonRashi,
        sun: sunRashi,
        ascendant: ascendantRashi,
      },
      nakshatra: moonNakshatra,
    })
  } catch (error: any) {
    console.error('Rashi calculation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate Rashi' },
      { status: 500 }
    )
  }
}

