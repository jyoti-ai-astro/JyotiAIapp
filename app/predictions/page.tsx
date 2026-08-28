'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Download,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Target,
  LoaderCircle,
} from 'lucide-react'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { ProductPageFrame } from '@/components/product'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { useUserStore } from '@/store/user-store'
import type { PredictionEngineResult } from '@/lib/engines/prediction-engine-v2'

export default function PredictionsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [predictionResult, setPredictionResult] =
    useState<PredictionEngineResult | null>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [downloadingReport, setDownloadingReport] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleGeneratePredictions = async () => {
    if (!user) return

    setPredictionLoading(true)
    setPredictionError(null)

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Failed to generate predictions'
        )
      }

      setPredictionResult(data.data)
    } catch (err: any) {
      console.error('Error generating predictions:', err)
      setPredictionError(
        err.message || 'Failed to generate predictions. Please try again.'
      )
    } finally {
      setPredictionLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!user) return

    setDownloadingReport(true)
    setPredictionError(null)

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'predictions',
          sendEmail: false,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          result.error || result.message || 'Failed to generate report'
        )
      }

      if (result.report?.reportId) {
        router.push(`/reports/${result.report.reportId}`)
      }
    } catch (err: any) {
      console.error('Error generating prediction report:', err)
      setPredictionError(
        err.message ||
          'Failed to generate prediction report. Please try again.'
      )
    } finally {
      setDownloadingReport(false)
    }
  }

  if (!user) {
    return (
      <ProductPageFrame product="predictions">
        <DashboardPageShell
          title="Predictions"
          subtitle="Preparing your JyotiAI forecast workspace."
        >
          <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-[#dfa84d]/15 bg-[#091216]">
            <div className="text-center">
              <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-[#dfa84d]" />
              <p className="mt-4 text-sm text-[#aaa69e]">
                Restoring your saved JyotiAI session.
              </p>
            </div>
          </div>
        </DashboardPageShell>
      </ProductPageFrame>
    )
  }

  return (
    <ProductPageFrame product="predictions">
      <DashboardPageShell
        title="Predictions"
        subtitle="A server-generated 12-month forecast using your current Kundali context"
      >
        <div className="mx-auto w-full max-w-[1320px] space-y-7">
          <OneTimeOfferBanner
            title="Unlock Full Insights"
            description="Predictions require your verified birth profile and canonical Kundali context."
            priceLabel="₹299"
            ctaLabel="Unlock Now"
            ctaHref="/pay/299"
          />

          <section className="relative overflow-hidden rounded-[28px] border border-[#dfa84d]/20 bg-[#091216] p-6 md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-8 top-8 h-48 w-48 rounded-full border border-[#dfa84d]/10"
            />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#dfa84d]">
                  <Sparkles className="h-4 w-4" />
                  Forecast engine
                </div>

                <h2 className="mt-4 font-heading text-3xl font-semibold text-[#f8f1e6] md:text-5xl">
                  Your next twelve months, mapped.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aaa69e] md:text-base">
                  Generate your current forecast from the canonical Kundali
                  context and turn it into a saved PDF whenever you need it.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  onClick={handleGeneratePredictions}
                  disabled={predictionLoading}
                  className="min-h-12 border-[#e8aa4f] bg-[#e99a34] px-6 font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
                >
                  <Sparkles
                    className={`mr-2 h-4 w-4 ${
                      predictionLoading ? 'animate-spin' : ''
                    }`}
                  />
                  {predictionLoading
                    ? 'Generating...'
                    : 'Generate Predictions'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  disabled={downloadingReport}
                  className="min-h-12 border-[#dca94e]/25 bg-[#10191d] px-6 text-[#f1eadf] hover:bg-[#162126]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingReport
                    ? 'Preparing Report...'
                    : 'Create PDF Report'}
                </Button>
              </div>
            </div>
          </section>

          {predictionError && (
            <Card className="border-[#b85c4e]/35 bg-[#351716]/35 text-[#f5eee2]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#f0a79c]">{predictionError}</p>
                <Button
                  onClick={handleGeneratePredictions}
                  variant="outline"
                  className="mt-4 border-[#b85c4e]/30 bg-transparent text-[#f4ddd8] hover:bg-[#b85c4e]/10"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!predictionResult && !predictionError && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: TrendingUp,
                  title: 'Opportunities',
                  copy: 'Periods with stronger momentum and supportive timing.',
                },
                {
                  icon: ShieldAlert,
                  title: 'Cautions',
                  copy: 'Periods where restraint and careful decisions matter.',
                },
                {
                  icon: Target,
                  title: 'Actions',
                  copy: 'Practical next steps aligned to your forecast.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[#dca94e]/15 bg-[#0b1519] p-5"
                  >
                    <Icon className="h-5 w-5 text-[#dfa84d]" />
                    <h3 className="mt-4 text-lg font-semibold text-[#f5eee2]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#9f9b94]">
                      {item.copy}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {predictionResult && (
            <div className="space-y-6">
              <Card className="border-[#dca94e]/20 bg-[#091216] text-[#f5eee2]">
                <CardHeader>
                  <CardTitle className="text-[#f5eee2]">Overview</CardTitle>
                  {predictionResult.status === 'degraded' && (
                    <CardDescription className="text-[#d5b47b]">
                      Generated with canonical Kundali context; supporting
                      knowledge retrieval was limited.
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-[#aaa69e]">
                    {predictionResult.overview}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-5 xl:grid-cols-2">
                {predictionResult.sections.map((section) => (
                  <Card
                    key={section.id}
                    className="border-[#dca94e]/16 bg-[#0a1418] text-[#f5eee2]"
                  >
                    <CardHeader>
                      <CardTitle className="text-[#f5eee2]">
                        {section.title}
                      </CardTitle>
                      {section.timeframe && (
                        <CardDescription className="text-[#9f9b94]">
                          {section.timeframe}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <p className="text-sm leading-7 text-[#d8d1c6]">
                        {section.summary}
                      </p>

                      {section.opportunities.length > 0 && (
                        <div className="rounded-xl border border-[#63a5a6]/16 bg-[#63a5a6]/[0.045] p-4">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7dc0c1]">
                            Opportunities
                          </h3>
                          <ul className="mt-3 space-y-2 text-sm text-[#aaa69e]">
                            {section.opportunities.map((item) => (
                              <li key={item} className="flex gap-2">
                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#63a5a6]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.cautions.length > 0 && (
                        <div className="rounded-xl border border-[#d09b4a]/18 bg-[#d09b4a]/[0.04] p-4">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dfa84d]">
                            Cautions
                          </h3>
                          <ul className="mt-3 space-y-2 text-sm text-[#aaa69e]">
                            {section.cautions.map((item) => (
                              <li key={item} className="flex gap-2">
                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#dfa84d]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.recommendedActions.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f5eee2]">
                            Recommended actions
                          </h3>
                          <ul className="mt-3 space-y-2 text-sm text-[#aaa69e]">
                            {section.recommendedActions.map((item) => (
                              <li key={item} className="flex gap-2">
                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#dfa84d]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardPageShell>
    </ProductPageFrame>
  )
}
