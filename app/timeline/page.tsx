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
import { Calendar, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { MonthDetailModal } from '@/components/timeline/MonthDetailModal';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import type { AstroContext } from '@/lib/engines/astro-types';
import React from 'react';

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { timeline, loading, error, refetch } = useTimeline();
  const [selectedMonth, setSelectedMonth] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [astro, setAstro] = React.useState<AstroContext | null>(null);

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
          </div>

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

