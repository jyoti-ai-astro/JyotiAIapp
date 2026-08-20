import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

function serializeFirestoreValue(value: any): any {
  if (!value) return value
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(serializeFirestoreValue)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeFirestoreValue(nestedValue)])
    )
  }
  return value
}

/**
 * Get Kundali
 * Part B - Section 4: Step 8
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

    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()

    if (!kundaliSnap.exists) {
      return NextResponse.json({ error: 'Kundali not found' }, { status: 404 })
    }

    // Get meta
    const meta = serializeFirestoreValue(kundaliSnap.data())

    // Get D1 chart
    const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
    const D1 = D1Snap.exists ? serializeFirestoreValue(D1Snap.data()) : null

    // Get Dasha
    const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
    const dasha = dashaSnap.exists ? serializeFirestoreValue(dashaSnap.data()) : null

    return NextResponse.json({
      success: true,
      kundali: {
        meta,
        D1,
        dasha,
      },
    })
  } catch (error: any) {
    console.error('Get kundali error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get kundali' },
      { status: 500 }
    )
  }
}
