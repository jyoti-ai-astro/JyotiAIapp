import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { analyzePalm } from '@/lib/engines/palmistry/palm-analysis'

/**
 * Analyze Palm Images
 * Part B - Section 3: Palmistry Engine
 * Part B - Section 4: Milestone 4 - Step 2
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    const { leftPalmUrl, rightPalmUrl } = await request.json()

    if (!leftPalmUrl || !rightPalmUrl) {
      return NextResponse.json(
        { error: 'Both left and right palm images are required' },
        { status: 400 }
      )
    }

    // Analyze palm
    const analysis = await analyzePalm({
      leftPalmUrl,
      rightPalmUrl,
    })

    // Save to Firestore
    if (adminDb) {
      const scanRef = adminDb.collection('scans').doc(uid).collection('palmistry').doc('latest')
      await scanRef.set({
        leftPalmUrl,
        rightPalmUrl,
        analysis,
        createdAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: any) {
    console.error('Palmistry analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze palm' },
      { status: 500 }
    )
  }
}
