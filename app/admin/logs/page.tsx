'use client'

/**
 * Logs & Monitoring Console Page
 * Milestone 10 - Step 9
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Log {
  id: string
  message: string
  level?: string
  timestamp: any
  userId?: string
  endpoint?: string
  error?: any
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [logType, setLogType] = useState('error')
  const [level, setLevel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [logType, level, startDate, endDate])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('type', logType)
      if (level) params.append('level', level)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/logs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs & Monitoring</h1>
        <p className="text-muted-foreground">View system logs and monitoring data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger>
                <SelectValue placeholder="Log Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warn">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="api">API Logs</SelectItem>
                <SelectItem value="ai">AI Logs</SelectItem>
                <SelectItem value="email">Email Logs</SelectItem>
                <SelectItem value="cron">Cron Logs</SelectItem>
              </SelectContent>
            </Select>

            {logType === 'error' || logType === 'warn' || logType === 'info' ? (
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div />
            )}

            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : logs.length === 0 ? (
            <div>No logs found</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                        {log.userId && ` | User: ${log.userId}`}
                        {log.endpoint && ` | Endpoint: ${log.endpoint}`}
                        {log.level && ` | Level: ${log.level}`}
                      </p>
                      {log.error && (
                        <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                          {JSON.stringify(log.error, null, 2)}
                        </pre>
                      )}
                    </div>
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

