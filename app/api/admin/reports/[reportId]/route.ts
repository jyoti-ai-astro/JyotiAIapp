import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminStorage } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * Get Report Details API
 * Milestone 10 - Step 4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { reportId } = params
      const { searchParams } = new URL(req.url)
      const userId = searchParams.get('userId')

      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      const reportRef = adminDb.collection('reports').doc(userId).collection('items').doc(reportId)
      const reportSnap = await reportRef.get()

      if (!reportSnap.exists) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      const reportData = reportSnap.data()

      return NextResponse.json({
        success: true,
        report: {
          id: reportId,
          userId,
          ...reportData,
        },
      })
    } catch (error: any) {
      console.error('Get report error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to get report' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * Download Report PDF API
 * Milestone 10 - Step 4
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb || !adminStorage) {
      return NextResponse.json({ error: 'Firestore/Storage not initialized' }, { status: 500 })
    }

    try {
      const { reportId } = params
      const { userId } = await req.json()

      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }

      // Get report
      const reportRef = adminDb.collection('reports').doc(userId).collection('items').doc(reportId)
      const reportSnap = await reportRef.get()

      if (!reportSnap.exists) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      const reportData = reportSnap.data()
      const pdfUrl = reportData?.pdfUrl

      if (!pdfUrl) {
        return NextResponse.json({ error: 'PDF not available' }, { status: 404 })
      }

      // Generate signed URL for download
      const fileRef = adminStorage.bucket().file(pdfUrl.replace('gs://', ''))
      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 3600000, // 1 hour
      })

      return NextResponse.json({
        success: true,
        downloadUrl: signedUrl,
      })
    } catch (error: any) {
      console.error('Download report error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to download report' },
        { status: 500 }
      )
    }
  })(request)
}

