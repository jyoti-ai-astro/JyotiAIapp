import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateRitual } from '@/lib/engines/ritual/ai-ritual-engine'
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service'
import type { FeatureKey } from '@/lib/payments/feature-access'

/**
 * Generate AI Ritual
 * Milestone 8 - Step 9
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Phase S: Ticket enforcement
    const featureKey: FeatureKey = 'rituals'
    try {
      await ensureFeatureAccess(uid, featureKey)
    } catch (err: any) {
      if (err.code === 'NO_TICKETS') {
        return NextResponse.json(
          { error: 'NO_TICKETS', message: 'You have no credits left for this feature.' },
          { status: 403 }
        )
      }
      throw err
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const { purpose } = await request.json()

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 })
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

    // Generate ritual
    const ritual = await generateRitual(
      purpose,
      {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
        dasha: {
          currentMahadasha: dashaData.currentMahadasha,
          currentAntardasha: dashaData.currentAntardasha,
        },
      },
      numerology
    )

    return NextResponse.json({
      success: true,
      ritual,
    })
  } catch (error: any) {
    console.error('Ritual generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate ritual' },
      { status: 500 }
    )
  }
}

