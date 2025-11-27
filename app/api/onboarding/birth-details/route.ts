import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { geocodePlace, getDefaultGeocode } from '@/lib/services/geocoding'

/**
 * Save birth details during onboarding
 * Part B - Section 3: Onboarding Flow
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

    const { dob, tob, pob } = await request.json()

    // Validation
    if (!dob || !tob || !pob) {
      return NextResponse.json(
        { error: 'Date of birth, time of birth, and place of birth are required' },
        { status: 400 }
      )
    }

    // Validate date
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    // Geocode place of birth
    let geocodeResult
    try {
      geocodeResult = await geocodePlace(pob)
    } catch (error) {
      console.warn('Geocoding failed, using default:', error)
      geocodeResult = getDefaultGeocode(pob)
    }

    // Update user profile
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userRef = adminDb.collection('users').doc(uid)
    await userRef.update({
      dob,
      tob,
      pob,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      timezone: geocodeResult.timezone,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      geocode: geocodeResult,
    })
  } catch (error: any) {
    console.error('Birth details error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save birth details' },
      { status: 500 }
    )
  }
}

