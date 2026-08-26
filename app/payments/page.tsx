'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ErrorState,
  LoadingState,
  RetryButton,
} from '@/components/ui/feedback-state'
import {
  getOneTimeProduct,
  getSubscriptionPlan,
  type SubscriptionPlanId,
} from '@/lib/pricing/plans'
import { useUserStore } from '@/store/user-store'

interface SubscriptionStatusResponse {
  active: boolean
  planId: SubscriptionPlanId | null
  productId: string | null
  razorpaySubscriptionId: string | null
  status: string | null
}

export default function PaymentsPage() {
  const router = useRouter()
  const { user } = useUserStore()

  const [status, setStatus] =
    useState<SubscriptionStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(
    async (refresh = false) => {
      try {
        refresh ? setRefreshing(true) : setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/subscriptions/status${refresh ? '?refresh=true' : ''}`,
          {
            cache: 'no-store',
            credentials: 'include',
          }
        )

        if (response.status === 401) {
          router.push('/login')
          return
        }

        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            json?.error || `Unable to load subscription (${response.status})`
          )
        }

        setStatus(json as SubscriptionStatusResponse)
      } catch (err: any) {
        console.error('Payments status error:', err)
        setError(err?.message || 'Failed to load subscription')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [router]
  )

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    void fetchStatus()
  }, [fetchStatus, router, user])

  if (!user) return null

  const plan = status?.planId
    ? getSubscriptionPlan(status.planId)
    : null

  const statusLabel = status?.status || 'none'

  const quickReading = getOneTimeProduct('99')
  const deepInsight = getOneTimeProduct('199')
  const supremeReading = getOneTimeProduct('299')

  return (
    <DashboardPageShell
      title="Payments & Plan"
      subtitle="Manage your JyotiAI access, subscription, and reading credits"
      rightActions={
        <Button
          variant="outline"
          onClick={() => fetchStatus(true)}
          disabled={refreshing}
          className="min-h-11"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
          Refresh status
        </Button>
      }
    >
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10">
                <CreditCard className="h-5 w-5 text-amber-500" />
              </div>

              <div>
                <CardTitle>Current access</CardTitle>
                <CardDescription className="mt-1">
                  Your canonical subscription status is synchronized with the
                  JyotiAI payment service.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <LoadingState
                title="Checking your plan"
                description="Reading your latest subscription state."
              />
            ) : error ? (
              <ErrorState
                title="Subscription unavailable"
                description={error}
                action={<RetryButton onClick={() => fetchStatus()} />}
              />
            ) : status?.active && plan ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <Badge variant="success" className="mb-3">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Active
                  </Badge>

                  <h2 className="font-display text-2xl font-semibold">
                    {plan.name}
                  </h2>

                  <p className="mt-1 text-lg font-medium">
                    {plan.priceLabel}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </p>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {plan.features.slice(0, 5).map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="min-w-[230px] rounded-xl border bg-muted/20 p-4">
                  <p className="text-sm font-semibold">Subscription state</p>

                  <dl className="mt-3 space-y-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Razorpay status</dt>
                      <dd className="mt-1 font-mono">{statusLabel}</dd>
                    </div>

                    {status.razorpaySubscriptionId && (
                      <div>
                        <dt className="text-muted-foreground">
                          Subscription ID
                        </dt>
                        <dd className="mt-1 break-all font-mono">
                          {status.razorpaySubscriptionId}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    Free / one-time access
                  </Badge>

                  <h2 className="font-display text-2xl font-semibold">
                    No active monthly subscription
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    You can continue using one-time reading packs, or choose a
                    monthly JyotiAI plan for broader access.
                  </p>

                  {status?.planId && plan && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Razorpay currently reports{' '}
                      <span className="font-mono">{statusLabel}</span> for{' '}
                      {plan.name}. Access is granted only after the subscription
                      becomes active.
                    </p>
                  )}
                </div>

                <Link href="/pricing">
                  <Button className="min-h-11">
                    View monthly plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Quick
              </Badge>
              <CardTitle>
                {quickReading?.name || 'Quick Reading'} · ₹{quickReading?.amountInINR || 99}
              </CardTitle>
              <CardDescription>
                {quickReading?.description || 'One-time JyotiAI reading access.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pay/99">
                <Button variant="outline" className="w-full">
                  Choose ₹99
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-300/40">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Popular
              </Badge>
              <CardTitle>
                {deepInsight?.name || 'Deep Insight'} · ₹{deepInsight?.amountInINR || 199}
              </CardTitle>
              <CardDescription>
                {deepInsight?.description || 'One-time JyotiAI reading access.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pay/199">
                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Choose ₹199
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Extended
              </Badge>
              <CardTitle>
                {supremeReading?.name || 'Supreme Reading'} · ₹{supremeReading?.amountInINR || 299}
              </CardTitle>
              <CardDescription>
                {supremeReading?.description || 'One-time JyotiAI reading access.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pay/299">
                <Button variant="outline" className="w-full">
                  Choose ₹299
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Secure payment flow</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Purchases continue through the existing Razorpay checkout and
                  server-side verification flow.
                </p>
              </div>
            </div>

            <Link href="/support">
              <Button variant="outline">Payment help</Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </DashboardPageShell>
  )
}
