/**
 * API Health Check Tool
 * 
 * Phase 5 - Dev-only tool to test all API endpoints
 * 
 * Only accessible in development mode
 */

'use client'

import { useState, useEffect } from 'react'
import { API_ENDPOINTS, getAllCategories, type ApiEndpoint } from '@/lib/dev/api-endpoints'
import { getFeatureAccess } from '@/lib/payments/feature-access'
import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface EndpointStatus {
  endpoint: ApiEndpoint
  status: 'pending' | 'checking' | 'success' | 'error'
  statusCode?: number
  error?: string
  responseTime?: number
}

export default function ApiHealthPage() {
  const [endpointStatuses, setEndpointStatuses] = useState<EndpointStatus[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Initialize statuses
  useEffect(() => {
    const initialStatuses: EndpointStatus[] = API_ENDPOINTS.map((endpoint) => ({
      endpoint,
      status: 'pending',
    }))
    setEndpointStatuses(initialStatuses)
  }, [])

  const runHealthCheck = async () => {
    setIsRunning(true)
    const startTime = Date.now()

    // Reset all statuses
    setEndpointStatuses((prev) =>
      prev.map((s) => ({ ...s, status: 'pending', statusCode: undefined, error: undefined }))
    )

    // Check each endpoint
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
      const endpoint = API_ENDPOINTS[i]

      // Update status to checking
      setEndpointStatuses((prev) => {
        const updated = [...prev]
        updated[i] = { ...updated[i], status: 'checking' }
        return updated
      })

      const checkStartTime = Date.now()

      try {
        const options: RequestInit = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          },
        }

        // Add body for POST requests
        if (endpoint.method === 'POST' && endpoint.sampleBody) {
          options.body = JSON.stringify(endpoint.sampleBody)
        } else if (endpoint.method === 'POST') {
          options.body = JSON.stringify({})
        }

        const response = await fetch(endpoint.path, options)
        const responseTime = Date.now() - checkStartTime

        // Determine success based on expected status or 2xx range
        const isSuccess =
          endpoint.expectedStatus
            ? response.status === endpoint.expectedStatus
            : response.status >= 200 && response.status < 300

        // Also consider 401/403 as "working" (auth required)
        const isWorking = isSuccess || response.status === 401 || response.status === 403

        setEndpointStatuses((prev) => {
          const updated = [...prev]
          updated[i] = {
            ...updated[i],
            status: isWorking ? 'success' : 'error',
            statusCode: response.status,
            responseTime,
            error: isWorking ? undefined : `Unexpected status: ${response.status}`,
          }
          return updated
        })
      } catch (error: any) {
        const responseTime = Date.now() - checkStartTime
        setEndpointStatuses((prev) => {
          const updated = [...prev]
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: error.message || 'Network error',
            responseTime,
          }
          return updated
        })
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setIsRunning(false)
  }

  const filteredStatuses =
    selectedCategory === 'all'
      ? endpointStatuses
      : endpointStatuses.filter((s) => s.endpoint.category === selectedCategory)

  const successCount = endpointStatuses.filter((s) => s.status === 'success').length
  const errorCount = endpointStatuses.filter((s) => s.status === 'error').length
  const pendingCount = endpointStatuses.filter((s) => s.status === 'pending').length

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center text-gray-500">This tool is only available in development mode.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">API Health Check Tool</h1>
          <p className="text-gray-400">
            Test all API endpoints to verify they're responding correctly. Endpoints that return 401/403 are
            considered working (auth required).
          </p>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Success: {successCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Errors: {errorCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span>Pending: {pendingCount}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 items-center">
            <Button
              onClick={runHealthCheck}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Full Health Check
                </>
              )}
            </Button>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
            >
              <option value="all">All Categories</option>
              {getAllCategories().map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Table */}
        <Card className="bg-gray-900 border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4">Endpoint</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Response Time</th>
                  <th className="text-left p-4">Ticket Guarded</th>
                  <th className="text-left p-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredStatuses.map((status, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-mono text-sm">{status.endpoint.path}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          status.endpoint.method === 'GET'
                            ? 'bg-blue-500/20 text-blue-400'
                            : status.endpoint.method === 'POST'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {status.endpoint.method}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{status.endpoint.category}</td>
                    <td className="p-4">
                      {status.status === 'pending' && (
                        <span className="text-gray-500">Pending</span>
                      )}
                      {status.status === 'checking' && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Checking...</span>
                        </div>
                      )}
                      {status.status === 'success' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">OK</span>
                          {status.statusCode && (
                            <span className="text-xs text-gray-500">({status.statusCode})</span>
                          )}
                        </div>
                      )}
                      {status.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-500">Error</span>
                          {status.statusCode && (
                            <span className="text-xs text-gray-500">({status.statusCode})</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {status.responseTime ? `${status.responseTime}ms` : '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {status.endpoint.ticketGuarded && status.endpoint.featureKey && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          <Lock className="w-3 h-3 mr-1" /> {getFeatureAccess(status.endpoint.featureKey).label}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {status.error && <span className="text-red-400">{status.error}</span>}
                      {!status.error && status.status === 'success' && (
                        <span className="text-green-400">Endpoint is responding</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Legend */}
        <Card className="bg-gray-900 border-gray-800 p-4">
          <h3 className="font-semibold mb-2">Legend</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>
              <span className="text-green-500">Success</span>: Endpoint responded correctly (200-299 or expected
              status)
            </li>
            <li>
              <span className="text-green-500">401/403</span>: Considered working (authentication required)
            </li>
            <li>
              <span className="text-red-500">Error</span>: Endpoint failed or returned unexpected status
            </li>
            <li>
              <span className="text-gray-500">Pending</span>: Not yet checked
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

