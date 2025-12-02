/**
 * Smoke Test Page
 * 
 * Launch Guardrails - Phase LZ2
 * 
 * Dev-only page to manually verify all critical flows
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'

interface TestResult {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message?: string
}

export default function SmokeTestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({
    auth: { status: 'idle' },
    tickets: { status: 'idle' },
    subscription: { status: 'idle' },
    guru: { status: 'idle' },
    paymentsConfig: { status: 'idle' },
  })

  const runTest = async (key: string, endpoint: string, options?: RequestInit) => {
    setResults((prev) => ({ ...prev, [key]: { status: 'loading' } }))

    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        ...options,
      })

      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`)
      }

      const json = await response.json()
      const message = JSON.stringify(json, null, 2).slice(0, 1000)

      setResults((prev) => ({
        ...prev,
        [key]: { status: 'ok', message },
      }))
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [key]: { status: 'error', message: error.message || 'Unknown error' },
      }))
    }
  }

  const tests = [
    {
      key: 'auth',
      label: 'Auth Check',
      description: 'Verify authentication status',
      endpoint: '/api/user/get',
      method: 'GET',
    },
    {
      key: 'tickets',
      label: 'Tickets Check',
      description: 'Get user tickets and subscription info',
      endpoint: '/api/user/tickets',
      method: 'GET',
    },
    {
      key: 'subscription',
      label: 'Subscription Status',
      description: 'Get current subscription status',
      endpoint: '/api/subscriptions/status',
      method: 'GET',
    },
    {
      key: 'guru',
      label: 'Guru API (Dry Run)',
      description: 'Test Guru API endpoint',
      endpoint: '/api/guru',
      method: 'POST',
      body: JSON.stringify({ question: 'test', dryRun: true }),
    },
    {
      key: 'paymentsConfig',
      label: 'Payments Config',
      description: 'Check Razorpay configuration',
      endpoint: '/api/dev/payments-config',
      method: 'GET',
    },
  ]

  return (
    <DashboardPageShell title="Smoke Test" subtitle="Verify critical flows">
      <div className="space-y-4">
        {tests.map((test) => {
          const result = results[test.key]
          return (
            <Card key={test.key} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{test.label}</CardTitle>
                    <CardDescription className="text-gray-400">{test.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status === 'idle' && (
                      <span className="text-gray-500 text-sm">Not tested</span>
                    )}
                    {result.status === 'loading' && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                    {result.status === 'ok' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {result.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{test.method}</span>
                  <span className="text-xs text-gray-500 font-mono">{test.endpoint}</span>
                </div>
                <Button
                  onClick={() =>
                    runTest(test.key, test.endpoint, {
                      method: test.method,
                      headers: test.body ? { 'Content-Type': 'application/json' } : undefined,
                      body: test.body,
                    })
                  }
                  disabled={result.status === 'loading'}
                  variant="outline"
                  className="w-full"
                >
                  {result.status === 'loading' ? 'Running...' : 'Run Test'}
                </Button>
                {result.message && (
                  <div className="mt-4 p-3 bg-black/40 rounded-lg border border-gray-700">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-64">
                      {result.message}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </DashboardPageShell>
  )
}

