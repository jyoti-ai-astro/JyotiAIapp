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
import { useTimeline } from '@/lib/hooks/useTimeline';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Calendar, Sparkles, ChevronRight, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { MonthDetailModal } from '@/components/timeline/MonthDetailModal';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import type { AstroContext } from '@/lib/engines/astro-types';
import type { TimelineEngineResult } from '@/lib/engines/timeline-engine-v2';
import React from 'react';

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { timeline, loading, error, refetch } = useTimeline();
  const [selectedMonth, setSelectedMonth] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [astro, setAstro] = React.useState<AstroContext | null>(null);
  
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
      fetchAstroContext();
    }
  }, [user, router]);

  const fetchAstroContext = async () => {
    if (!user?.uid) return;
    try {
      const response = await fetch('/api/astro/context', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAstro(data.astro);
      }
    } catch (err) {
      console.error('Error fetching astro context:', err);
    }
  };

  // Mega Build 2 - Generate 12-month timeline
  const handleGenerateTimeline = async () => {
    if (!user) return;

    // Check feature access
    const accessCheck = await checkFeatureAccess(user, 'predictions');
    if (!accessCheck.allowed) {
      if (accessCheck.redirectTo) {
        router.push(accessCheck.redirectTo);
      }
      return;
    }

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

      // Decrement ticket if needed
      if (accessCheck.decrementTicket) {
        await decrementTicket(user.uid, 'ai_question');
      }
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

    // Check feature access
    const accessCheck = await checkFeatureAccess(user, 'predictions');
    if (!accessCheck.allowed) {
      if (accessCheck.redirectTo) {
        router.push(accessCheck.redirectTo);
      }
      return;
    }

    setDownloadingReport(true);

    try {
      const response = await fetch('/api/report/generate', {
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
        throw new Error(errorData.message || 'Failed to generate report');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `12-Month-Timeline-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Decrement ticket if needed
      if (accessCheck.decrementTicket) {
        await decrementTicket(user.uid, 'ai_question');
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
    <PageTransitionWrapper>
      <CosmicBackground />
      <CosmicCursor />
      <SoundscapeController />
      <div className="relative z-10 min-h-screen p-4 md:p-8">
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

        {/* Astro Summary Block */}
        {astro && (
          <div className="glass-card p-6 mb-10 rounded-2xl border border-gold/20">
            <h3 className="text-gold font-heading text-xl mb-2">Astro Summary</h3>
            <p className="text-white/80 text-sm">Sun Sign: {astro.coreChart?.sunSign || 'N/A'}</p>
            <p className="text-white/80 text-sm">Moon Sign: {astro.coreChart?.moonSign || 'N/A'}</p>
            <p className="text-white/80 text-sm">Ascendant: {astro.coreChart?.ascendantSign || 'N/A'}</p>
            <p className="text-white/80 text-sm mt-4">Next Major Dasha: {astro.dasha?.currentMahadasha?.planet || 'N/A'}</p>
            
            {/* Super Phase B - Enhanced Dasha Timeline */}
            {astro.dashaTimeline && astro.dashaTimeline.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gold/20">
                <h4 className="text-gold font-heading text-lg mb-3">Upcoming Dasha Periods</h4>
                <div className="space-y-3">
                  {astro.dashaTimeline.slice(0, 3).map((period, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gold font-semibold">{period.planet} Period</span>
                        <span className="text-xs text-white/60">Strength: {period.strength}/10</span>
                      </div>
                      <p className="text-xs text-white/70">{new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}</p>
                      {period.notes && <p className="text-xs text-white/60 mt-1">{period.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Super Phase B - Transit Events */}
            {astro.transitEvents && astro.transitEvents.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gold/20">
                <h4 className="text-gold font-heading text-lg mb-3">Key Transit Events</h4>
                <div className="space-y-3">
                  {astro.transitEvents.slice(0, 3).map((event, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gold font-semibold">{event.planet} in House {event.house}</span>
                        <span className="text-xs text-white/60">Intensity: {event.intensity}/5</span>
                      </div>
                      <p className="text-xs text-white/70">{new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}</p>
                      <p className="text-xs text-white/60 mt-1">{event.theme}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

              {loading && timeline.length === 0 ? (
                <SkeletonCard />
              ) : timeline.length > 0 ? (
                <ErrorBoundary>
                  <div className="space-y-4">
                    {timeline.map((month, index) => {
                      const energyColors = {
                        high: 'bg-green-500/20 border-green-500/50',
                        medium: 'bg-yellow-500/20 border-yellow-500/50',
                        low: 'bg-red-500/20 border-red-500/50',
                      };

                      const getEventColor = (type: string, impact: string) => {
                        if (type === 'auspicious' || impact === 'positive') return 'bg-green-500/20 border-green-500/50';
                        if (type === 'challenging' || impact === 'challenging') return 'bg-red-500/20 border-red-500/50';
                        return 'bg-yellow-500/20 border-yellow-500/50';
                      };

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedMonth(month);
                              setIsModalOpen(true);
                            }}
                          >
                            <Card className={`bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white hover:border-gold/50 transition-all ${energyColors[month.overallEnergy]}`}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-gold flex items-center gap-2">
                                      <Calendar className="h-5 w-5" />
                                      {month.month} {month.year}
                                    </CardTitle>
                                    <CardDescription className="text-white/70 mt-2">
                                      <div className="flex items-center gap-4 flex-wrap">
                                        <span>Energy: <span className={`font-semibold ${
                                          month.overallEnergy === 'high' ? 'text-green-400' :
                                          month.overallEnergy === 'medium' ? 'text-yellow-400' :
                                          'text-red-400'
                                        }`}>{month.overallEnergy.toUpperCase()}</span></span>
                                        <span>Focus: {month.focusAreas?.join(', ') || 'N/A'}</span>
                                      </div>
                                    </CardDescription>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-gold" />
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <p className="text-white/80">{month.prediction}</p>
                                
                                {/* Color-coded timeline bars */}
                                {month.events && month.events.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-gold mb-2">Key Events ({month.events.length})</p>
                                    <div className="space-y-2">
                                      {month.events.slice(0, 3).map((event: any, i: number) => (
                                        <div
                                          key={i}
                                          className={`p-2 rounded-lg border ${getEventColor(event.type || 'transit', event.impact || 'neutral')}`}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              {event.planet && (
                                                <p className="text-xs text-white/60 mb-1">{event.planet}</p>
                                              )}
                                              <p className="text-sm text-white/80 font-medium">{event.event || 'N/A'}</p>
                                              <p className="text-xs text-white/70 mt-1 line-clamp-1">{event.description || ''}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                                              event.type === 'auspicious' || event.impact === 'positive' ? 'bg-green-500/30 text-green-300' :
                                              event.type === 'challenging' || event.impact === 'challenging' ? 'bg-red-500/30 text-red-300' :
                                              'bg-yellow-500/30 text-yellow-300'
                                            }`}>
                                              {event.type || 'transit'}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {month.events.length > 3 && (
                                        <p className="text-xs text-gold mt-2">+{month.events.length - 3} more events</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Auspicious/Challenging periods preview */}
                                {(month.auspiciousPeriods?.length > 0 || month.challengingPeriods?.length > 0) && (
                                  <div className="flex gap-2">
                                    {month.auspiciousPeriods && month.auspiciousPeriods.length > 0 && (
                                      <div className="flex-1 p-2 bg-green-500/10 border border-green-500/30 rounded">
                                        <p className="text-xs text-green-400 font-semibold mb-1">Auspicious</p>
                                        <p className="text-xs text-white/70">{month.auspiciousPeriods.length} period(s)</p>
                                      </div>
                                    )}
                                    {month.challengingPeriods && month.challengingPeriods.length > 0 && (
                                      <div className="flex-1 p-2 bg-red-500/10 border border-red-500/30 rounded">
                                        <p className="text-xs text-red-400 font-semibold mb-1">Challenging</p>
                                        <p className="text-xs text-white/70">{month.challengingPeriods.length} period(s)</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <p className="text-xs text-gold mt-2 flex items-center gap-1">
                                  Click for full details <ChevronRight className="h-3 w-3" />
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}

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

          {/* Ask Guru With Context Button */}
          {astro && (
            <div className="text-center mb-4">
              <Button
                onClick={() => router.push(`/guru?context=${encodeURIComponent(JSON.stringify(astro))}`)}
                className="gold-btn"
              >
                Ask Guru With My Birth Context
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="ghost" className="border border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <MonthDetailModal
        month={selectedMonth}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMonth(null);
        }}
      />
    </PageTransitionWrapper>
  );
}

