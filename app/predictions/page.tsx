'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Sparkles } from 'lucide-react'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { useUserStore } from '@/store/user-store'
import type { PredictionEngineResult } from '@/lib/engines/prediction-engine-v2'

export default function PredictionsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [predictionResult, setPredictionResult] = useState<PredictionEngineResult | null>(null)
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
        throw new Error(data.message || data.error || 'Failed to generate predictions')
      }

      setPredictionResult(data.data)
    } catch (err: any) {
      console.error('Error generating predictions:', err)
      setPredictionError(err.message || 'Failed to generate predictions. Please try again.')
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
        throw new Error(result.error || result.message || 'Failed to generate report')
      }

      if (result.report?.reportId) {
        router.push(`/reports/${result.report.reportId}`)
      }
    } catch (err: any) {
      console.error('Error generating prediction report:', err)
      setPredictionError(err.message || 'Failed to generate prediction report. Please try again.')
    } finally {
      setDownloadingReport(false)
    }
  }

  if (!user) return null

  return (
    <DashboardPageShell
      title="Predictions"
      subtitle="A server-generated 12-month forecast using your current Kundali context"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <OneTimeOfferBanner
          title="Unlock Full Insights"
          description="Predictions require your verified birth profile and canonical Kundali context."
          priceLabel="₹299"
          ctaLabel="Unlock Now"
          ctaHref="/pay/299"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              12-Month Predictions
            </CardTitle>
            <CardDescription>
              Generation is handled by the canonical server entitlement and AstroContext path.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleGeneratePredictions} disabled={predictionLoading}>
              <Sparkles className={`mr-2 h-4 w-4 ${predictionLoading ? 'animate-spin' : ''}`} />
              {predictionLoading ? 'Generating...' : 'Generate Predictions'}
            </Button>
            <Button variant="outline" onClick={handleGenerateReport} disabled={downloadingReport}>
              <Download className="mr-2 h-4 w-4" />
              {downloadingReport ? 'Preparing Report...' : 'Create PDF Report'}
            </Button>
          </CardContent>
        </Card>

        {predictionError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{predictionError}</p>
              <Button onClick={handleGeneratePredictions} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {predictionResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                {predictionResult.status === 'degraded' && (
                  <CardDescription>
                    Generated with canonical Kundali context; supporting knowledge retrieval was limited.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{predictionResult.overview}</p>
              </CardContent>
            </Card>

            {predictionResult.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.timeframe && <CardDescription>{section.timeframe}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6">{section.summary}</p>

                  {section.opportunities.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold">Opportunities</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {section.opportunities.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.cautions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold">Cautions</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {section.cautions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.recommendedActions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold">Recommended Actions</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {section.recommendedActions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardPageShell>
  )
}
