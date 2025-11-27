import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { analyzeAura } from '@/lib/engines/aura/aura-analyzer'

/**
 * Analyze Aura
 * Part B - Section 3: Aura Reading Engine
 * Part B - Section 4: Milestone 4 - Step 3
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

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Analyze aura
    const analysis = await analyzeAura({ imageUrl })

    // Save to Firestore
    if (adminDb) {
      const scanRef = adminDb.collection('scans').doc(uid).collection('aura').doc('latest')
      await scanRef.set({
        imageUrl,
        analysis,
        createdAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: any) {
    console.error('Aura analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze aura' },
      { status: 500 }
    )
  }
}
