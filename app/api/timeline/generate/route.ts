import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateTimeline } from '@/lib/engines/timeline/timeline-engine'

/**
 * Generate Timeline
 * Milestone 8 - Step 1
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

    // Get Kundali
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (!kundaliSnap.exists) {
      return NextResponse.json({ error: 'Kundali not found' }, { status: 404 })
    }

    const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
    const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()

    if (!D1Snap.exists || !dashaSnap.exists) {
      return NextResponse.json({ error: 'Kundali data incomplete' }, { status: 400 })
    }

    const D1Data = D1Snap.data()
    const dashaData = dashaSnap.data()

    // Get Numerology
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const numerology = userSnap.exists ? userSnap.data()?.numerology : null

    // Generate timeline
    const timeline = generateTimeline(
      {
        currentMahadasha: dashaData.currentMahadasha,
        currentAntardasha: dashaData.currentAntardasha,
        currentPratyantardasha: dashaData.currentPratyantardasha,
      } as any,
      {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
      },
      numerology
    )

    return NextResponse.json({
      success: true,
      timeline: {
        ...timeline,
        startDate: timeline.startDate.toISOString(),
        endDate: timeline.endDate.toISOString(),
        events: timeline.events.map((e) => ({
          ...e,
          date: e.date.toISOString(),
        })),
      },
    })
  } catch (error: any) {
    console.error('Timeline generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate timeline' },
      { status: 500 }
    )
  }
}

