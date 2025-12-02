/**
 * Predictions Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * Daily, weekly, monthly predictions
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { usePredictions } from '@/lib/hooks/usePredictions';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Sparkles, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';
import { PredictionDetailModal } from '@/components/predictions/PredictionDetailModal';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import type { AstroContext } from '@/lib/engines/astro-types';
import type { PredictionEngineResult } from '@/lib/engines/prediction-engine-v2';

export default function PredictionsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { daily, weekly, monthly, loading, refetch } = usePredictions();
  const [selectedPrediction, setSelectedPrediction] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [astro, setAstro] = React.useState<AstroContext | null>(null);
  
  // Mega Build 2 - 12-month predictions state
  const [predictionResult, setPredictionResult] = React.useState<PredictionEngineResult | null>(null);
  const [predictionLoading, setPredictionLoading] = React.useState(false);
  const [predictionError, setPredictionError] = React.useState<string | null>(null);
  
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

  // Mega Build 2 - Generate 12-month predictions
  const handleGeneratePredictions = async () => {
    if (!user) return;

    // Check feature access
    const accessCheck = await checkFeatureAccess(user, 'predictions');
    if (!accessCheck.allowed) {
      if (accessCheck.redirectTo) {
        router.push(accessCheck.redirectTo);
      }
      return;
    }

    setPredictionLoading(true);
    setPredictionError(null);

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate predictions');
      }

      const data = await response.json();
      setPredictionResult(data.data);

      // Decrement ticket if needed
      if (accessCheck.decrementTicket) {
        await decrementTicket(user.uid, 'ai_question');
      }
    } catch (err: any) {
      console.error('Error generating predictions:', err);
      setPredictionError(err.message || 'Failed to generate predictions. Please try again.');
    } finally {
      setPredictionLoading(false);
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
          type: 'predictions',
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
      a.download = `12-Month-Predictions-${new Date().toISOString().split('T')[0]}.pdf`;
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
    <DashboardPageShell
      title="Your Predictions"
      subtitle="Daily, weekly, monthly, and 12-month astrological predictions"
    >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
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

          <div className="text-center">
            <Sparkles className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">Predictions</h1>
            <p className="text-white/70 mt-2">Your astrological predictions</p>
            
            {/* Mega Build 2 - 12-Month Predictions Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 mb-6"
            >
              <Button
                onClick={handleGeneratePredictions}
                className="bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
                disabled={predictionLoading}
              >
                <Sparkles className={`h-4 w-4 mr-2 ${predictionLoading ? 'animate-spin' : ''}`} />
                {predictionLoading ? 'Generating Predictions...' : 'Generate 12-Month Predictions'}
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2"
            >
              <Button
                onClick={() => refetch()}
                variant="ghost"
                className="border border-gold/30 text-gold/80 hover:bg-gold/10"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Daily/Weekly/Monthly
              </Button>
            </motion.div>
          </div>

          {/* Mega Build 2 - 12-Month Predictions Results */}
          {predictionError && (
            <Card className="bg-red-500/10 border border-red-500/30 text-white mb-6">
              <CardContent className="pt-6">
                <p className="text-red-400">{predictionError}</p>
                <Button
                  onClick={handleGeneratePredictions}
                  variant="ghost"
                  className="mt-4 text-red-400 hover:text-red-300"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {predictionResult && (
            <div className="mb-8 space-y-6">
              {/* Overview */}
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
                <CardHeader>
                  <CardTitle className="text-gold">12-Month Predictions Overview</CardTitle>
                  {predictionResult.status === 'degraded' && (
                    <CardDescription className="text-yellow-400">
                      Predictions generated with limited context
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">{predictionResult.overview}</p>
                </CardContent>
              </Card>

              {/* Sections */}
              {predictionResult.sections.map((section) => (
                <Card
                  key={section.id}
                  className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gold capitalize">{section.title}</CardTitle>
                      {section.score && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold border border-gold/50">
                          Intensity: {section.score}/10
                        </span>
                      )}
                    </div>
                    {section.timeframe && (
                      <CardDescription className="text-white/60">{section.timeframe}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/80">{section.summary}</p>

                    {section.opportunities.length > 0 && (
                      <div>
                        <h4 className="text-gold text-sm font-semibold mb-2">Opportunities</h4>
                        <ul className="space-y-1">
                          {section.opportunities.map((opp, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.cautions.length > 0 && (
                      <div>
                        <h4 className="text-yellow-400 text-sm font-semibold mb-2">Cautions</h4>
                        <ul className="space-y-1">
                          {section.cautions.map((caution, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>{caution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.recommendedActions.length > 0 && (
                      <div>
                        <h4 className="text-gold text-sm font-semibold mb-2">Recommended Actions</h4>
                        <ul className="space-y-1">
                          {section.recommendedActions.map((action, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-gold mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Astro Signals */}
              {predictionResult.astroSignals.length > 0 && (
                <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
                  <CardHeader>
                    <CardTitle className="text-gold">Astrological Signals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {predictionResult.astroSignals.map((signal, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 rounded-lg"
                        >
                          <p className="text-sm font-semibold text-gold">{signal.label}</p>
                          <p className="text-xs text-white/70 mt-1">{signal.description}</p>
                          {signal.strength && (
                            <span className="text-xs text-white/60 mt-1 block">
                              Strength: {signal.strength}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimers */}
              {predictionResult.disclaimers.length > 0 && (
                <div className="text-xs text-white/50 space-y-1">
                  {predictionResult.disclaimers.map((disclaimer, i) => (
                    <p key={i}>{disclaimer}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="daily" className="text-white data-[state=active]:bg-gold data-[state=active]:text-cosmic-navy">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-gold data-[state=active]:text-cosmic-navy">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-white data-[state=active]:bg-gold data-[state=active]:text-cosmic-navy">
                Monthly
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              {loading && !daily ? (
                <SkeletonCard />
              ) : !loading && !daily ? (
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
                  <CardContent className="pt-12 pb-12 text-center space-y-4">
                    <Sparkles className="w-16 h-16 text-[#FFD57A]/40 mx-auto" />
                    <h3 className="text-2xl font-display font-semibold text-white">No Daily Predictions Yet</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      Your daily cosmic insights will appear here once generated. Click "Refresh Daily/Weekly/Monthly" to load them.
                    </p>
                  </CardContent>
                </Card>
              ) : daily ? (
                <ErrorBoundary>
                  <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
                    <CardHeader>
                      <CardTitle>Daily Prediction</CardTitle>
                      <CardDescription>{daily.rashi} • {new Date(daily.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <p className="text-white/80">{daily.overall}</p>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          daily.overallIntensity === 'high' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                          daily.overallIntensity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                          'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                          {daily.overallIntensity.toUpperCase()}
                        </div>
                      </div>
                      {daily.keyHighlights && daily.keyHighlights.length > 0 && (
                        <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg">
                          <p className="text-xs text-gold font-semibold mb-2">Key Highlights</p>
                          <ul className="space-y-1">
                            {daily.keyHighlights.map((highlight, i) => (
                              <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                <span className="text-gold mt-1">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="space-y-2">
                        {daily.predictions.map((pred, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/5 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gold/50 transition-all"
                            onClick={() => {
                              setSelectedPrediction(pred);
                              setIsModalOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-semibold text-gold capitalize">{pred.category}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  pred.intensity === 'high' ? 'bg-green-500/20 text-green-400' :
                                  pred.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {pred.intensity}
                                </span>
                                <span className="text-xs text-white/60">Score: {pred.score}/100</span>
                              </div>
                            </div>
                            <p className="text-sm text-white/80 mb-2">{pred.prediction}</p>
                            {pred.tags && pred.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pred.tags.slice(0, 2).map((tag, j) => (
                                  <span
                                    key={j}
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      tag.type === 'blessing' ? 'bg-green-500/20 text-green-400' :
                                      tag.type === 'obstacle' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gold mt-2 hover:underline">Click for details →</p>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-sm text-white/70">{daily.summary}</p>
                    </CardContent>
                  </Card>
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}
            </TabsContent>

            <TabsContent value="weekly">
              {loading && !weekly ? (
                <SkeletonCard />
              ) : !loading && !weekly ? (
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
                  <CardContent className="pt-12 pb-12 text-center space-y-4">
                    <Sparkles className="w-16 h-16 text-[#FFD57A]/40 mx-auto" />
                    <h3 className="text-2xl font-display font-semibold text-white">No Weekly Predictions Yet</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      Your weekly cosmic insights will appear here once generated. Click "Refresh Daily/Weekly/Monthly" to load them.
                    </p>
                  </CardContent>
                </Card>
              ) : weekly ? (
                <ErrorBoundary>
                  <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
                    <CardHeader>
                      <CardTitle>Weekly Prediction</CardTitle>
                      <CardDescription>{weekly.theme}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-white/60 mb-1">Theme Intensity</p>
                        <p className={`text-lg font-bold ${
                          weekly.themeIntensity === 'high' ? 'text-green-400' :
                          weekly.themeIntensity === 'medium' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {weekly.themeIntensity.toUpperCase()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {weekly.predictions.map((pred, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/5 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gold/50 transition-all"
                            onClick={() => {
                              setSelectedPrediction(pred);
                              setIsModalOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-semibold text-gold capitalize">{pred.category}</p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                pred.intensity === 'high' ? 'bg-green-500/20 text-green-400' :
                                pred.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {pred.intensity}
                              </span>
                            </div>
                            <p className="text-sm text-white/80 mb-2">{pred.prediction}</p>
                            <p className="text-xs text-white/60 mt-1">{pred.advice}</p>
                            {pred.tags && pred.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pred.tags.slice(0, 2).map((tag, j) => (
                                  <span
                                    key={j}
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      tag.type === 'blessing' ? 'bg-green-500/20 text-green-400' :
                                      tag.type === 'obstacle' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gold mt-2 hover:underline">Click for details →</p>
                          </motion.div>
                        ))}
                      </div>
                      {weekly.keyEvents && weekly.keyEvents.length > 0 && (
                        <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                          <p className="text-xs text-gold font-semibold mb-2">Key Events</p>
                          <ul className="space-y-1">
                            {weekly.keyEvents.map((event, i) => (
                              <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                <span className="text-gold mt-1">•</span>
                                <span>{event}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {weekly.focusAreas && weekly.focusAreas.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-white/60 mb-1">Focus Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {weekly.focusAreas.map((area, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/80">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}
            </TabsContent>

            <TabsContent value="monthly">
              {loading && !monthly ? (
                <SkeletonCard />
              ) : !loading && !monthly ? (
                <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
                  <CardContent className="pt-12 pb-12 text-center space-y-4">
                    <Sparkles className="w-16 h-16 text-[#FFD57A]/40 mx-auto" />
                    <h3 className="text-2xl font-display font-semibold text-white">No Monthly Predictions Yet</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      Your monthly cosmic insights will appear here once generated. Click "Refresh Daily/Weekly/Monthly" to load them.
                    </p>
                  </CardContent>
                </Card>
              ) : monthly ? (
                <ErrorBoundary>
                  <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
                    <CardHeader>
                      <CardTitle>Monthly Prediction</CardTitle>
                      <CardDescription>{monthly.month} {monthly.year} • {monthly.theme}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-white/60 mb-1">Theme Intensity</p>
                        <p className={`text-lg font-bold ${
                          monthly.themeIntensity === 'high' ? 'text-green-400' :
                          monthly.themeIntensity === 'medium' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {monthly.themeIntensity.toUpperCase()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {monthly.predictions.map((pred, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/5 p-3 rounded-lg cursor-pointer border border-transparent hover:border-gold/50 transition-all"
                            onClick={() => {
                              setSelectedPrediction(pred);
                              setIsModalOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-semibold text-gold capitalize">{pred.category}</p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                pred.intensity === 'high' ? 'bg-green-500/20 text-green-400' :
                                pred.intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {pred.intensity}
                              </span>
                            </div>
                            <p className="text-sm text-white/80 mb-2">{pred.prediction}</p>
                            <p className="text-xs text-white/60 mt-1">{pred.advice}</p>
                            {pred.tags && pred.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pred.tags.slice(0, 2).map((tag, j) => (
                                  <span
                                    key={j}
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      tag.type === 'blessing' ? 'bg-green-500/20 text-green-400' :
                                      tag.type === 'obstacle' ? 'bg-red-500/20 text-red-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gold mt-2 hover:underline">Click for details →</p>
                          </motion.div>
                        ))}
                      </div>
                      {monthly.focusAreas && monthly.focusAreas.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-white/60 mb-2">Focus Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {monthly.focusAreas.map((area, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/80">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {monthly.majorTransits && monthly.majorTransits.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-xs text-blue-400 font-semibold mb-2">Major Transits</p>
                          <ul className="space-y-1">
                            {monthly.majorTransits.map((transit, i) => (
                              <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{transit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}
            </TabsContent>
          </Tabs>

          {/* Mega Build 3 - Download Report Section */}
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white mt-8">
            <CardHeader>
              <CardTitle className="text-gold">Download Full PDF Report</CardTitle>
              <CardDescription className="text-white/70">
                Get a comprehensive 12-month predictions report as a PDF document
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
                    Download 12-Month Predictions PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            {astro && (
              <Button
                onClick={() => router.push(`/guru?context=${encodeURIComponent(JSON.stringify(astro))}`)}
                className="gold-btn"
              >
                Ask Guru With My Birth Context
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="ghost" className="border border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <PredictionDetailModal
          prediction={selectedPrediction}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPrediction(null);
          }}
        />
    </DashboardPageShell>
  );
}

