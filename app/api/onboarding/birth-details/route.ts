import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import {
  GeocodingError,
  geocodePlace,
  isValidCoordinate,
  resolveTimezoneForCoordinates,
} from '@/lib/services/geocoding'

export const dynamic = 'force-dynamic'

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

    const { dob, tob, pob, lat, lng } = await request.json()

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

    let geocodeResult
    try {
      if (lat !== undefined || lng !== undefined) {
        if (!isValidCoordinate(lat, lng)) {
          throw new GeocodingError('INVALID_COORDINATES', 'Selected birth location has invalid coordinates.')
        }

        const timezone = await resolveTimezoneForCoordinates(lat, lng)
        geocodeResult = {
          lat,
          lng,
          formattedAddress: pob,
          timezone,
          provider: 'client_coordinates' as const,
        }
      } else {
        geocodeResult = await geocodePlace(pob)
      }
    } catch (error: any) {
      const code = error instanceof GeocodingError ? error.code : 'LOCATION_NOT_VERIFIED'
      return NextResponse.json(
        {
          success: false,
          code,
          error:
            error?.message ||
            'We could not verify your birth location. Please choose a location from suggestions and retry.',
        },
        { status: code === 'INVALID_COORDINATES' ? 400 : 422 }
      )
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
      locationVerified: true,
      locationVerifiedAt: new Date(),
      geocodingProvider: geocodeResult.provider || 'unknown',
      geocodedAddress: geocodeResult.formattedAddress,
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
