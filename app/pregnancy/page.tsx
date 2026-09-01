'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Baby,
  Heart,
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
import { useUserStore } from '@/store/user-store'

export default function PregnancyPage() {
  const router = useRouter()
  const { user } = useUserStore()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

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
                  Preview
                </Badge>

                <CardTitle className="font-display text-2xl">
                  Pregnancy & conception guidance
                </CardTitle>

                <CardDescription className="mt-2 max-w-3xl leading-6">
                  This module is currently a preview of JyotiAI&apos;s planned
                  chart-led family-planning guidance.
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
                    Personalized Pregnancy Insights are not currently available
                    for purchase or production use. JyotiAI will enable this
                    experience only after the chart-derived production engine
                    is connected and launch-ready.
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

              <CardTitle className="text-lg">
                Chart context
              </CardTitle>

              <CardDescription>
                Future guidance can incorporate the relevant houses, planetary
                periods, and chart state.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-5 w-5 text-amber-500" />

              <CardTitle className="text-lg">
                Timing context
              </CardTitle>

              <CardDescription>
                Production results should be calculated from real JyotiAI
                astrology data rather than fixed example dates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShieldAlert className="h-5 w-5 text-amber-500" />

              <CardTitle className="text-lg">
                Important boundary
              </CardTitle>

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
