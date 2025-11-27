import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

/**
 * Dashboard Summary API
 * Part B - Section 4: Milestone 3 - Step 1
 * 
 * Returns all data needed for dashboard display
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

    // Get user profile
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()

    // Check if kundali exists
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()
    const hasKundali = kundaliSnap.exists

    // Get Dasha if kundali exists
    let currentMahadasha = null
    let currentAntardasha = null
    let dashaSummary = null

    if (hasKundali) {
      const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
      if (dashaSnap.exists) {
        const dashaData = dashaSnap.data()
        currentMahadasha = {
          planet: dashaData?.currentMahadasha?.planet || null,
          startDate: dashaData?.currentMahadasha?.startDate?.toDate?.()?.toISOString() || null,
          endDate: dashaData?.currentMahadasha?.endDate?.toDate?.()?.toISOString() || null,
        }
        currentAntardasha = {
          planet: dashaData?.currentAntardasha?.planet || null,
          startDate: dashaData?.currentAntardasha?.startDate?.toDate?.()?.toISOString() || null,
          endDate: dashaData?.currentAntardasha?.endDate?.toDate?.()?.toISOString() || null,
        }
        dashaSummary = {
          mahadasha: currentMahadasha,
          antardasha: currentAntardasha,
        }
      }
    }

    // Get Lagna if kundali exists
    let lagna = null
    if (hasKundali) {
      const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
      if (D1Snap.exists) {
        lagna = D1Snap.data()?.lagna || null
      }
    }

    // Placeholder for today's prediction (will be implemented in later milestone)
    const todayPrediction = {
      summary: 'Your daily prediction will appear here once the prediction engine is activated.',
      career: 'Career insights coming soon...',
      love: 'Relationship guidance coming soon...',
      health: 'Health recommendations coming soon...',
      remedy: 'Daily remedy suggestions coming soon...',
    }

    // Placeholder for next 5 transits (will be implemented in later milestone)
    const nextTransits = [
      {
        planet: 'Jupiter',
        event: 'Transit into new sign',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Positive',
      },
      {
        planet: 'Saturn',
        event: 'Transit aspect',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Neutral',
      },
      {
        planet: 'Mars',
        event: 'Transit into new house',
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Moderate',
      },
      {
        planet: 'Mercury',
        event: 'Retrograde period',
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Caution',
      },
      {
        planet: 'Venus',
        event: 'Transit conjunction',
        date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        impact: 'Positive',
      },
    ]

    // Check profile completeness
    const profileComplete =
      userData?.dob &&
      userData?.tob &&
      userData?.pob &&
      userData?.rashi &&
      userData?.nakshatra

    return NextResponse.json({
      success: true,
      user: {
        name: userData?.name || 'User',
        photo: userData?.photo || null,
        rashi: userData?.rashi || null,
        nakshatra: userData?.nakshatra || null,
        lagna: lagna?.sign || null,
        lagnaDetails: lagna,
      },
      kundali: {
        available: hasKundali,
        generatedAt: kundaliSnap.exists
          ? kundaliSnap.data()?.meta?.generatedAt?.toDate?.()?.toISOString() || null
          : null,
      },
      dasha: dashaSummary,
      todayPrediction,
      nextTransits,
      profileComplete,
    })
  } catch (error: any) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get dashboard summary' },
      { status: 500 }
    )
  }
}

