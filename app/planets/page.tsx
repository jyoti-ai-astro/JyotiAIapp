/**
 * Planets Page
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * Displays all planets with their positions
 */

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useKundali } from '@/lib/hooks/useKundali';
import { PlanetsView, PlanetData } from '@/components/planets/PlanetsView';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function PlanetsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { kundali, loading, error: kundaliError, refetch } = useKundali();
  
  const planets: PlanetData[] = kundali?.D1?.grahas ? Object.entries(kundali.D1.grahas).map(
    ([_, graha]: [string, any]) => ({
      planet: graha.planet,
      sign: graha.sign,
      nakshatra: graha.nakshatra,
      pada: graha.pada,
      house: graha.house,
      longitude: graha.longitude,
      latitude: graha.latitude,
      retrograde: graha.retrograde,
      degreesInSign: graha.degreesInSign,
    })
  ) : [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (loading && !kundali) {
    return (
      <DashboardPageShell title="Loading Planets..." subtitle="Please wait while we fetch your planetary positions">
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-12 w-12 text-[#FFD57A]" />
          </motion.div>
        </div>
      </DashboardPageShell>
    );
  }

  if (kundaliError) {
    return (
      <DashboardPageShell title="Error Loading Planets" subtitle="We couldn&apos;t load your planetary positions">
        <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-400">{kundaliError.message}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={refetch} className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#05050A]">Retry</Button>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Planets"
      subtitle="Planetary positions in your birth chart"
    >

              {planets.length > 0 ? (
                <ErrorBoundary>
                  <PlanetsView planets={planets} />
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}
    </DashboardPageShell>
  );
}

