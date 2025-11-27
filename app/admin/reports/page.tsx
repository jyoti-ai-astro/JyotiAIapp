'use client'

/**
 * Report Management Page
 * Milestone 10 - Step 4
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Report {
  id: string
  userId: string
  type: string
  status: string
  createdAt: any
  pdfUrl?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/admin/reports?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (userId: string, reportId: string, type: string) => {
    if (!confirm('Regenerate this report?')) return

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reportId, type }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Report regeneration started')
        fetchReports()
      }
    } catch (error) {
      console.error('Regenerate failed:', error)
    }
  }

  const handleDownload = async (userId: string, reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleEmail = async (userId: string, reportId: string, email: string) => {
    if (!email) {
      email = prompt('Enter email address:')
      if (!email) return
    }

    try {
      const response = await fetch(`/api/admin/reports/${reportId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Email sent successfully')
      }
    } catch (error) {
      console.error('Email failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report Management</h1>
        <p className="text-muted-foreground">Manage and monitor all generated reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="marriage">Marriage</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <Button onClick={fetchReports} className="mt-4" disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : reports.length === 0 ? (
            <div>No reports found</div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{report.type} Report</p>
                    <p className="text-sm text-muted-foreground">
                      User: {report.userId} | Status: {report.status} |{' '}
                      {report.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {report.pdfUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report.userId, report.id)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmail(report.userId, report.id, '')}
                        >
                          Email
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(report.userId, report.id, report.type)}
                    >
                      Regenerate
                    </Button>
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

