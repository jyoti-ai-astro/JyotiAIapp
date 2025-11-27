import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateSideHustles } from '@/lib/engines/career/side-hustle-engine'

export const dynamic = 'force-dynamic'

/**
 * Get Side Hustle Recommendations
 * Milestone 8 - Step 5
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    // Get Kundali
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (!kundaliSnap.exists) {
      return NextResponse.json({ error: 'Kundali not found' }, { status: 404 })
    }

    const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
    if (!D1Snap.exists) {
      return NextResponse.json({ error: 'Kundali data incomplete' }, { status: 400 })
    }

    const D1Data = D1Snap.data()

    // Get Numerology
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const numerology = userSnap.exists ? userSnap.data()?.numerology : null

    // Generate side hustles
    const sideHustles = generateSideHustles(
      {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
      },
      numerology
    )

    return NextResponse.json({
      success: true,
      sideHustles,
    })
  } catch (error: any) {
    console.error('Side hustle error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate side hustles' },
      { status: 500 }
    )
  }
}

