export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * List Reports API
 * Milestone 10 - Step 4
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { searchParams } = new URL(req.url)
      const type = searchParams.get('type')
      const status = searchParams.get('status')
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
      const limit = parseInt(searchParams.get('limit') || '50')

      let query: any = adminDb.collectionGroup('items')

      // Apply filters
      if (type) {
        query = query.where('type', '==', type)
      }
      if (status) {
        query = query.where('status', '==', status)
      }
      if (startDate) {
        query = query.where('createdAt', '>=', adminDb.Timestamp.fromDate(new Date(startDate)))
      }
      if (endDate) {
        query = query.where('createdAt', '<=', adminDb.Timestamp.fromDate(new Date(endDate)))
      }

      const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get()

      const reports = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: doc.ref.parent.parent?.id,
          ...data,
        }
      })

      return NextResponse.json({
        success: true,
        reports,
        count: reports.length,
      })
    } catch (error: any) {
      console.error('List reports error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to list reports' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * Regenerate Report API
 * Milestone 10 - Step 4
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { userId, reportId, type } = await req.json()

        if (!userId || !reportId || !type) {
          return NextResponse.json(
            { error: 'userId, reportId, and type are required' },
            { status: 400 }
          )
        }

        // Trigger report regeneration
        // This would call the report generation service
        const regenerateResponse = await fetch(`${req.nextUrl.origin}/api/reports/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: req.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            type,
            userId,
            regenerate: true,
            originalReportId: reportId,
          }),
        })

        if (!regenerateResponse.ok) {
          throw new Error('Failed to regenerate report')
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Regenerate report error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to regenerate report' },
          { status: 500 }
        )
      }
    },
    'reports.write'
  )(request)
}

