import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { analyzeLocation } from '@/lib/engines/location/astro-location'

/**
 * Analyze Location
 * Milestone 8 - Step 7
 */
export async function POST(request: NextRequest) {
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

    const { location } = await request.json()

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 })
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

    // Analyze location
    const locationAnalysis = analyzeLocation(
      location,
      {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
        lagna: D1Data?.lagna || null,
      },
      numerology
    )

    return NextResponse.json({
      success: true,
      analysis: locationAnalysis,
    })
  } catch (error: any) {
    console.error('Location analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze location' },
      { status: 500 }
    )
  }
}

