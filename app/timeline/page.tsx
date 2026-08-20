/**
 * Timeline Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * 12-month timeline view
 */

'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingState } from '@/components/ui/feedback-state';
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
    setTimelineError(null);

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
      setTimelineError(err.message || 'Failed to generate timeline report. Please try again.');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardPageShell
      title="Your 12-Month Timeline"
      subtitle="A month-by-month view of themes, focus areas, and astrological signals"
    >
        {/* Context Panel */}
        <div className="mb-8">
          <OneTimeOfferBanner
            title="Unlock Full Insights"
            description="This module uses your birth chart & predictions powered by Guru Brain."
            priceLabel="₹299"
            ctaLabel="Unlock Now"
            ctaHref="/pay/299"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="text-center">
            <Calendar className="mx-auto h-14 w-14 text-[#F28C28] mb-4" />
            <h1 className="text-4xl font-display font-semibold text-[#07131F]">12-Month Timeline</h1>
            <p className="text-[#56666A] mt-2">Your astrological timeline for the next year</p>
            
            {/* Mega Build 2 - Generate Timeline Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 mb-6"
            >
              <Button
                onClick={handleGenerateTimeline}
                className="min-h-11 bg-[#F28C28] border border-[#F28C28] text-[#07131F] font-semibold hover:bg-[#E57E1D]"
                disabled={timelineLoading}
              >
                <Calendar className={`h-4 w-4 mr-2 ${timelineLoading ? 'animate-spin' : ''}`} />
                {timelineLoading ? 'Generating Timeline...' : 'Generate 12-Month Timeline'}
              </Button>
            </motion.div>
          </div>

          {/* Mega Build 2 - Timeline Error */}
          {timelineError && (
            <Card className="bg-[#C04A3A]/8 border border-[#C04A3A]/30 text-[#07131F] mb-6">
              <CardContent className="pt-6">
                <p className="text-[#A33D31]">{timelineError}</p>
                <Button
                  onClick={handleGenerateTimeline}
                  variant="ghost"
                  className="mt-4 text-[#A33D31] hover:text-[#7F2F27]"
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
              <Card className="bg-[#FFFDF4] border border-[#D8B56A]/35 text-[#07131F] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#8A5A16]">12-Month Timeline Overview</CardTitle>
                  {timelineResult.status === 'degraded' && (
                    <CardDescription className="text-[#A66B16]">
                      Timeline generated with limited context
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-[#34484C]">{timelineResult.overview}</p>
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
                    <Card className="bg-[#FFFDF4] border border-[#D8B56A]/35 text-[#07131F] shadow-sm hover:border-gold/50 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-[#8A5A16] flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              {event.monthLabel}
                            </CardTitle>
                            <CardDescription className="text-[#56666A] mt-2">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span>
                                  Intensity:{' '}
                                  <span
                                    className={`font-semibold ${
                                      event.intensity === 'high'
                                        ? 'text-[#2F7D7E]'
                                        : event.intensity === 'medium'
                                        ? 'text-[#A66B16]'
                                        : 'text-[#A33D31]'
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
                                ? 'bg-[#2F7D7E]/10 text-[#246566] border border-[#2F7D7E]/30'
                                : event.intensity === 'medium'
                                ? 'bg-yellow-500/20 text-[#A66B16] border border-yellow-500/50'
                                : 'bg-red-500/20 text-[#A33D31] border border-red-500/50'
                            }`}
                          >
                            {event.intensity}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-[#8A5A16] text-sm font-semibold mb-1">Theme</h4>
                          <p className="text-[#34484C]">{event.theme}</p>
                        </div>

                        <p className="text-[#34484C]">{event.description}</p>

                        {event.focusAreas.length > 0 && (
                          <div>
                            <h4 className="text-[#8A5A16] text-sm font-semibold mb-2">Focus Areas</h4>
                            <div className="flex flex-wrap gap-2">
                              {event.focusAreas.map((area, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-[#F5EAD0] rounded-full border border-[#D8B56A]/30 text-xs text-[#34484C]"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.recommendedActions.length > 0 && (
                          <div>
                            <h4 className="text-[#8A5A16] text-sm font-semibold mb-2">Recommended Actions</h4>
                            <ul className="space-y-1">
                              {event.recommendedActions.map((action, i) => (
                                <li key={i} className="text-sm text-[#56666A] flex items-start gap-2">
                                  <span className="text-[#8A5A16] mt-1">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.cautions.length > 0 && (
                          <div>
                            <h4 className="text-[#A66B16] text-sm font-semibold mb-2">Cautions</h4>
                            <ul className="space-y-1">
                              {event.cautions.map((caution, i) => (
                                <li key={i} className="text-sm text-[#56666A] flex items-start gap-2">
                                  <span className="text-[#A66B16] mt-1">•</span>
                                  <span>{caution}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.astroSignals.length > 0 && (
                          <div>
                            <h4 className="text-[#8A5A16] text-sm font-semibold mb-2">Astrological Signals</h4>
                            <div className="flex flex-wrap gap-2">
                              {event.astroSignals.map((signal, i) => (
                                <div
                                  key={i}
                                  className="px-3 py-2 bg-[#F5EAD0]/60 rounded-lg border border-[#D8B56A]/30"
                                >
                                  <p className="text-xs font-semibold text-[#8A5A16]">{signal.label}</p>
                                  <p className="text-xs text-[#56666A] mt-1">{signal.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA to Ask Guru */}
                        <div className="pt-3 border-t border-[#D8B56A]/25">
                          <Button
                            onClick={() => router.push(`/guru?month=${event.monthLabel}`)}
                            variant="ghost"
                            className="text-[#8A5A16] hover:text-[#8A5A16]/80 border border-gold/30 hover:bg-gold/10"
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
                <div className="text-xs text-[#6B777A] space-y-1">
                  {timelineResult.disclaimers.map((disclaimer, i) => (
                    <p key={i}>{disclaimer}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {(loadingPersistedTimeline || timelineLoading) && !timelineResult ? (
            <Card>
              <CardContent>
                <LoadingState
                  title={timelineLoading ? 'Generating timeline' : 'Loading timeline'}
                  description="We are checking your saved timeline state."
                />
              </CardContent>
            </Card>
          ) : !timelineResult ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="No timeline yet"
                  description="Generate a timeline after completing your verified birth profile and Kundali."
                  action={
                    <Button onClick={handleGenerateTimeline} disabled={timelineLoading} className="min-h-11">
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Timeline
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Mega Build 3 - Download Report Section */}
          <Card className="bg-[#FFFDF4] border border-[#D8B56A]/35 text-[#07131F] shadow-sm mt-8">
            <CardHeader>
              <CardTitle className="text-[#8A5A16]">Download Full PDF Report</CardTitle>
              <CardDescription className="text-[#56666A]">
                Get a comprehensive 12-month timeline report as a PDF document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="min-h-11 w-full bg-[#F28C28] border border-[#F28C28] text-[#07131F] font-semibold hover:bg-[#E57E1D]"
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
              <Button variant="ghost" className="min-h-11 border border-[#D8B56A]/45 text-[#07131F] hover:bg-[#F5EAD0]">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

    </DashboardPageShell>
  );
}
