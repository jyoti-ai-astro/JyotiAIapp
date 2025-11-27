import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { sendPredictionReport } from '@/lib/email/email-service'

/**
 * Email Report Manually API
 * Milestone 10 - Step 4
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { reportId } = params
        const { userId, email } = await req.json()

        if (!userId || !email) {
          return NextResponse.json(
            { error: 'userId and email are required' },
            { status: 400 }
          )
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

        // Send email
        const emailSent = await sendPredictionReport(email, pdfUrl, reportData?.type || 'Report')

        if (!emailSent) {
          return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Email report error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to email report' },
          { status: 500 }
        )
      }
    },
    'reports.write'
  )(request)
}

