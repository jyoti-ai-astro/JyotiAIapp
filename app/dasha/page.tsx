/**
 * Dasha Page
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * GSAP horizontal timeline for Dasha periods
 */

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useKundali } from '@/lib/hooks/useKundali';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { DashaTimeline } from '@/components/astro/DashaTimeline';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  type: 'mahadasha' | 'antardasha' | 'pratyantardasha';
}

export default function DashaPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { kundali, loading, error: kundaliError, refetch } = useKundali();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const dasha = kundali?.dasha ? [
    ...(kundali.dasha?.currentMahadasha ? [{ ...kundali.dasha.currentMahadasha, type: 'mahadasha' as const }] : []),
    ...(kundali.dasha?.currentAntardasha ? [{ ...kundali.dasha.currentAntardasha, type: 'antardasha' as const }] : []),
    ...(kundali.dasha?.currentPratyantardasha ? [{ ...kundali.dasha.currentPratyantardasha, type: 'pratyantardasha' as const }] : []),
  ] : [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (dasha.length > 0 && timelineRef.current && typeof window !== 'undefined') {
      // GSAP timeline animation
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
      });

      const items = timelineRef.current.querySelectorAll('.dasha-item');
      items.forEach((item, index) => {
        timeline.fromTo(
          item,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.5 },
          index * 0.1
        );
      });
    }
  }, [dasha]);

  if (loading && !kundali?.dasha) {
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
              <h1 className="text-4xl font-display font-bold text-gold">Dasha Timeline</h1>
              <p className="text-white/70 mt-2">Current life phase periods</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* GSAP Timeline */}
          <DashaTimeline dashaPeriods={dasha} />
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}

