'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, RefreshCw } from 'lucide-react'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState, LoadingState, RetryButton } from '@/components/ui/feedback-state'
import { getSubscriptionPlan, type SubscriptionPlanId } from '@/lib/pricing/plans'

interface SubscriptionStatusResponse {
  active: boolean
  planId: SubscriptionPlanId | null
  productId: string | null
  razorpaySubscriptionId: string | null
  status: string | null
}

export default function PaymentsPage() {
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true)
      setError(null)

      const res = await fetch(`/api/subscriptions/status${refresh ? '?refresh=true' : ''}`, {
        cache: 'no-store',
        credentials: 'include',
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || `Status ${res.status}`)
      }

      setStatus(json as SubscriptionStatusResponse)
    } catch (err: any) {
      setError(err?.message || 'Failed to load subscription')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const plan = status?.planId ? getSubscriptionPlan(status.planId) : null
  const statusLabel = status?.status || 'none'

  return (
    <DashboardPageShell
      title="Payments"
      subtitle="Current plan, subscription status, and purchase options"
      rightActions={
        <Button variant="outline" onClick={() => fetchStatus(true)} disabled={refreshing} className="min-h-11">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Read from `/api/subscriptions/status`; Razorpay `created` is shown as pending and does not grant active access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState title="Checking subscription" description="Loading your canonical subscription state." />
            ) : error ? (
              <ErrorState
                title="Subscription unavailable"
                description={error}
                action={<RetryButton onClick={() => fetchStatus()} />}
              />
            ) : !status?.active ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">No active subscription</Badge>
                    <p className="text-sm text-muted-foreground">
                      Current Razorpay status: <span className="font-mono">{statusLabel}</span>
                    </p>
                    {status?.planId && plan && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Pending plan: {plan.name} · {plan.priceLabel}{plan.period}
                      </p>
                    )}
                  </div>
                  <Link href="/pricing">
                    <Button className="min-h-11 w-full sm:w-auto">View Plans</Button>
                  </Link>
                </div>
              </div>
            ) : plan ? (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge variant="success" className="mb-3">Active</Badge>
                  <h2 className="text-xl font-semibold">
                    {plan.name} · {plan.priceLabel}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Subscription details</p>
                  <p className="mt-2 break-all font-mono">Status: {status.status || 'unknown'}</p>
                  {status.razorpaySubscriptionId && (
                    <p className="mt-1 break-all font-mono">Sub ID: {status.razorpaySubscriptionId}</p>
                  )}
                  {status.productId && (
                    <p className="mt-1 break-all font-mono">Product: {status.productId}</p>
                  )}
                </div>
              </div>
            ) : (
              <ErrorState
                title="Unknown plan"
                description="Your subscription is active, but its plan metadata could not be resolved."
                action={<Link href="/support"><Button variant="outline">Contact Support</Button></Link>}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>One-Time Purchases</CardTitle>
            <CardDescription>
              One-time products add tickets or prediction credits. They are separate from monthly subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Link href="/pay/99">
              <Button variant="outline" className="min-h-11 w-full">Quick Reading · ₹99</Button>
            </Link>
            <Link href="/pay/199">
              <Button variant="outline" className="min-h-11 w-full">Deep Insight · ₹199</Button>
            </Link>
            <Link href="/pay/299">
              <Button variant="outline" className="min-h-11 w-full">Predictions Credit · ₹299</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  )
}
