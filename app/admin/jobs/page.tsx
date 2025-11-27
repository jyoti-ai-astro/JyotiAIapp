'use client'

/**
 * Background Jobs Console Page
 * Milestone 10 - Step 10
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Job {
  id: string
  name: string
  schedule: string
  status: string
  lastRun: any
  nextRun: any
  failures: number
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchJobs()
    // Refresh every 30 seconds
    const interval = setInterval(fetchJobs, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/jobs')
      const data = await response.json()

      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrigger = async (jobId: string) => {
    if (!confirm(`Trigger ${jobId} now?`)) return

    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Job triggered successfully')
        fetchJobs()
      }
    } catch (error) {
      console.error('Trigger failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Background Jobs Console</h1>
        <p className="text-muted-foreground">Monitor and trigger background jobs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{job.name}</CardTitle>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    job.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {job.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Schedule: {job.schedule}</p>
              <p className="text-sm text-muted-foreground">
                Last Run: {job.lastRun?.toDate?.()?.toLocaleString() || 'Never'}
              </p>
              <p className="text-sm text-muted-foreground">
                Next Run: {job.nextRun?.toDate?.()?.toLocaleString() || 'N/A'}
              </p>
              {job.failures > 0 && (
                <p className="text-sm text-red-600">Failures: {job.failures}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTrigger(job.id)}
                className="w-full mt-4"
              >
                Trigger Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

