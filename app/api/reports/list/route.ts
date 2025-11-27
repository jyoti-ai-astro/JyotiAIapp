import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * List Reports
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 5
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const reportsRef = adminDb.collection('reports').doc(uid).collection('reports')
    const reportsSnap = await reportsRef.orderBy('createdAt', 'desc').limit(limit).get()

    const reports = reportsSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        reportId: doc.id,
        ...data,
        generatedAt: data?.metadata?.generatedAt?.toDate?.()?.toISOString() || null,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
      }
    })

    return NextResponse.json({
      success: true,
      reports,
    })
  } catch (error: any) {
    console.error('List reports error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list reports' },
      { status: 500 }
    )
  }
}

