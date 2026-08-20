import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import {
  GeocodingError,
  isValidCoordinate,
  isValidTimezone,
  resolveTimezoneForCoordinates,
} from '@/lib/services/geocoding'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      )
    }

    // Verify session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Get update data from request
    const updates = await request.json()
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 })
    }

    // Allowed fields that users can update
    const allowedFields = [
      'name',
      'dob',
      'tob',
      'pob',
      'lat',
      'lng',
      'timezone',
      'rashiPreferred',
      'onboarded',
      'settings',
    ]

    // Filter updates to only allowed fields
    const filteredUpdates: Record<string, any> = {
      updatedAt: new Date(),
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'settings') {
          if (!updates.settings || typeof updates.settings !== 'object' || Array.isArray(updates.settings)) {
            return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
          }

          filteredUpdates.settings = {
            notifications: Boolean(updates.settings.notifications),
            emailUpdates: Boolean(updates.settings.emailUpdates),
            soundEnabled: Boolean(updates.settings.soundEnabled),
          }
        } else {
          filteredUpdates[field] = updates[field]
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 1) {
      return NextResponse.json({ error: 'No supported fields to update' }, { status: 400 })
    }

    // Update user in Firestore
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firestore not initialized' },
        { status: 500 }
      )
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data() || {}
    const birthFields: Array<'dob' | 'tob' | 'pob' | 'lat' | 'lng' | 'timezone'> = [
      'dob',
      'tob',
      'pob',
      'lat',
      'lng',
      'timezone',
    ]
    const birthDataChanged = birthFields.some((field) => {
      if (filteredUpdates[field] === undefined) return false
      return filteredUpdates[field] !== userData[field]
    })

    if (birthDataChanged) {
      const pobChanged = filteredUpdates.pob !== undefined && filteredUpdates.pob !== userData.pob
      const coordinatesChanged =
        filteredUpdates.lat !== undefined ||
        filteredUpdates.lng !== undefined ||
        filteredUpdates.timezone !== undefined

      if (pobChanged || coordinatesChanged) {
        if (pobChanged && (filteredUpdates.lat === undefined || filteredUpdates.lng === undefined)) {
          return NextResponse.json(
            {
              code: 'LOCATION_NOT_VERIFIED',
              error: 'Choose a verified birth location from suggestions before saving.',
            },
            { status: 400 }
          )
        }

        const nextLat = filteredUpdates.lat ?? userData.lat
        const nextLng = filteredUpdates.lng ?? userData.lng

        if (!isValidCoordinate(nextLat, nextLng)) {
          return NextResponse.json(
            {
              code: 'LOCATION_NOT_VERIFIED',
              error: 'Choose a verified birth location from suggestions before saving.',
            },
            { status: 400 }
          )
        }

        try {
          filteredUpdates.timezone = await resolveTimezoneForCoordinates(nextLat, nextLng)
          filteredUpdates.locationVerified = true
          filteredUpdates.locationVerifiedAt = new Date()
          filteredUpdates.geocodingProvider = 'client_coordinates'
        } catch (error: any) {
          const code = error instanceof GeocodingError ? error.code : 'TIMEZONE_NOT_VERIFIED'
          return NextResponse.json(
            {
              code,
              error:
                error?.message ||
                'Could not verify timezone for this birth location. Please select a different suggestion.',
            },
            { status: code === 'INVALID_COORDINATES' ? 400 : 422 }
          )
        }
      } else if (filteredUpdates.timezone !== undefined && !isValidTimezone(filteredUpdates.timezone)) {
        return NextResponse.json(
          { code: 'TIMEZONE_NOT_VERIFIED', error: 'Invalid birth timezone.' },
          { status: 400 }
        )
      }

      filteredUpdates.derivedAstrologyStatus = 'stale'
      filteredUpdates.birthDetailsUpdatedAt = new Date()
    }

    await userRef.update(filteredUpdates)

    if (birthDataChanged) {
      const stalePayload = {
        stale: true,
        staleReason: 'birth_details_changed',
        staleAt: new Date(),
      }

      await Promise.all([
        adminDb.collection('kundali').doc(uid).set(
          {
            meta: stalePayload,
          },
          { merge: true }
        ),
        userRef.collection('astroContext').doc('current').set(stalePayload, { merge: true }),
        userRef.collection('timeline').doc('current').set(
          {
            status: 'stale',
            failureReason: 'Birth details changed. Regenerate Kundali before creating a new timeline.',
            updatedAt: new Date(),
          },
          { merge: true }
        ),
      ])
    }

    return NextResponse.json({
      success: true,
      message: 'User updated',
      birthDataChanged,
      derivedAstrologyStatus: birthDataChanged ? 'stale' : undefined,
      persistedFields: Object.keys(filteredUpdates).filter((field) => field !== 'updatedAt'),
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}
