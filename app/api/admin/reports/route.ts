export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { Timestamp } from 'firebase-admin/firestore'

function toIso(value: any): string | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const type = (searchParams.get('type') || '').trim()
        const status = (searchParams.get('status') || '').trim()
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const search = (searchParams.get('search') || '').trim().toLowerCase()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50

        let query: any = adminDb.collectionGroup('items')
        if (type) query = query.where('type', '==', type)
        if (status) query = query.where('status', '==', status)
        if (startDate) {
          const parsed = new Date(startDate)
          if (Number.isNaN(parsed.getTime())) return NextResponse.json({ error: 'Invalid startDate' }, { status: 400 })
          query = query.where('createdAt', '>=', Timestamp.fromDate(parsed))
        }
        if (endDate) {
          const parsed = new Date(endDate)
          if (Number.isNaN(parsed.getTime())) return NextResponse.json({ error: 'Invalid endDate' }, { status: 400 })
          query = query.where('createdAt', '<=', Timestamp.fromDate(parsed))
        }

        const snapshot = await query.orderBy('createdAt', 'desc').limit(search ? 100 : limit).get()
        const reports = snapshot.docs
          .map((doc: any) => {
            const data = doc.data()
            return {
              id: doc.id,
              userId: doc.ref.parent.parent?.id || data.userId || null,
              type: data.type || data.reportType || 'unknown',
              title: data.title || data.name || data.reportName || null,
              status: data.status || 'unknown',
              createdAt: toIso(data.createdAt),
              updatedAt: toIso(data.updatedAt),
              completedAt: toIso(data.completedAt),
              error: data.error || data.errorMessage || null,
              storageUrl: data.storageUrl || data.downloadUrl || data.pdfUrl || null,
            }
          })
          .filter((report: any) => {
            if (!search) return true
            return [report.id, report.userId, report.type, report.title, report.status]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(search))
          })
          .slice(0, limit)

        return NextResponse.json({ success: true, reports, count: reports.length })
      } catch (error: any) {
        console.error('List reports error:', error)
        return NextResponse.json({ error: error.message || 'Failed to list reports' }, { status: 500 })
      }
    },
    'reports.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json(
      {
        error: 'Generic report regeneration is retired. Use a dedicated audited report job action.',
        code: 'REPORT_REGENERATION_RETIRED',
      },
      { status: 410 }
    ),
    'reports.write'
  )(request)
}
