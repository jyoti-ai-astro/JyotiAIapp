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
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { PlanetsView, PlanetData } from '@/components/planets/PlanetsView';
import { motion } from 'framer-motion';
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
      <PageTransitionWrapper>
        <CosmicBackground />
        <CosmicCursor />
        <SoundscapeController />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-12 w-12 text-gold" />
          </motion.div>
        </div>
      </PageTransitionWrapper>
    );
  }

  if (kundaliError) {
    return (
      <PageTransitionWrapper>
        <CosmicBackground />
        <CosmicCursor />
        <SoundscapeController />
        <div className="relative z-10 container mx-auto p-6">
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-destructive">{kundaliError.message}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={refetch} className="spiritual-gradient">Retry</Button>
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransitionWrapper>
    );
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
          className="container mx-auto space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-gold">Planets</h1>
              <p className="text-white/70 mt-2">Planetary positions in your birth chart</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>

              {planets.length > 0 ? (
                <ErrorBoundary>
                  <PlanetsView planets={planets} />
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}

