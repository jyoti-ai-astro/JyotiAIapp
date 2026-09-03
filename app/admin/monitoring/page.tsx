'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ServerCog,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PaymentsConfig = {
  hasKeyId: boolean
  hasSecret: boolean
  hasPublicKeyId: boolean
  hasStarterPlan: boolean
  hasAdvancedPlan: boolean
  hasSupremePlan: boolean
  isPaymentsDisabled: boolean
}

type SubscriptionHealth = {
  totalActive: number
  totalCancelled: number
  totalExpired: number
  totalPending: number
}

type LogEntry = {
  id: string
  type: string
  data: Record<string, any>
  userId?: string
  createdAt: string | Date
}

type ProviderHealth = {
  provider: string
  attempts: number
  successes: number
  failures: number
  fallbacksIn: number
  fallbacksOut: number
  successRate: number | null
  averageLatencyMs: number | null
  errors: Record<string, number>
}

type OperationalJob = {
  id: string
  name: string
  schedule: string
  configured: boolean
  schedulerConfigured: boolean
  endpoint: string | null
  status: string
  failures: number
  lastRun: any
  lastSuccess: any
  lastFailure: any
  lastDurationMs: number | null
  lastError: string | null
}

type ObservabilitySnapshot = {
  windowHours: number
  checkedAt: string
  logScan: {
    scannedEvents: number
    truncated: boolean
  }
  providers: ProviderHealth[]
  counts: {
    operationalEvents: number
    aiFailures: number
    aiFallbacks: number
    jobFailures: number
    paymentFailures: number
    webhookFailures: number
    apiErrors: number
  }
  recentFailures: Array<{
    id: string
    type: string
    createdAt: string | null
    data: Record<string, any>
  }>
}

function statusClass(status: string) {
  if (
    status === 'healthy' ||
    status === 'success'
  ) {
    return 'text-green-300'
  }

  if (
    status === 'failed' ||
    status === 'unconfigured'
  ) {
    return 'text-red-300'
  }

  return 'text-yellow-300'
}

function formatTimestamp(value: any) {
  if (!value) return 'Never'

  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Unknown'
      : date.toLocaleString()
  }

  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleString()
  }

  if (value?._seconds) {
    return new Date(value._seconds * 1000).toLocaleString()
  }

  return 'Recorded'
}

