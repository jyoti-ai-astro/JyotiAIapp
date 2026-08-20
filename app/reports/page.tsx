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
    return null
  }

  const displayReports = reports

  return (
    <DashboardPageShell
      title="Your Reports"
      subtitle="Your saved Kundali, prediction, and timeline reports"
    >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F28C28]/10 border border-[#C9A24A]/30 text-[#8A5A16] text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Personal Astrology Library</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-semibold text-[#07131F]">
            Your Cosmic Reports
          </h1>
          {errorMessage && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </CardContent>
            </Card>
          )}
          <p className="text-lg text-[#56666A]">
            Download detailed PDF analysis of your destiny, karma, and life path.
          </p>
        </motion.div>

        {/* Mega Build 3 - Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Kundali Report Card */}
          <Card className="bg-[#FFFDF4] border-[#D8B56A]/35 hover:border-[#C9A24A]/65 transition-all shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8A5A16]">Full Kundali Report</CardTitle>
              <CardDescription className="text-[#56666A]">
                Complete birth chart analysis with planetary positions, dasha periods, and life themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-4 bg-[#F28C28]/10 text-[#8A5A16] border-[#C9A24A]/35">
                Included in Supreme Plan
              </Badge>
              <Button
                onClick={() => handleGenerate('kundali')}
                disabled={generating}
                className="min-h-11 w-full bg-[#F28C28] text-[#07131F] border border-[#F28C28] hover:bg-[#E57E1D] font-semibold"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Predictions Report Card */}
          <Card className="bg-[#FFFDF4] border-[#D8B56A]/35 hover:border-[#C9A24A]/65 transition-all shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8A5A16]">12-Month Predictions</CardTitle>
              <CardDescription className="text-[#56666A]">
                Detailed forecasts for career, love, money, health, and spiritual growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-4 bg-[#F28C28]/10 text-[#8A5A16] border-[#C9A24A]/35">
                Paid · ₹299
              </Badge>
              <Button
                onClick={() => handleGenerate('predictions')}
                disabled={generating}
                className="min-h-11 w-full bg-[#F28C28] text-[#07131F] border border-[#F28C28] hover:bg-[#E57E1D] font-semibold"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Timeline Report Card */}
          <Card className="bg-[#FFFDF4] border-[#D8B56A]/35 hover:border-[#C9A24A]/65 transition-all shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8A5A16]">12-Month Timeline</CardTitle>
              <CardDescription className="text-[#56666A]">
                Month-by-month cosmic journey with themes, intensity, and focus areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-4 bg-[#F28C28]/10 text-[#8A5A16] border-[#C9A24A]/35">
                Paid · ₹299
              </Badge>
              <Button
                onClick={() => handleGenerate('timeline')}
                disabled={generating}
                className="min-h-11 w-full bg-[#F28C28] text-[#07131F] border border-[#F28C28] hover:bg-[#E57E1D] font-semibold"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <Card>
            <CardContent>
              <LoadingState title="Loading reports" description="Checking your persisted report library." />
            </CardContent>
          </Card>
        ) : displayReports.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="No reports yet"
                description="Generate your first Launch v1 report from Kundali, Predictions, or Timeline."
                action={
                  <Button onClick={() => handleGenerate('kundali')} disabled={generating} className="min-h-11">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Kundali Report
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden bg-[#FFFDF4] border-[#D8B56A]/35 hover:border-[#C9A24A]/65 transition-all duration-300 h-full shadow-sm">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F28C28]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Report Image / Preview */}
                    <div className="relative h-40 w-full bg-[#07131F] overflow-hidden">
                      {/* Fallback pattern if no image */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(242,140,40,0.32),transparent_32%),radial-gradient(circle_at_75%_55%,rgba(47,125,126,0.22),transparent_30%),linear-gradient(135deg,#07131F,#0B1D2C)] opacity-100 group-hover:scale-105 transition-transform duration-700" />

                      <div className="absolute top-4 right-4">
                        <Badge
                          variant={report.type === 'kundali' ? 'premium' : 'default'}
                          className={cn(
                            'backdrop-blur-md border-0',
                            report.type === 'kundali'
                              ? 'bg-[#F28C28]/20 text-[#FFF8E6]'
                              : 'bg-[#2F7D7E]/25 text-[#E6FFFF]'
                          )}
                        >
                          {report.status === 'ready' ? report.type : report.status}
                        </Badge>
                      </div>
                      {report.outdated && (
                        <div className="absolute left-4 top-4">
                          <Badge className="bg-amber-500/20 text-amber-100 border border-amber-300/40">
                            Outdated
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 relative z-10">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-display font-semibold text-[#07131F] group-hover:text-[#8A5A16] transition-colors">
                            {report.title}
                          </h3>
                          {report.status === 'failed' ? (
                            <Lock className="w-5 h-5 text-[#C04A3A]" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#2F7D7E]" />
                          )}
                        </div>
                        <p className="text-sm text-[#6B777A]">
                          {report.status === 'ready' ? 'Generated' : 'Requested'} on {formattedDate}
                        </p>
                        {report.outdated && (
                          <p className="text-sm text-amber-100">
                            Birth details changed after this report. Keep it for records, but regenerate for current astrology.
                          </p>
                        )}
                        {report.status === 'failed' && (
                          <p className="text-sm text-[#A33D31]">
                            {report.failureReason || 'Report generation failed'}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {report.status === 'failed' ? (
                          <Button
                            onClick={() => handleGenerate(report.type)}
                            className="min-h-11 w-full bg-[#F28C28] text-[#07131F] font-semibold hover:bg-[#E57E1D]"
                          >
                            Retry
                          </Button>
                        ) : (
                          <>
                            {report.status === 'ready' && report.pdfUrl ? (
                              <>
                                <Link href={`/reports/${report.reportId}`} className="flex-1">
                                  <Button
                                    variant="outline"
                                    className="min-h-11 w-full border-[#D8B56A]/45 text-[#07131F] hover:bg-[#F5EAD0]"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                                <a href={report.pdfUrl} download className="flex-1">
                                  <Button className="min-h-11 w-full bg-[#2F7D7E] hover:bg-[#286B6C] text-white">
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                  </Button>
                                </a>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full border-[#D8B56A]/45 text-[#07131F] hover:bg-[#F5EAD0]"
                                disabled
                              >
                                {report.status === 'queued' ? 'Queued...' : 'Generating...'}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}

            {/* "Generate New" Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: displayReports.length * 0.1 }}
              className="h-full"
            >
              <button
                onClick={() => handleGenerate('kundali')}
                disabled={generating}
                className="w-full h-full min-h-[300px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-gold/40 hover:bg-white/5 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {generating ? (
                    <RefreshCw className="w-8 h-8 text-[#F28C28] animate-spin" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-[#F28C28]" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-[#07131F] group-hover:text-[#8A5A16]">
                    Generate New Report
                  </h3>
                  <p className="text-sm text-[#6B777A]">Detailed Life & Destiny Analysis</p>
                </div>
              </button>
            </motion.div>
          </div>
        )}
    </DashboardPageShell>
  )
}
