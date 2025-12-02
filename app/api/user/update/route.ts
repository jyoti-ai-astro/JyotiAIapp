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
    ]

    // Filter updates to only allowed fields
    const filteredUpdates: Record<string, any> = {
      updatedAt: new Date(),
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }

    // Update user in Firestore
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firestore not initialized' },
        { status: 500 }
      )
    }

    const userRef = adminDb.collection('users').doc(uid)
    await userRef.update(filteredUpdates)

    return NextResponse.json({ success: true, message: 'User updated' })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

