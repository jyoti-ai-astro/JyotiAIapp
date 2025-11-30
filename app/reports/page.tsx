'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Download, Sparkles, Lock, RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { useUserStore } from '@/store/user-store'
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess'
import { decrementTicket } from '@/lib/access/ticket-access'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Report {
  reportId: string
  type: string
  title: string
  pdfUrl?: string
  generatedAt?: string
  createdAt: string
  status?: 'ready' | 'locked' | 'generating'
  image?: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

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
        const formattedReports = (result.reports || []).map((report: any) => ({
          ...report,
          status: report.pdfUrl ? 'ready' : 'locked',
          type: report.type === 'premium' ? 'Premium' : 'Standard',
        }))
        setReports(formattedReports)
      }
    } catch (error) {
      console.error('Load reports error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (type: 'kundali' | 'predictions' | 'timeline') => {
    setGenerating(true)

    try {
      // Check feature access
      if (!user) {
        router.push('/login')
        return
      }

      const featureMap: Record<string, 'kundali' | 'predictions'> = {
        kundali: 'kundali',
        predictions: 'predictions',
        timeline: 'predictions',
      }

      const feature = featureMap[type]
      const accessCheck = await checkFeatureAccess(user, feature)

      if (!accessCheck.allowed) {
        if (accessCheck.redirectTo) {
          router.push(accessCheck.redirectTo)
        }
        return
      }

      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          sendEmail: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate report')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Decrement ticket if needed
      if (accessCheck.decrementTicket) {
        await decrementTicket(user.uid, feature === 'kundali' ? 'kundali_basic' : 'ai_question')
      }

      loadReports()
    } catch (error: any) {
      console.error('Generate report error:', error)
      alert(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleUnlock = (report: Report) => {
    // Redirect to payment or show payment modal
    router.push('/pricing')
  }

  if (!user) {
    return null
  }

  // Mock data for empty state (remove in production if not needed)
  const displayReports = reports.length
    ? reports
    : loading
      ? []
      : [
          {
            id: '1',
            reportId: '1',
            title: 'Detailed Kundali Analysis',
            type: 'Premium',
            date: new Date().toISOString().split('T')[0],
            status: 'ready' as const,
            image: '/content/astro-1.png',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            reportId: '2',
            title: '2024 Career Forecast',
            type: 'Standard',
            date: new Date().toISOString().split('T')[0],
            status: 'ready' as const,
            image: '/content/astro-2.png',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            reportId: '3',
            title: 'Relationship Compatibility',
            type: 'Premium',
            date: new Date().toISOString().split('T')[0],
            status: 'locked' as const,
            image: '/content/astro-3.png',
            createdAt: new Date().toISOString(),
          },
        ]

  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      {/* Background Layer */}
      <CosmicBackground />

      <div className="relative z-10 container mx-auto px-6 py-24 space-y-12">
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
                Paid · ₹199
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
                Paid · ₹199
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
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading your cosmic reports...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayReports.map((report, index) => {
              const reportDate = report.generatedAt || report.createdAt || report.date
              const formattedDate = reportDate
                ? new Date(reportDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Unknown date'

              return (
                <motion.div
                  key={report.reportId || report.id}
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
                          variant={report.type === 'Premium' ? 'premium' : 'default'}
                          className={cn(
                            'backdrop-blur-md border-0',
                            report.type === 'Premium'
                              ? 'bg-gold/20 text-gold'
                              : 'bg-blue-500/20 text-blue-200'
                          )}
                        >
                          {report.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 relative z-10">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-display font-semibold text-white group-hover:text-gold transition-colors">
                            {report.title}
                          </h3>
                          {report.status === 'locked' ? (
                            <Lock className="w-5 h-5 text-white/40" />
                          ) : (
                            <FileText className="w-5 h-5 text-aura-cyan" />
                          )}
                        </div>
                        <p className="text-sm text-white/50">Generated on {formattedDate}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {report.status === 'locked' ? (
                          <Button
                            onClick={() => handleUnlock(report)}
                            className="w-full bg-gradient-to-r from-gold/80 to-gold text-cosmic-navy font-semibold hover:brightness-110"
                          >
                            Unlock Report
                          </Button>
                        ) : (
                          <>
                            {report.pdfUrl ? (
                              <>
                                <Link href={`/reports/${report.reportId}`} className="flex-1">
                                  <Button
                                    variant="outline"
                                    className="w-full border-white/10 hover:bg-white/5 text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                                <a href={report.pdfUrl} download className="flex-1">
                                  <Button className="w-full bg-cosmic-purple/80 hover:bg-cosmic-purple text-white">
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
                                Processing...
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
                onClick={() => handleGenerate('comprehensive')}
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

        {/* Empty State */}
        {!loading && reports.length === 0 && displayReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Sparkles className="w-16 h-16 text-gold/40 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-semibold text-white mb-2">
              No Reports Yet
            </h3>
            <p className="text-white/60 mb-6">
              Generate your first cosmic report to unlock insights into your destiny.
            </p>
            <Button
              onClick={() => handleGenerate('comprehensive')}
              disabled={generating}
              className="bg-gradient-to-r from-gold/80 to-gold text-cosmic-navy font-semibold hover:brightness-110"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate First Report
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
