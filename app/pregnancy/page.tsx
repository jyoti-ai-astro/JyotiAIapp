'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Baby,
  Heart,
  LockKeyhole,
  ShieldAlert,
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
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { useTicketAccess } from '@/lib/access/useTicketAccess'
import { getFeatureAccess } from '@/lib/payments/feature-access'
import { useUserStore } from '@/store/user-store'

export default function PregnancyPage() {
  const router = useRouter()
  const { user } = useUserStore()

  const featureKey = 'pregnancy' as const
  const {
    hasAccess,
    loading: ticketLoading,
  } = useTicketAccess(featureKey)

  const featureConfig = getFeatureAccess(featureKey)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  if (ticketLoading) {
    return (
      <DashboardPageShell
        title="Pregnancy Insights"
        subtitle="Preparing your JyotiAI access"
      >
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-b-amber-500" />
              <p className="mt-4 text-sm text-muted-foreground">
                Checking your plan and reading credits…
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardPageShell>
    )
  }

  if (!hasAccess) {
    return (
      <DashboardPageShell
        title="Pregnancy Insights"
        subtitle="Astrological family-planning guidance"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10">
                  <LockKeyhole className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Premium astrology module</CardTitle>
                  <CardDescription className="mt-1">
                    Pregnancy Insights uses prediction access from your current
                    plan or reading-credit balance.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <OneTimeOfferBanner
            feature={featureConfig.label}
            productId={featureConfig.defaultProductId}
          />

          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardPageShell>
    )
  }

  return (
    <DashboardPageShell
      title="Pregnancy Insights"
      subtitle="Astrological family-planning guidance from JyotiAI"
    >
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10">
                <Baby className="h-6 w-6 text-amber-500" />
              </div>

              <div>
                <Badge variant="secondary" className="mb-3">
                  Family observatory
                </Badge>
                <CardTitle className="font-display text-2xl">
                  Pregnancy & conception guidance
                </CardTitle>
                <CardDescription className="mt-2 max-w-3xl leading-6">
                  This JyotiAI module is reserved for chart-led astrological
                  timing and reflective guidance around family planning.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border border-amber-300/30 bg-amber-50/40 p-5 dark:bg-amber-300/[0.04]">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold">
                    Production astrology engine pending
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your access is valid, but JyotiAI will not present the
                    current placeholder pregnancy engine as a personalized
                    production reading. The chart-derived production engine
                    must be connected before this module is released.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Heart className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Chart context</CardTitle>
              <CardDescription>
                Future guidance can incorporate the relevant houses, planetary
                periods, and chart state.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Timing context</CardTitle>
              <CardDescription>
                Production results should be calculated from real JyotiAI
                astrology data rather than fixed example dates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Important boundary</CardTitle>
              <CardDescription>
                Astrology guidance is not medical advice, diagnosis, fertility
                assessment, or a substitute for qualified healthcare.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/kundali">
            <Button>View Kundali</Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </DashboardPageShell>
  )
}
