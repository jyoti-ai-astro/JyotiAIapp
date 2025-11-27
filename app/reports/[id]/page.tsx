'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Report {
  reportId: string
  type: string
  title: string
  pdfUrl: string
  generatedAt: string
  createdAt: string
}

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useUserStore()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

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
      const response = await fetch(`/api/reports/get?reportId=${reportId}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setReport(result.report)
      } else if (response.status === 404) {
        alert('Report not found')
        router.push('/reports')
      }
    } catch (error) {
      console.error('Load report error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Report not found</p>
            <Link href="/reports">
              <Button className="mt-4">Back to Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold">{report.title}</h1>
          <p className="text-muted-foreground">
            Generated on {new Date(report.generatedAt || report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline">Back to Reports</Button>
          </Link>
          <a href={report.pdfUrl} download>
            <Button>Download PDF</Button>
          </a>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="aspect-[8.5/11] w-full">
            <iframe
              src={report.pdfUrl}
              className="w-full h-full border rounded-lg"
              title={report.title}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

