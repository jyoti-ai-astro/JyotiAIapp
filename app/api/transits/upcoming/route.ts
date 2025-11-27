import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getUpcomingTransits, matchTransitsWithKundali } from '@/lib/engines/transit/transit-engine'

/**
 * Get Upcoming Transits
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 3
 */
export async function GET(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    // Get upcoming transits
    const transits = await getUpcomingTransits(new Date(), 7)

    // Get user's Kundali for personalization
    let userTransits = transits.map((transit) => ({
      transit,
      personalImpact: 'General transit impact',
      affectedAreas: transit.affectedHouses.map((h) => `House ${h}`),
    }))

    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (kundaliSnap.exists) {
      const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
      if (D1Snap.exists) {
        const D1Data = D1Snap.data()
        userTransits = matchTransitsWithKundali(transits, {
          grahas: D1Data?.grahas || {},
          bhavas: D1Data?.bhavas || {},
        })
      }
    }

    return NextResponse.json({
      success: true,
      transits: userTransits.map((ut) => ({
        ...ut,
        transit: {
          ...ut.transit,
          date: ut.transit.date.toISOString(),
        },
      })),
    })
  } catch (error: any) {
    console.error('Get transits error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get transits' },
      { status: 500 }
    )
  }
}

