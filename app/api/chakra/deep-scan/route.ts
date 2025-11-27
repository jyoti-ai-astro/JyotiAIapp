import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { performDeepScan } from '@/lib/engines/chakra/chakra-deep-scan'

/**
 * Perform Deep Chakra + Aura Scan
 * Milestone 8 - Step 8
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

    // Get Aura data
    const auraSnap = await adminDb
      .collection('scans')
      .doc(uid)
      .collection('aura')
      .doc('latest')
      .get()

    const auraData = auraSnap.exists ? auraSnap.data()?.analysis : null

    // Get Kundali (for additional context)
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()
    const D1Snap = kundaliSnap.exists
      ? await kundaliRef.collection('D1').doc('chart').get()
      : null

    const kundali = D1Snap?.exists
      ? {
          grahas: D1Snap.data()?.grahas || {},
        }
      : undefined

    // Perform deep scan
    const scan = performDeepScan(auraData, kundali)

    return NextResponse.json({
      success: true,
      scan,
    })
  } catch (error: any) {
    console.error('Deep scan error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform deep scan' },
      { status: 500 }
    )
  }
}

