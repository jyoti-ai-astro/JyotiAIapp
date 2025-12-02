/**
 * Houses Page
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * Displays 12 houses with planets
 */

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useKundali } from '@/lib/hooks/useKundali';
import { HousesGrid, HouseData } from '@/components/houses/HousesGrid';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function HousesPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { kundali, loading, error: kundaliError, refetch } = useKundali();
  
  const houses: HouseData[] = kundali?.D1?.bhavas ? Object.values(kundali.D1.bhavas).map((bhava: any) => ({
    houseNumber: bhava.houseNumber,
    sign: bhava.sign,
    cuspLongitude: bhava.cuspLongitude,
    planets: bhava.planets || [],
  })) : [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (loading && !kundali) {
    return (
      <DashboardPageShell title="Loading Houses..." subtitle="Please wait while we fetch your house positions">
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
      <DashboardPageShell title="Error Loading Houses" subtitle="We couldn&apos;t load your house positions">
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
      title="Houses"
      subtitle="12 houses of your birth chart"
    >

              {houses.length > 0 ? (
                <ErrorBoundary>
                  <HousesGrid houses={houses} />
                </ErrorBoundary>
              ) : (
                <SkeletonCard />
              )}
    </DashboardPageShell>
  );
}

