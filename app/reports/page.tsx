'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportType, setReportType] = useState<'basic' | 'premium'>('basic')
  const [includePalmistry, setIncludePalmistry] = useState(false)
  const [includeAura, setIncludeAura] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadReports()
  }, [user, router])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/list', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setReports(result.reports || [])
      }
    } catch (error) {
      console.error('Load reports error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: reportType,
          includePalmistry,
          includeAura,
        }),
      })

      if (response.status === 402) {
        // Payment required
        const error = await response.json()
        if (error.requiresPayment) {
          alert('Premium subscription required. Please proceed to payment.')
          // Redirect to payment or show payment modal
          return
        }
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const result = await response.json()
      alert('Report generated successfully!')
      loadReports()
    } catch (error: any) {
      console.error('Generate report error:', error)
      alert(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold">Your Reports</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Create a personalized astrological report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Report Type</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="basic"
                  checked={reportType === 'basic'}
                  onChange={() => setReportType('basic')}
                />
                <span>Basic (Free)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="premium"
                  checked={reportType === 'premium'}
                  onChange={() => setReportType('premium')}
                />
                <span>Premium (Paid)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Include Additional Analysis</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePalmistry}
                  onChange={(e) => setIncludePalmistry(e.target.checked)}
                />
                <span>Include Palmistry Analysis</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAura}
                  onChange={(e) => setIncludeAura(e.target.checked)}
                />
                <span>Include Aura Reading</span>
              </label>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>View and download your generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reports yet. Generate your first report above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.reportId} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      {report.type === 'premium' && (
                        <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">Premium</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date(report.generatedAt || report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </a>
                    <a href={report.pdfUrl} download>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

