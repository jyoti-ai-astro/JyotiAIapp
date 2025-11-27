import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * Get Report
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
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    const reportRef = adminDb.collection('reports').doc(uid).collection('reports').doc(reportId)
    const reportSnap = await reportRef.get()

    if (!reportSnap.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const reportData = reportSnap.data()

    return NextResponse.json({
      success: true,
      report: {
        ...reportData,
        generatedAt: reportData?.metadata?.generatedAt?.toDate?.()?.toISOString() || null,
        createdAt: reportData?.createdAt?.toDate?.()?.toISOString() || null,
      },
    })
  } catch (error: any) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get report' },
      { status: 500 }
    )
  }
}