export default function AdminMonitoringPage() {
  const [paymentsConfig, setPaymentsConfig] =
    useState<PaymentsConfig | null>(null)
  const [subscriptionHealth, setSubscriptionHealth] =
    useState<SubscriptionHealth | null>(null)
  const [paymentFailures, setPaymentFailures] =
    useState<LogEntry[]>([])
  const [webhookEvents, setWebhookEvents] =
    useState<LogEntry[]>([])
  const [jobs, setJobs] =
    useState<OperationalJob[]>([])
  const [observability, setObservability] =
    useState<ObservabilitySnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchJson = async (url: string) => {
    const response = await fetch(url, {
      cache: 'no-store',
    })

    if (!response.ok) return null
    return response.json()
  }

  const fetchMonitoringData = async () => {
    setRefreshing(true)

    try {
      const [
        config,
        health,
        failures,
        webhooks,
        jobData,
        operational,
      ] = await Promise.all([
        fetchJson('/api/admin/monitoring/payments-config'),
        fetchJson('/api/admin/monitoring/health'),
        fetchJson('/api/admin/monitoring/payment-failures'),
        fetchJson('/api/admin/monitoring/webhook-events'),
        fetchJson('/api/admin/jobs'),
        fetchJson('/api/admin/mission/observability?hours=24'),
      ])

      if (config) setPaymentsConfig(config)
      if (health) setSubscriptionHealth(health)
      if (Array.isArray(failures)) setPaymentFailures(failures)
      if (Array.isArray(webhooks)) setWebhookEvents(webhooks)
      if (Array.isArray(jobData?.jobs)) setJobs(jobData.jobs)
      if (operational?.success) setObservability(operational)
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchMonitoringData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-indigo via-cosmic-purple to-cosmic-pink p-8">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-indigo via-cosmic-purple to-cosmic-pink p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              System Monitoring
            </h1>
            <p className="text-white/70">
              Operational truth for payments, AI providers and background jobs
            </p>
          </div>

          <Button
            onClick={() => void fetchMonitoringData()}
            disabled={refreshing}
            className="gold-btn"
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <ServerCog className="h-5 w-5" />
              24-hour Operational Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {observability ? (
              <div className="space-y-4">
                {observability.logScan?.truncated ? (
                  <div className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-3 text-sm text-yellow-100">
                    This snapshot is truncated. Counts and AI provider metrics
                    reflect the first{' '}
                    {observability.logScan.scannedEvents.toLocaleString()}{' '}
                    events scanned in the selected window and are not complete
                    totals.
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
                {Object.entries(observability.counts).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-white/10 bg-black/10 p-3 text-center"
                    >
                      <div className="text-2xl font-bold text-white">
                        {value}
                      </div>
                      <div className="mt-1 break-words text-xs text-white/60">
                        {key}
                      </div>
                    </div>
                  )
                )}
                </div>
              </div>
            ) : (
              <p className="text-white/70">
                No operational snapshot is available yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gold">
              AI Provider Health
              {observability?.logScan?.truncated
                ? ' — truncated scan'
                : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {observability?.providers?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-white/60">
                    <tr>
                      <th className="p-2">Provider</th>
                      <th className="p-2">Attempts</th>
                      <th className="p-2">Success</th>
                      <th className="p-2">Failures</th>
                      <th className="p-2">Fallback In</th>
                      <th className="p-2">Fallback Out</th>
                      <th className="p-2">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observability.providers.map((provider) => (
                      <tr
                        key={provider.provider}
                        className="border-t border-white/10 text-white"
                      >
                        <td className="p-2 font-medium">
                          {provider.provider}
                        </td>
                        <td className="p-2">
                          {provider.attempts}
                        </td>
                        <td className="p-2">
                          {provider.successes}
                        </td>
                        <td className="p-2">
                          {provider.failures}
                        </td>
                        <td className="p-2">
                          {provider.fallbacksIn}
                        </td>
                        <td className="p-2">
                          {provider.fallbacksOut}
                        </td>
                        <td className="p-2">
                          {provider.averageLatencyMs === null
                            ? 'N/A'
                            : `${provider.averageLatencyMs} ms`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white/70">
                No AI provider events have been recorded in this window.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gold">
              Background Job Truth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">
                        {job.name}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {job.schedule}
                      </div>
                    </div>

                    <div
                      className={`text-sm font-semibold ${statusClass(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-white/65">
                    <div>
                      Worker route: {job.configured ? 'Yes' : 'No'}
                    </div>
                    <div>
                      Scheduler configured:{' '}
                      {job.schedulerConfigured ? 'Yes' : 'No'}
                    </div>
                    <div>
                      Last run: {formatTimestamp(job.lastRun)}
                    </div>
                    <div>
                      Last success: {formatTimestamp(job.lastSuccess)}
                    </div>
                    <div>
                      Failures: {job.failures}
                    </div>
                    <div>
                      Last duration:{' '}
                      {job.lastDurationMs
                        ? `${job.lastDurationMs} ms`
                        : 'N/A'}
                    </div>
                  </div>

                  {job.lastError && (
                    <div className="mt-3 rounded border border-red-400/20 bg-red-500/10 p-2 text-xs text-red-200">
                      {job.lastError}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold">
                <CheckCircle2 className="h-5 w-5" />
                Razorpay Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsConfig ? (
                <div className="space-y-2 text-sm text-white/70">
                  {[
                    ['Key ID', paymentsConfig.hasKeyId],
                    ['Key Secret', paymentsConfig.hasSecret],
                    ['Public Key ID', paymentsConfig.hasPublicKeyId],
                    ['Starter Plan', paymentsConfig.hasStarterPlan],
                    ['Advanced Plan', paymentsConfig.hasAdvancedPlan],
                    ['Supreme Plan', paymentsConfig.hasSupremePlan],
                  ].map(([label, present]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between"
                    >
                      <span>{label}</span>
                      {present ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  ))}

                  {paymentsConfig.isPaymentsDisabled && (
                    <div className="mt-3 flex items-center gap-2 rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      Payments are currently disabled
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/70">
                  Unable to load configuration.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">
                Subscription Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionHealth ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {subscriptionHealth.totalActive}
                    </div>
                    <div className="text-xs text-white/60">
                      Active
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {subscriptionHealth.totalPending}
                    </div>
                    <div className="text-xs text-white/60">
                      Pending
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">
                      {subscriptionHealth.totalCancelled}
                    </div>
                    <div className="text-xs text-white/60">
                      Cancelled
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">
                      {subscriptionHealth.totalExpired}
                    </div>
                    <div className="text-xs text-white/60">
                      Expired
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/70">
                  Unable to load subscription health.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">
                Recent Payment Failures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentFailures.length ? (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {paymentFailures.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded border border-red-500/30 bg-red-500/10 p-3"
                    >
                      <div className="text-sm font-medium text-white">
                        {entry.type}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {new Date(entry.createdAt).toLocaleString()}
                      </div>
                      {entry.data?.error && (
                        <div className="mt-1 text-xs text-red-300">
                          {entry.data.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">
                  No recent payment failures.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-cosmic-indigo/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">
                Recent Webhook Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {webhookEvents.length ? (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {webhookEvents.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded border border-blue-500/30 bg-blue-500/10 p-3"
                    >
                      <div className="text-sm font-medium text-white">
                        {entry.type}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {new Date(entry.createdAt).toLocaleString()}
                      </div>
                      {entry.data?.event && (
                        <div className="mt-1 text-xs text-blue-300">
                          {entry.data.event}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">
                  No recent webhook events.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
