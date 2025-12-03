import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { geocodePlace, getDefaultGeocode } from '@/lib/services/geocoding'

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

    // Geocode place of birth (use provided coordinates if available, otherwise geocode)
    let geocodeResult
    if (lat && lng && typeof lat === 'number' && typeof lng === 'number') {
      // Use provided coordinates from location autocomplete
      try {
        // Get timezone for the coordinates
        const { envVars } = await import('@/lib/env/env.mjs')
        const timezoneDbKey = envVars.geocoding.timezoneDbKey
        
        let timezone = 'UTC'
        if (timezoneDbKey) {
          try {
            const timezoneResponse = await fetch(
              `https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneDbKey}&format=json&by=position&lat=${lat}&lng=${lng}`
            )
            const timezoneData = await timezoneResponse.json()
            if (timezoneData.status === 'OK') {
              timezone = timezoneData.zoneName || 'UTC'
            }
          } catch (err) {
            console.warn('Timezone lookup failed:', err)
          }
        }
        
        geocodeResult = {
          lat,
          lng,
          formattedAddress: pob,
          timezone,
        }
      } catch (error) {
        console.warn('Using provided coordinates failed, falling back to geocoding:', error)
        // Fall through to geocoding
      }
    }
    
    // If coordinates weren't provided or failed, geocode the place name
    if (!geocodeResult) {
      try {
        geocodeResult = await geocodePlace(pob)
      } catch (error) {
        console.warn('Geocoding failed, using default:', error)
        geocodeResult = getDefaultGeocode(pob)
      }
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

