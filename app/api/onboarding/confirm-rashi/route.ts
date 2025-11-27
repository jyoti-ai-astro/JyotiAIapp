import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * Confirm user's preferred Rashi
 * Part B - Section 3: Onboarding Flow
 * Allows user to select Moon, Sun, or Ascendant Rashi
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

    const { rashiPreferred } = await request.json()

    if (!rashiPreferred || !['moon', 'sun', 'ascendant'].includes(rashiPreferred)) {
      return NextResponse.json(
        { error: 'Invalid rashi preference. Must be moon, sun, or ascendant' },
        { status: 400 }
      )
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    let selectedRashi: string

    // Get the appropriate Rashi based on preference
    switch (rashiPreferred) {
      case 'moon':
        selectedRashi = userData?.rashiMoon || userData?.rashi || ''
        break
      case 'sun':
        selectedRashi = userData?.rashiSun || ''
        break
      case 'ascendant':
        selectedRashi = userData?.ascendant || ''
        break
      default:
        selectedRashi = userData?.rashi || ''
    }

    // Update user profile
    await userRef.update({
      rashiPreferred,
      rashi: selectedRashi,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      rashi: selectedRashi,
      rashiPreferred,
    })
  } catch (error: any) {
    console.error('Rashi confirmation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm Rashi' },
      { status: 500 }
    )
  }
}

