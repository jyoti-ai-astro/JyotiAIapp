'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Download, Sparkles, Lock, RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState, LoadingState } from '@/components/ui/feedback-state'
import { useUserStore } from '@/store/user-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { ProductPageFrame } from '@/components/product'

interface Report {
  id?: string
  reportId: string
  type: 'kundali' | 'predictions' | 'timeline'
  title: string
  pdfUrl?: string | null
  storagePath?: string | null
  failureReason?: string | null
  generatedAt?: string
  createdAt: string
  status?: 'queued' | 'generating' | 'ready' | 'failed'
  outdated?: boolean
  staleStatus?: 'current' | 'outdated_after_birth_change'
  image?: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadReports()
  }, [user, router])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/list', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setReports(result.reports || [])
      }
    } catch (error) {
      console.error('Load reports error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (type: 'kundali' | 'predictions' | 'timeline') => {
    setGenerating(true)
    setErrorMessage(null)

    try {
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          sendEmail: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        if (error.code === 'NO_TICKETS') {
          router.push(type === 'kundali' ? '/pay/199' : '/pay/299')
          return
        }
        throw new Error(error.error || error.message || 'Failed to generate report')
      }

      const result = await response.json()
      if (result.report?.reportId) {
        router.push(`/reports/${result.report.reportId}`)
        return
      }

      loadReports()
    } catch (error: any) {
      console.error('Generate report error:', error)
      setErrorMessage(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  if (!user) {
    return (
      <DashboardPageShell
        title="Your Reports"
        subtitle="Restoring your JyotiAI session."
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <LoadingState
            title="Opening Your Reports"
            description="Restoring your saved reports."
          />
        </div>
      </DashboardPageShell>
    )
  }

  const displayReports = reports

  return (
    <ProductPageFrame product="reports">
      <DashboardPageShell
        title="Your Reports"
        subtitle="Your saved Kundali, prediction, and timeline reports"
      >
        <div className="mx-auto w-full max-w-[1320px] space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[28px] border border-[#dfa84d]/20 bg-[#091216] p-6 md:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-10 top-8 h-52 w-52 rounded-full border border-[#dfa84d]/10"
            />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dfa84d]/24 bg-[#dfa84d]/10 px-4 py-1.5 text-sm text-[#e6b96f]">
                <Sparkles className="h-4 w-4" />
                <span>Personal Astrology Library</span>
              </div>

              <h2 className="mt-5 font-heading text-3xl font-semibold text-[#f8f1e6] md:text-5xl">
                Your cosmic reports, in one library.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aaa69e] md:text-base">
                Generate, revisit, and download your Kundali, predictions, and
                timeline reports without leaving your JyotiAI workspace.
              </p>
            </div>

            {errorMessage && (
              <div className="relative z-10 mt-6 rounded-xl border border-[#b85c4e]/30 bg-[#351716]/40 p-4">
                <p className="text-sm text-[#f0a79c]">{errorMessage}</p>
              </div>
            )}
          </motion.section>

          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dfa84d]">
                Create a report
              </p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-[#f5eee2]">
                Choose your report type
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  type: 'kundali' as const,
                  title: 'Full Kundali Report',
                  description:
                    'Complete birth chart analysis with planetary positions, dasha periods, and life themes.',
                  badge: 'Included in Supreme Plan',
                },
                {
                  type: 'predictions' as const,
                  title: '12-Month Predictions',
                  description:
                    'Detailed forecasts for career, love, money, health, and spiritual growth.',
                  badge: 'Paid · ₹299',
                },
                {
                  type: 'timeline' as const,
                  title: '12-Month Timeline',
                  description:
                    'Month-by-month cosmic journey with themes, intensity, and focus areas.',
                  badge: 'Paid · ₹299',
                },
              ].map((item) => (
                <Card
                  key={item.type}
                  className="flex h-full flex-col border-[#dca94e]/16 bg-[#0a1418] text-[#f5eee2] hover:border-[#dca94e]/30"
                >
                  <CardHeader className="flex-1">
                    <Badge
                      variant="outline"
                      className="mb-3 w-fit border-[#dca94e]/20 bg-[#dca94e]/[0.055] text-[#dcb36f]"
                    >
                      {item.badge}
                    </Badge>

                    <CardTitle className="text-[#f5eee2]">
                      {item.title}
                    </CardTitle>

                    <CardDescription className="text-[#9f9b94]">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Button
                      onClick={() => handleGenerate(item.type)}
                      disabled={generating}
                      className="min-h-11 w-full border-[#e8aa4f] bg-[#e99a34] font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dfa84d]">
                  Saved library
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold text-[#f5eee2]">
                  Previous reports
                </h3>
              </div>

              {displayReports.length > 0 && (
                <p className="text-sm text-[#8f8b84]">
                  {displayReports.length}{' '}
                  {displayReports.length === 1 ? 'report' : 'reports'}
                </p>
              )}
            </div>

            {loading ? (
              <Card className="border-[#dca94e]/16 bg-[#091216]">
                <CardContent>
                  <LoadingState
                    title="Loading reports"
                    description="Checking your persisted report library."
                    className="text-[#f5eee2]"
                  />
                </CardContent>
              </Card>
            ) : displayReports.length === 0 ? (
              <Card className="border-[#dca94e]/16 bg-[#091216]">
                <CardContent>
                  <EmptyState
                    title="No reports yet"
                    description="Generate your first report from Kundali, Predictions, or Timeline."
                    className="text-[#f5eee2]"
                    action={
                      <Button
                        onClick={() => handleGenerate('kundali')}
                        disabled={generating}
                        className="min-h-11 border-[#e8aa4f] bg-[#e99a34] text-[#160d04] hover:bg-[#f1aa4d]"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Kundali Report
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {displayReports.map((report, index) => {
                  const reportDate = report.generatedAt || report.createdAt

                  const formattedDate = reportDate
                    ? new Date(reportDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Unknown date'

                  return (
                    <motion.div
                      key={report.reportId}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group h-full overflow-hidden border-[#dca94e]/16 bg-[#0a1418] text-[#f5eee2] hover:border-[#dca94e]/30">
                        <div className="relative h-40 overflow-hidden bg-[#040b0f]">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(242,140,40,0.26),transparent_32%),radial-gradient(circle_at_75%_55%,rgba(47,125,126,0.18),transparent_30%),linear-gradient(135deg,#07131F,#0B1D2C)] transition-transform duration-700 group-hover:scale-105" />

                          <div className="absolute right-4 top-4">
                            <Badge
                              variant={
                                report.type === 'kundali'
                                  ? 'premium'
                                  : 'default'
                              }
                              className={cn(
                                'border-0 backdrop-blur-md',
                                report.type === 'kundali'
                                  ? 'bg-[#F28C28]/20 text-[#FFF8E6]'
                                  : 'bg-[#2F7D7E]/25 text-[#E6FFFF]'
                              )}
                            >
                              {report.status === 'ready'
                                ? report.type
                                : report.status}
                            </Badge>
                          </div>

                          {report.outdated && (
                            <div className="absolute left-4 top-4">
                              <Badge className="border border-amber-300/30 bg-amber-500/15 text-amber-100">
                                Outdated
                              </Badge>
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4">
                            <FileText className="h-7 w-7 text-[#dfa84d]/80" />
                          </div>
                        </div>

                        <div className="relative z-10 space-y-5 p-6">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="font-heading text-xl font-semibold text-[#f5eee2]">
                                {report.title}
                              </h3>

                              {report.status === 'failed' ? (
                                <Lock className="h-5 w-5 shrink-0 text-[#d77f71]" />
                              ) : (
                                <FileText className="h-5 w-5 shrink-0 text-[#66a5a5]" />
                              )}
                            </div>

                            <p className="text-sm text-[#8f8b84]">
                              {report.status === 'ready'
                                ? 'Generated'
                                : 'Requested'}{' '}
                              on {formattedDate}
                            </p>

                            {report.outdated && (
                              <p className="text-sm leading-6 text-amber-200/80">
                                Birth details changed after this report.
                                Regenerate for current astrology.
                              </p>
                            )}

                            {report.status === 'failed' && (
                              <p className="text-sm leading-6 text-[#e7a097]">
                                {report.failureReason ||
                                  'Report generation failed'}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3 pt-2">
                            {report.status === 'failed' ? (
                              <Button
                                onClick={() =>
                                  handleGenerate(report.type)
                                }
                                className="min-h-11 w-full border-[#e8aa4f] bg-[#e99a34] font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
                              >
                                Retry
                              </Button>
                            ) : report.status === 'ready' &&
                              report.pdfUrl ? (
                              <>
                                <Link
                                  href={`/reports/${report.reportId}`}
                                  className="flex-1"
                                >
                                  <Button
                                    variant="outline"
                                    className="min-h-11 w-full border-[#dca94e]/20 bg-[#10191d] text-[#f2e9dc] hover:bg-[#162126]"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </Button>
                                </Link>

                                <a
                                  href={report.pdfUrl}
                                  download
                                  className="flex-1"
                                >
                                  <Button className="min-h-11 w-full border-[#34787a] bg-[#255f61] text-white hover:bg-[#2e7072]">
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF
                                  </Button>
                                </a>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full border-[#dca94e]/14 bg-[#0c1519] text-[#7d7a74]"
                                disabled
                              >
                                {report.status === 'queued'
                                  ? 'Queued...'
                                  : 'Generating...'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: displayReports.length * 0.05 }}
                  className="h-full"
                >
                  <button
                    onClick={() => handleGenerate('kundali')}
                    disabled={generating}
                    className="flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#dca94e]/20 bg-[#091216]/60 p-8 transition-all hover:border-[#dca94e]/40 hover:bg-[#0d181c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dca94e]/18 bg-[#dca94e]/[0.055]">
                      {generating ? (
                        <RefreshCw className="h-7 w-7 animate-spin text-[#dfa84d]" />
                      ) : (
                        <Sparkles className="h-7 w-7 text-[#dfa84d]" />
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-[#f5eee2]">
                        Generate New Report
                      </h3>
                      <p className="mt-2 text-sm text-[#8f8b84]">
                        Detailed Life & Destiny Analysis
                      </p>
                    </div>
                  </button>
                </motion.div>
              </div>
            )}
          </section>
        </div>
      </DashboardPageShell>
    </ProductPageFrame>
  )
}
