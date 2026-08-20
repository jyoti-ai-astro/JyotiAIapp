import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

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
      'rashi',
      'rashiPreferred',
      'rashiMoon',
      'rashiSun',
      'ascendant',
      'nakshatra',
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
      filteredUpdates.derivedAstrologyStatus = 'stale'
      filteredUpdates.birthDetailsUpdatedAt = new Date()

      if (filteredUpdates.pob !== undefined && updates.lat === undefined && updates.lng === undefined) {
        filteredUpdates.lat = null
        filteredUpdates.lng = null
      }
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
