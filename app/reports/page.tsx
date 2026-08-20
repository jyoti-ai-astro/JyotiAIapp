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
      title="Your Cosmic Reports"
      subtitle="Download detailed PDF analysis of your destiny, karma, and life path"
    >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cosmic-purple/20 border border-cosmic-purple/40 text-gold text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Sacred Knowledge Vault</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-white via-gold to-white bg-clip-text text-transparent">
            Your Cosmic Reports
          </h1>
          {errorMessage && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </CardContent>
            </Card>
          )}
          <p className="text-lg text-white/60 font-light">
            Download detailed PDF analysis of your destiny, karma, and life path.
          </p>
        </motion.div>

        {/* Mega Build 3 - Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Kundali Report Card */}
          <Card className="bg-cosmic-indigo/40 border-white/10 hover:border-gold/30 transition-all backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">Full Kundali Report</CardTitle>
              <CardDescription className="text-white/60">
                Complete birth chart analysis with planetary positions, dasha periods, and life themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/50">
                Included in Supreme Plan
              </Badge>
              <Button
                onClick={() => handleGenerate('kundali')}
                disabled={generating}
                className="w-full bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
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
          <Card className="bg-cosmic-indigo/40 border-white/10 hover:border-gold/30 transition-all backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">12-Month Predictions</CardTitle>
              <CardDescription className="text-white/60">
                Detailed forecasts for career, love, money, health, and spiritual growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/50">
                Paid · ₹299
              </Badge>
              <Button
                onClick={() => handleGenerate('predictions')}
                disabled={generating}
                className="w-full bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
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
          <Card className="bg-cosmic-indigo/40 border-white/10 hover:border-gold/30 transition-all backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gold">12-Month Timeline</CardTitle>
              <CardDescription className="text-white/60">
                Month-by-month cosmic journey with themes, intensity, and focus areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/50">
                Paid · ₹299
              </Badge>
              <Button
                onClick={() => handleGenerate('timeline')}
                disabled={generating}
                className="w-full bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
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
                  <Card className="group relative overflow-hidden bg-cosmic-indigo/40 border-white/10 hover:border-gold/30 transition-all duration-500 h-full backdrop-blur-xl">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Report Image / Preview */}
                    <div className="relative h-48 w-full bg-cosmic-navy/50 overflow-hidden">
                      {/* Fallback pattern if no image */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/20 via-cosmic-indigo/30 to-cosmic-navy/50 opacity-60 group-hover:scale-105 transition-transform duration-700" />

                      <div className="absolute top-4 right-4">
                        <Badge
                          variant={report.type === 'kundali' ? 'premium' : 'default'}
                          className={cn(
                            'backdrop-blur-md border-0',
                            report.type === 'kundali'
                              ? 'bg-gold/20 text-gold'
                              : 'bg-blue-500/20 text-blue-200'
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
                          <h3 className="text-xl font-display font-semibold text-white group-hover:text-gold transition-colors">
                            {report.title}
                          </h3>
                          {report.status === 'failed' ? (
                            <Lock className="w-5 h-5 text-red-300" />
                          ) : (
                            <FileText className="w-5 h-5 text-aura-cyan" />
                          )}
                        </div>
                        <p className="text-sm text-white/50">
                          {report.status === 'ready' ? 'Generated' : 'Requested'} on {formattedDate}
                        </p>
                        {report.outdated && (
                          <p className="text-sm text-amber-100">
                            Birth details changed after this report. Keep it for records, but regenerate for current astrology.
                          </p>
                        )}
                        {report.status === 'failed' && (
                          <p className="text-sm text-red-200">
                            {report.failureReason || 'Report generation failed'}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {report.status === 'failed' ? (
                          <Button
                            onClick={() => handleGenerate(report.type)}
                            className="min-h-11 w-full bg-gradient-to-r from-gold/80 to-gold text-cosmic-navy font-semibold hover:brightness-110"
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
                                    className="min-h-11 w-full border-white/10 hover:bg-white/5 text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                                <a href={report.pdfUrl} download className="flex-1">
                                  <Button className="min-h-11 w-full bg-cosmic-purple/80 hover:bg-cosmic-purple text-white">
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                  </Button>
                                </a>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full border-white/10 hover:bg-white/5 text-white"
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
                    <RefreshCw className="w-8 h-8 text-gold animate-spin" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-gold" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white group-hover:text-gold">
                    Generate New Report
                  </h3>
                  <p className="text-sm text-white/50">Detailed Life & Destiny Analysis</p>
                </div>
              </button>
            </motion.div>
          </div>
        )}
    </DashboardPageShell>
  )
}
