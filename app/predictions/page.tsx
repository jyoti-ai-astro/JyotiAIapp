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
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { PredictionDetailModal } from '@/components/predictions/PredictionDetailModal';

export default function PredictionsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { daily, weekly, monthly, loading, refetch } = usePredictions();
  const [selectedPrediction, setSelectedPrediction] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <PageTransitionWrapper>
      <CosmicBackground />
      <CosmicCursor />
      <SoundscapeController />
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="text-center">
            <Sparkles className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">Predictions</h1>
            <p className="text-white/70 mt-2">Your astrological predictions</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <Button
                onClick={() => refetch()}
                className="bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Predictions
              </Button>
            </motion.div>
          </div>

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

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="ghost" className="border border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <PredictionDetailModal
        prediction={selectedPrediction}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPrediction(null);
        }}
      />
    </PageTransitionWrapper>
  );
}

