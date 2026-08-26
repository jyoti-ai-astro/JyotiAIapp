import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function toDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIso(value: any): string | null {
  return toDate(value)?.toISOString() || null
}

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req) => {
    if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

    try {
      const { searchParams } = new URL(req.url)
      const type = (searchParams.get('type') || '').trim().toLowerCase()
      const status = (searchParams.get('status') || '').trim().toLowerCase()
      const search = (searchParams.get('search') || '').trim().toLowerCase()
      const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
      const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50

      const startDateRaw = searchParams.get('startDate')
      const endDateRaw = searchParams.get('endDate')
      const startDate = startDateRaw ? new Date(startDateRaw) : null
      const endDate = endDateRaw ? new Date(endDateRaw) : null

      if (startDate && Number.isNaN(startDate.getTime())) {
        return NextResponse.json({ error: 'Invalid startDate' }, { status: 400 })
      }
      if (endDate && Number.isNaN(endDate.getTime())) {
        return NextResponse.json({ error: 'Invalid endDate' }, { status: 400 })
      }

      // Canonical report generation writes to reports/{uid}/reports/{reportId}.
      // Restrict collection-group results to that exact ancestry so unrelated
      // collections named "reports" cannot be exposed through Mission Control.
      const snapshot = await adminDb.collectionGroup('reports').limit(500).get()

      const reports = snapshot.docs
        .filter((doc: any) => doc.ref.parent.parent?.parent?.id === 'reports')
        .map((doc: any) => {
          const data = doc.data()
          const createdAt = toDate(data.createdAt ?? data.metadata?.generatedAt)
          const userId = doc.ref.parent.parent?.id || data.userId || null

          return {
            id: data.reportId || doc.id,
            userId,
            type: String(data.type || data.reportType || 'unknown'),
            title: data.title || data.name || data.reportName || null,
            status: String(data.status || 'unknown'),
            createdAt: createdAt?.toISOString() || null,
            updatedAt: toIso(data.updatedAt),
            completedAt: toIso(data.completedAt ?? data.metadata?.generatedAt),
            error: data.error || data.errorMessage || null,
            storageUrl: data.storageUrl || data.downloadUrl || data.pdfUrl || null,
          }
        })
        .filter((report: any) => {
          if (type && report.type.toLowerCase() !== type) return false
          if (status && report.status.toLowerCase() !== status) return false

          const createdAt = report.createdAt ? new Date(report.createdAt) : null
          if (startDate && (!createdAt || createdAt < startDate)) return false
          if (endDate && (!createdAt || createdAt > endDate)) return false

          if (search) {
            const haystack = [report.id, report.userId, report.type, report.title, report.status]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
            if (!haystack.includes(search)) return false
          }

          return true
        })
        .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
        .slice(0, limit)

      return NextResponse.json({ success: true, reports, count: reports.length })
    } catch (error) {
      console.error('Mission Control reports error:', error)
      return NextResponse.json({ error: 'Failed to list reports' }, { status: 500 })
    }
  }, 'reports.read')(request)
}
