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
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
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
      <DashboardPageShell title="Loading Dasha..." subtitle="Please wait while we fetch your dasha periods">
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
      <DashboardPageShell title="Error Loading Dasha" subtitle="We couldn&apos;t load your dasha periods">
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
      title="Dasha Timeline"
      subtitle="Current life phase periods"
    >

      {/* GSAP Timeline */}
      <DashaTimeline dashaPeriods={dasha} />
    </DashboardPageShell>
  );
}

