/**
 * Pregnancy Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * Pregnancy insights and predictions
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { usePregnancy } from '@/lib/hooks/usePregnancy';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import { Baby, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { useTicketAccess } from '@/lib/access/useTicketAccess';
import { getFeatureAccess } from '@/lib/payments/feature-access';

export default function PregnancyPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const featureKey = 'pregnancy' as const;
  const { hasAccess, hasSubscription, tickets, loading: ticketLoading, config } = useTicketAccess(featureKey);
  const featureConfig = getFeatureAccess(featureKey);
  const { insights, loading, error, refetch } = usePregnancy();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // Phase R: Check ticket access
  if (ticketLoading) {
    return (
      <DashboardPageShell title={featureConfig.label} subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </DashboardPageShell>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardPageShell title={featureConfig.label} subtitle="Unlock pregnancy insights">
        <OneTimeOfferBanner feature={featureConfig.label} productId={featureConfig.defaultProductId} />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Pregnancy Insights"
      subtitle="Astrological guidance for pregnancy and conception"
    >

          {loading && !insights ? (
            <SkeletonCard />
          ) : insights ? (
            <ErrorBoundary>
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
                <CardHeader>
                  <CardTitle className="text-2xl font-display text-gold">Pregnancy Insights</CardTitle>
                  <CardDescription className="text-white/70">Based on your astrological profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80">{insights.predictions}</p>
                  {insights.favorablePeriods && insights.favorablePeriods.length > 0 && (
                    <div>
                      <p className="text-gold font-semibold mb-2">Favorable Periods:</p>
                      <ul className="list-disc list-inside space-y-1 text-white/70">
                        {insights.favorablePeriods.map((period: string, index: number) => (
                          <li key={index}>{new Date(period).toLocaleDateString()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-sm text-white/60 font-semibold mb-2">Favorable Factors:</p>
                      <ul className="list-disc list-inside text-white/80 space-y-1 text-sm">
                        {insights.astrologicalFactors.favorable.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-sm text-white/60 font-semibold mb-2">Considerations:</p>
                      <ul className="list-disc list-inside text-white/80 space-y-1 text-sm">
                        {insights.astrologicalFactors.considerations.map((c: string, i: number) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-sm text-white/60 font-semibold mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside text-white/80 space-y-1 text-sm">
                      {insights.recommendations.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </ErrorBoundary>
          ) : (
            <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
              <CardContent className="pt-6 text-center">
                <p className="text-white/70">No insights available yet</p>
                <Button onClick={refetch} className="mt-4 spiritual-gradient">Load Insights</Button>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
    </DashboardPageShell>
  );
}

