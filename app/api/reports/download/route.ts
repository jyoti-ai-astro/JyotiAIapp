import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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
    if (reportData?.status !== 'ready' || !reportData?.storagePath) {
      return NextResponse.json({ error: 'Report is not ready' }, { status: 409 })
    }

    const file = getStorage().bucket().file(reportData.storagePath)
    const [exists] = await file.exists()

    if (!exists) {
      return NextResponse.json({ error: 'Report PDF not found' }, { status: 404 })
    }

    const [buffer] = await file.download()
    const fileName = reportData.fileName || `${reportId}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error: any) {
    console.error('Report download error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to download report' },
      { status: 500 }
    )
  }
}
