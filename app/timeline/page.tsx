/**
 * Timeline Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * 12-month timeline view
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import type { TimelineEngineResult } from '@/lib/engines/timeline-engine-v2';
import React from 'react';

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loadingPersistedTimeline, setLoadingPersistedTimeline] = React.useState(false);
  
  // Mega Build 2 - 12-month timeline state
  const [timelineResult, setTimelineResult] = React.useState<TimelineEngineResult | null>(null);
  const [timelineLoading, setTimelineLoading] = React.useState(false);
  const [timelineError, setTimelineError] = React.useState<string | null>(null);
  
  // Mega Build 3 - Download report state
  const [downloadingReport, setDownloadingReport] = React.useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchPersistedTimeline();
    }
  }, [user, router]);

  const fetchPersistedTimeline = async () => {
    try {
      setLoadingPersistedTimeline(true);
      const response = await fetch('/api/timeline', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setTimelineResult(data.data);
        }
        return;
      }

      if (response.status !== 404) {
        const data = await response.json().catch(() => ({}));
        if (data.code === 'TIMELINE_STALE' || data.code === 'KUNDALI_REQUIRED' || data.code === 'ASTRO_CONTEXT_MISSING') {
          setTimelineError(data.message || 'Regenerate Kundali before creating a new timeline.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching persisted timeline:', err);
    } finally {
      setLoadingPersistedTimeline(false);
    }
  };

  // Mega Build 2 - Generate 12-month timeline
  const handleGenerateTimeline = async () => {
    if (!user) return;

    setTimelineLoading(true);
    setTimelineError(null);

    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ months: 12 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate timeline');
      }

      const data = await response.json();
      setTimelineResult(data.data);
    } catch (err: any) {
      console.error('Error generating timeline:', err);
      setTimelineError(err.message || 'Failed to generate timeline. Please try again.');
    } finally {
      setTimelineLoading(false);
    }
  };

  // Mega Build 3 - Download PDF Report
  const handleDownloadReport = async () => {
    if (!user) return;

    setDownloadingReport(true);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'timeline',
          sendEmail: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to generate report');
      }

      const result = await response.json();
      if (result.report?.pdfUrl) {
        window.location.href = result.report.pdfUrl;
      } else if (result.report?.reportId) {
        router.push(`/reports/${result.report.reportId}`);
      }
    } catch (err: any) {
      console.error('Error downloading report:', err);
      alert(err.message || 'Failed to download report. Please try again.');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardPageShell
      title="Timeline of Your Life Events"
      subtitle="12-month astrological timeline with themes, intensity, and focus areas"
    >
        {/* Context Panel */}
        <div className="mb-8">
          <OneTimeOfferBanner
            title="Unlock Full Insights"
            description="This module uses your birth chart & predictions powered by Guru Brain."
            priceLabel="₹199"
            ctaLabel="Unlock Now"
            ctaHref="/pay/199"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="text-center">
            <Calendar className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">12-Month Timeline</h1>
            <p className="text-white/70 mt-2">Your astrological timeline for the next year</p>
            
            {/* Mega Build 2 - Generate Timeline Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 mb-6"
            >
              <Button
                onClick={handleGenerateTimeline}
                className="bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
                disabled={timelineLoading}
              >
                <Calendar className={`h-4 w-4 mr-2 ${timelineLoading ? 'animate-spin' : ''}`} />
                {timelineLoading ? 'Generating Timeline...' : 'Generate 12-Month Timeline'}
              </Button>
            </motion.div>
          </div>

          {/* Mega Build 2 - Timeline Error */}
          {timelineError && (
            <Card className="bg-red-500/10 border border-red-500/30 text-white mb-6">
              <CardContent className="pt-6">
                <p className="text-red-400">{timelineError}</p>
                <Button
                  onClick={handleGenerateTimeline}
                  variant="ghost"
                  className="mt-4 text-red-400 hover:text-red-300"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mega Build 2 - Timeline Results */}
          {timelineResult && (
            <div className="mb-8 space-y-6">
              {/* Overview */}
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
                <CardHeader>
                  <CardTitle className="text-gold">12-Month Timeline Overview</CardTitle>
                  {timelineResult.status === 'degraded' && (
                    <CardDescription className="text-yellow-400">
                      Timeline generated with limited context
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">{timelineResult.overview}</p>
                </CardContent>
              </Card>

              {/* Timeline Events */}
              <div className="space-y-4">
                {timelineResult.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white hover:border-gold/50 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-gold flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              {event.monthLabel}
                            </CardTitle>
                            <CardDescription className="text-white/70 mt-2">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span>
                                  Intensity:{' '}
                                  <span
                                    className={`font-semibold ${
                                      event.intensity === 'high'
                                        ? 'text-green-400'
                                        : event.intensity === 'medium'
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                    }`}
                                  >
                                    {event.intensity.toUpperCase()}
                                  </span>
                                </span>
                                {event.focusAreas.length > 0 && (
                                  <span>Focus: {event.focusAreas.join(', ')}</span>
                                )}
                              </div>
                            </CardDescription>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              event.intensity === 'high'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : event.intensity === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                            }`}
                          >
                            {event.intensity}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-gold text-sm font-semibold mb-1">Theme</h4>
                          <p className="text-white/80">{event.theme}</p>
                        </div>

                        <p className="text-white/80">{event.description}</p>

                        {event.focusAreas.length > 0 && (
                          <div>
                            <h4 className="text-gold text-sm font-semibold mb-2">Focus Areas</h4>
                            <div className="flex flex-wrap gap-2">
                              {event.focusAreas.map((area, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-white/5 rounded text-xs text-white/80"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.recommendedActions.length > 0 && (
                          <div>
                            <h4 className="text-gold text-sm font-semibold mb-2">Recommended Actions</h4>
                            <ul className="space-y-1">
                              {event.recommendedActions.map((action, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                  <span className="text-gold mt-1">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.cautions.length > 0 && (
                          <div>
                            <h4 className="text-yellow-400 text-sm font-semibold mb-2">Cautions</h4>
                            <ul className="space-y-1">
                              {event.cautions.map((caution, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                  <span className="text-yellow-400 mt-1">•</span>
                                  <span>{caution}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.astroSignals.length > 0 && (
                          <div>
                            <h4 className="text-gold text-sm font-semibold mb-2">Astrological Signals</h4>
                            <div className="flex flex-wrap gap-2">
                              {event.astroSignals.map((signal, i) => (
                                <div
                                  key={i}
                                  className="px-3 py-2 bg-white/5 rounded-lg border border-white/10"
                                >
                                  <p className="text-xs font-semibold text-gold">{signal.label}</p>
                                  <p className="text-xs text-white/70 mt-1">{signal.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA to Ask Guru */}
                        <div className="pt-2 border-t border-white/10">
                          <Button
                            onClick={() => router.push(`/guru?month=${event.monthLabel}`)}
                            variant="ghost"
                            className="text-gold hover:text-gold/80 border border-gold/30 hover:bg-gold/10"
                            size="sm"
                          >
                            Ask Guru about this month →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Disclaimers */}
              {timelineResult.disclaimers.length > 0 && (
                <div className="text-xs text-white/50 space-y-1">
                  {timelineResult.disclaimers.map((disclaimer, i) => (
                    <p key={i}>{disclaimer}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {(loadingPersistedTimeline || timelineLoading) && !timelineResult ? (
            <SkeletonCard />
          ) : !timelineResult ? (
            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <Calendar className="w-16 h-16 text-[#FFD57A]/40 mx-auto" />
                <h3 className="text-2xl font-display font-semibold text-white">No Timeline Yet</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Generate a timeline after completing your birth profile and Kundali.
                </p>
                <Button
                  onClick={handleGenerateTimeline}
                  disabled={timelineLoading}
                  className="mt-4 bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#05050A]"
                >
                  {timelineLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Timeline
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Mega Build 3 - Download Report Section */}
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white mt-8">
            <CardHeader>
              <CardTitle className="text-gold">Download Full PDF Report</CardTitle>
              <CardDescription className="text-white/70">
                Get a comprehensive 12-month timeline report as a PDF document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="w-full bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
              >
                {downloadingReport ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download 12-Month Timeline PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="ghost" className="border border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

    </DashboardPageShell>
  );
}
