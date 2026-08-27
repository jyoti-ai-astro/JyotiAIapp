'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorState, LoadingState, RetryButton } from '@/components/ui/feedback-state'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import Link from 'next/link'

interface Report {
  reportId: string
  type: string
  title: string
  status: 'queued' | 'generating' | 'ready' | 'failed'
  pdfUrl?: string | null
  failureReason?: string | null
  generatedAt?: string | null
  createdAt: string
  outdated?: boolean
  staleStatus?: 'current' | 'outdated_after_birth_change'
}

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUserStore()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (params.id) {
      loadReport(params.id as string)
    }
  }, [user, router, params])

  const loadReport = async (reportId: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports/get?reportId=${reportId}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setReport(result.report)
        return
      }

      const data = await response.json().catch(() => ({}))
      setReport(null)
      setError(data.error || 'Report not found')
    } catch (error) {
      console.error('Load report error:', error)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <DashboardPageShell title="Report" subtitle="Loading your persisted report">
        <Card>
          <CardContent>
            <LoadingState title="Loading report" description="Fetching the saved report record." />
          </CardContent>
        </Card>
      </DashboardPageShell>
    )
  }

  if (!report) {
    return (
      <DashboardPageShell title="Report unavailable" subtitle="We could not open this report">
        <Card>
          <CardContent>
            <ErrorState
              title="Report not found"
              description={error || 'This report is missing or no longer available.'}
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <RetryButton onClick={() => params.id && loadReport(params.id as string)} />
                  <Link href="/reports">
                    <Button variant="outline">Back to Reports</Button>
                  </Link>
                </div>
              }
            />
          </CardContent>
        </Card>
      </DashboardPageShell>
    )
  }

  return (
    <DashboardPageShell
      title={report.title}
      subtitle={`${report.status === 'ready' ? 'Generated' : 'Requested'} on ${new Date(report.generatedAt || report.createdAt).toLocaleDateString()}`}
      rightActions={
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline">Back to Reports</Button>
          </Link>
          {report.status === 'ready' && report.pdfUrl && (
            <a href={report.pdfUrl} download>
              <Button>Download PDF</Button>
            </a>
          )}
        </div>
      }
    >
      {report.outdated && (
        <Card className="border-amber-400/50">
          <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center">
            <Badge className="w-fit bg-amber-500/15 text-amber-700 border border-amber-400/50">
              Outdated
            </Badge>
            <p className="text-sm text-muted-foreground">
              Birth details changed after this report was generated. Use this PDF for records only; regenerate for current astrology.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {report.status === 'ready' && report.pdfUrl ? (
            <div className="aspect-[8.5/11] w-full">
              <iframe
                src={report.pdfUrl}
                className="w-full h-full border rounded-lg"
                title={report.title}
              />
            </div>
          ) : report.status === 'failed' ? (
            <ErrorState
              title="Report generation failed"
              description={report.failureReason || 'Report generation failed.'}
              action={
                <Link href="/reports">
                  <Button variant="outline">Back to Reports</Button>
                </Link>
              }
            />
          ) : (
            <LoadingState
              title={`Report is ${report.status}`}
              description="Refresh this page shortly, or return to the reports library."
            />
          )}
        </CardContent>
      </Card>
    </DashboardPageShell>
  )
}
