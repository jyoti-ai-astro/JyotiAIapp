import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service'
import type { FeatureKey } from '@/lib/payments/feature-access'
import { analyzeBusinessCompatibility } from '@/lib/engines/career/business-compatibility'

/**
 * Analyze Business Compatibility
 * Milestone 8 - Step 4
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
    const featureKey: FeatureKey = 'business'
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

    const { businessName, businessType } = await request.json()

    if (!businessName || !businessType) {
      return NextResponse.json(
        { error: 'Business name and type are required' },
        { status: 400 }
      )
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

    // Analyze business compatibility
    const compatibility = analyzeBusinessCompatibility(
      businessName,
      businessType,
      {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
      },
      numerology
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
    console.error('Business compatibility error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze business compatibility' },
      { status: 500 }
    )
  }
}

