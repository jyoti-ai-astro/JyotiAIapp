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
import { ProductPageFrame } from '@/components/product';
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
    return (
      <DashboardPageShell
        title="Your 12-Month Timeline"
        subtitle="Restoring your JyotiAI session."
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <LoadingState
            title="Opening Your 12-Month Timeline"
            description="Restoring your JyotiAI session."
          />
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <ProductPageFrame product="timeline">
      <DashboardPageShell
        title="Your 12-Month Timeline"
        subtitle="A month-by-month view of themes, focus areas, and astrological signals"
      >
        <div className="mx-auto w-full max-w-[1320px] space-y-7">
          <div className="rounded-2xl border border-[#dca94e]/16 bg-[#0b1519] px-5 py-4">
            <p className="text-sm font-medium text-[#f5eee2]">
              Timeline access is checked when you generate.
            </p>
            <p className="mt-1 text-sm leading-6 text-[#9f9b94]">
              An active subscription or eligible prediction access can unlock this feature. If more access is required, JyotiAI will show the correct purchase option without spending a credit first.
            </p>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[28px] border border-[#dfa84d]/20 bg-[#091216] p-6 md:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border border-[#dfa84d]/10"
            />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#dfa84d]">
                  <Calendar className="h-4 w-4" />
                  Personal timing map
                </div>

                <h2 className="mt-4 font-heading text-3xl font-semibold text-[#f8f1e6] md:text-5xl">
                  Twelve months. One connected timeline.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aaa69e] md:text-base">
                  Track monthly themes, intensity, focus areas, cautions,
                  astrological signals, and recommended actions from your
                  current Kundali context.
                </p>
              </div>

              <Button
                onClick={handleGenerateTimeline}
                disabled={timelineLoading}
                className="min-h-12 border-[#e8aa4f] bg-[#e99a34] px-6 font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
              >
                <Calendar
                  className={`mr-2 h-4 w-4 ${
                    timelineLoading ? 'animate-spin' : ''
                  }`}
                />
                {timelineLoading
                  ? 'Generating Timeline...'
                  : 'Generate 12-Month Timeline'}
              </Button>
            </div>
          </motion.section>

          {timelineError && (
            <Card className="border-[#b85c4e]/35 bg-[#351716]/35 text-[#f5eee2]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#f0a79c]">{timelineError}</p>
                <Button
                  onClick={handleGenerateTimeline}
                  variant="outline"
                  className="mt-4 border-[#b85c4e]/30 bg-transparent text-[#f4ddd8] hover:bg-[#b85c4e]/10"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {(loadingPersistedTimeline || timelineLoading) && !timelineResult ? (
            <Card className="border-[#dca94e]/16 bg-[#091216]">
              <CardContent>
                <LoadingState
                  title={timelineLoading ? 'Generating timeline' : 'Loading timeline'}
                  description="We are checking your saved timeline state."
                  className="text-[#f5eee2]"
                />
              </CardContent>
            </Card>
          ) : !timelineResult ? (
            <Card className="border-[#dca94e]/16 bg-[#091216]">
              <CardContent>
                <EmptyState
                  title="No timeline yet"
                  description="Generate a timeline after completing your verified birth profile and Kundali."
                  className="text-[#f5eee2]"
                  action={
                    <Button
                      onClick={handleGenerateTimeline}
                      disabled={timelineLoading}
                      className="min-h-11 border-[#e8aa4f] bg-[#e99a34] text-[#160d04] hover:bg-[#f1aa4d]"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Generate Timeline
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : null}

          {timelineResult && (
            <div className="space-y-6">
              <Card className="border-[#dca94e]/20 bg-[#091216] text-[#f5eee2]">
                <CardHeader>
                  <CardTitle className="text-[#f5eee2]">
                    12-Month Timeline Overview
                  </CardTitle>
                  {timelineResult.status === 'degraded' && (
                    <CardDescription className="text-[#d5b47b]">
                      Limited chart-based mode — live interpretation was unavailable or could not be validated.
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-[#aaa69e]">
                    {timelineResult.overview}
                  </p>
                </CardContent>
              </Card>

              <div className="relative space-y-5 before:absolute before:bottom-0 before:left-[19px] before:top-0 before:w-px before:bg-[#dfa84d]/12 md:before:left-[23px]">
                {timelineResult.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="relative pl-12 md:pl-14"
                  >
                    <span className="absolute left-[13px] top-8 h-3.5 w-3.5 rounded-full border border-[#dfa84d]/60 bg-[#091216] shadow-[0_0_18px_rgba(223,168,77,0.18)] md:left-[17px]" />

                    <Card className="border-[#dca94e]/16 bg-[#0a1418] text-[#f5eee2] hover:border-[#dca94e]/28">
                      <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-[#f5eee2]">
                              <Calendar className="h-5 w-5 text-[#dfa84d]" />
                              {event.monthLabel}
                            </CardTitle>

                            <CardDescription className="mt-2 text-[#9f9b94]">
                              {event.focusAreas.length > 0
                                ? `Focus: ${event.focusAreas.join(', ')}`
                                : 'Monthly astrological guidance'}
                            </CardDescription>
                          </div>

                          <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                              event.intensity === 'high'
                                ? 'border-[#66a5a5]/30 bg-[#66a5a5]/10 text-[#86c5c6]'
                                : event.intensity === 'medium'
                                  ? 'border-[#dfa84d]/30 bg-[#dfa84d]/10 text-[#e3b66a]'
                                  : 'border-[#b85c4e]/30 bg-[#b85c4e]/10 text-[#e7a097]'
                            }`}
                          >
                            {event.intensity}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dfa84d]">
                            Theme
                          </p>
                          <p className="mt-2 text-base text-[#eee5d9]">
                            {event.theme}
                          </p>
                        </div>

                        <p className="text-sm leading-7 text-[#aaa69e]">
                          {event.description}
                        </p>

                        {event.focusAreas.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f5eee2]">
                              Focus areas
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {event.focusAreas.map((area, i) => (
                                <span
                                  key={i}
                                  className="rounded-full border border-[#dca94e]/18 bg-[#dca94e]/[0.055] px-3 py-1.5 text-xs text-[#d8d1c6]"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid gap-4 lg:grid-cols-2">
                          {event.recommendedActions.length > 0 && (
                            <div className="rounded-xl border border-[#66a5a5]/14 bg-[#66a5a5]/[0.04] p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#82bfc0]">
                                Recommended actions
                              </p>
                              <ul className="mt-3 space-y-2">
                                {event.recommendedActions.map((action, i) => (
                                  <li
                                    key={i}
                                    className="flex gap-2 text-sm leading-6 text-[#aaa69e]"
                                  >
                                    <span className="text-[#66a5a5]">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {event.cautions.length > 0 && (
                            <div className="rounded-xl border border-[#dfa84d]/14 bg-[#dfa84d]/[0.035] p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dfa84d]">
                                Cautions
                              </p>
                              <ul className="mt-3 space-y-2">
                                {event.cautions.map((caution, i) => (
                                  <li
                                    key={i}
                                    className="flex gap-2 text-sm leading-6 text-[#aaa69e]"
                                  >
                                    <span className="text-[#dfa84d]">•</span>
                                    <span>{caution}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {event.astroSignals.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f5eee2]">
                              Astrological signals
                            </p>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {event.astroSignals.map((signal, i) => (
                                <div
                                  key={i}
                                  className="rounded-xl border border-[#dca94e]/14 bg-[#071014] p-4"
                                >
                                  <p className="text-sm font-semibold text-[#e3b66a]">
                                    {signal.label}
                                  </p>
                                  <p className="mt-2 text-xs leading-5 text-[#99958e]">
                                    {signal.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-[#dca94e]/10 pt-4">
                          <Button
                            onClick={() =>
                              router.push(`/guru?month=${event.monthLabel}`)
                            }
                            variant="outline"
                            size="sm"
                            className="border-[#dca94e]/20 bg-[#10191d] text-[#f2e9dc] hover:bg-[#162126]"
                          >
                            Ask Guru about this month →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {timelineResult.disclaimers.length > 0 && (
                <div className="space-y-1 px-2 text-xs leading-5 text-[#77756f]">
                  {timelineResult.disclaimers.map((disclaimer, i) => (
                    <p key={i}>{disclaimer}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <Card className="border-[#dca94e]/18 bg-[#091216] text-[#f5eee2]">
            <CardHeader>
              <CardTitle className="text-[#f5eee2]">
                Save your complete timeline
              </CardTitle>
              <CardDescription className="text-[#9f9b94]">
                Generate the comprehensive 12-month timeline as a PDF document.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="min-h-11 border-[#e8aa4f] bg-[#e99a34] font-semibold text-[#160d04] hover:bg-[#f1aa4d]"
              >
                {downloadingReport ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Timeline PDF
                  </>
                )}
              </Button>

              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="min-h-11 border-[#dca94e]/20 bg-[#10191d] text-[#f2e9dc] hover:bg-[#162126]"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardPageShell>
    </ProductPageFrame>
  )
}
