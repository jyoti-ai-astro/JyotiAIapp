/**
 * Admin Monitoring Dashboard
 * 
 * Phase Z - Production Validation & Monitoring
 * 
 * Provides real-time visibility into:
 * - Razorpay configuration status
 * - Subscription health metrics
 * - Payment failures
 * - Webhook events
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaymentsConfig {
  hasKeyId: boolean
  hasSecret: boolean
  hasPublicKeyId: boolean
  hasStarterPlan: boolean
  hasAdvancedPlan: boolean
  hasSupremePlan: boolean
  isPaymentsDisabled: boolean
}

interface SubscriptionHealth {
  totalActive: number
  totalCancelled: number
  totalExpired: number
  totalPending: number
}

interface LogEntry {
  id: string
  type: string
  data: Record<string, any>
  userId?: string
  createdAt: Date
}

export default function AdminMonitoringPage() {
  const [paymentsConfig, setPaymentsConfig] = useState<PaymentsConfig | null>(null)
  const [subscriptionHealth, setSubscriptionHealth] = useState<SubscriptionHealth | null>(null)
  const [paymentFailures, setPaymentFailures] = useState<LogEntry[]>([])
  const [webhookEvents, setWebhookEvents] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMonitoringData = async () => {
    setRefreshing(true)
    try {
      // Fetch payments config
      const configRes = await fetch('/api/dev/payments-config')
      if (configRes.ok) {
        const config = await configRes.json()
        setPaymentsConfig(config)
      }

      // Fetch subscription health
      const healthRes = await fetch('/api/admin/monitoring/health')
      if (healthRes.ok) {
        const health = await healthRes.json()
        setSubscriptionHealth(health)
      }

      // Fetch payment failures
      const failuresRes = await fetch('/api/admin/monitoring/payment-failures')
      if (failuresRes.ok) {
        const failures = await failuresRes.json()
        setPaymentFailures(failures)
      }

      // Fetch webhook events
      const webhooksRes = await fetch('/api/admin/monitoring/webhook-events')
      if (webhooksRes.ok) {
        const webhooks = await webhooksRes.json()
        setWebhookEvents(webhooks)
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMonitoringData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-indigo via-cosmic-purple to-cosmic-pink p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-indigo via-cosmic-purple to-cosmic-pink p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">System Monitoring</h1>
            <p className="text-white/70">Real-time health and status monitoring</p>
          </div>
          <Button
            onClick={fetchMonitoringData}
            disabled={refreshing}
            className="gold-btn"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Card 1: Razorpay Keys Status */}
        <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Razorpay Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsConfig ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Key ID</span>
                  {paymentsConfig.hasKeyId ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Key Secret</span>
                  {paymentsConfig.hasSecret ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Public Key ID</span>
                  {paymentsConfig.hasPublicKeyId ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Starter Plan ID</span>
                  {paymentsConfig.hasStarterPlan ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Advanced Plan ID</span>
                  {paymentsConfig.hasAdvancedPlan ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Supreme Plan ID</span>
                  {paymentsConfig.hasSupremePlan ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                {paymentsConfig.isPaymentsDisabled && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-yellow-200 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Payments are currently disabled
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/70">Unable to load configuration</p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Subscription Health */}
        <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Subscription Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionHealth ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{subscriptionHealth.totalActive}</div>
                  <div className="text-sm text-white/70 mt-1">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{subscriptionHealth.totalPending}</div>
                  <div className="text-sm text-white/70 mt-1">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">{subscriptionHealth.totalCancelled}</div>
                  <div className="text-sm text-white/70 mt-1">Cancelled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{subscriptionHealth.totalExpired}</div>
                  <div className="text-sm text-white/70 mt-1">Expired</div>
                </div>
              </div>
            ) : (
              <p className="text-white/70">Unable to load subscription health</p>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Payment Failures */}
        <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Recent Payment Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentFailures.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {paymentFailures.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{entry.type}</p>
                        <p className="text-xs text-white/60 mt-1">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                        {entry.data?.error && (
                          <p className="text-xs text-red-300 mt-1">{entry.data.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/70">No payment failures in the last 20 events</p>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Webhook Events */}
        <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Recent Webhook Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {webhookEvents.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {webhookEvents.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{entry.type}</p>
                        <p className="text-xs text-white/60 mt-1">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                        {entry.data?.event && (
                          <p className="text-xs text-blue-300 mt-1">{entry.data.event}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/70">No webhook events in the last 20 events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

