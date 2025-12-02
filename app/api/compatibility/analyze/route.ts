import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service'
import type { FeatureKey } from '@/lib/payments/feature-access'
import { analyzeCompatibility } from '@/lib/engines/relationship/compatibility-engine'

/**
 * Analyze Relationship Compatibility
 * Milestone 8 - Step 6
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
    const featureKey: FeatureKey = 'compatibility'
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

    const { person2Kundali, person2Numerology } = await request.json()

    if (!person2Kundali) {
      return NextResponse.json(
        { error: 'Person 2 kundali data is required' },
        { status: 400 }
      )
    }

    // Get Person 1 (current user) data
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (!kundaliSnap.exists) {
      return NextResponse.json({ error: 'Your kundali not found' }, { status: 404 })
    }

    const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
    if (!D1Snap.exists) {
      return NextResponse.json({ error: 'Your kundali data incomplete' }, { status: 400 })
    }

    const D1Data = D1Snap.data()

    // Get Person 1 Numerology
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const numerology1 = userSnap.exists ? userSnap.data()?.numerology : null

    // Analyze compatibility
    const compatibility = analyzeCompatibility(
      {
        kundali: {
          grahas: D1Data?.grahas || {},
          bhavas: D1Data?.bhavas || {},
          lagna: D1Data?.lagna || null,
        },
        numerology: numerology1,
      },
      {
        kundali: person2Kundali,
        numerology: person2Numerology,
      }
    )

    // Phase S: Consume ticket after successful analysis
    try {
      await consumeFeatureTicket(uid, featureKey)
    } catch (err: any) {
      console.error('Ticket consumption error:', err)
    }

    return NextResponse.json({
      success: true,
      compatibility,
    })
  } catch (error: any) {
    console.error('Compatibility analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze compatibility' },
      { status: 500 }
    )
  }
}

