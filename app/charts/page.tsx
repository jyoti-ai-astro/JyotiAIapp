/**
 * Charts Page
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * Displays D1, D9, D10 divisional charts
 */

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useKundali } from '@/lib/hooks/useKundali';
import { DivisionalCharts } from '@/components/charts/DivisionalCharts';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/global/ErrorBoundary';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function ChartsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { kundali, loading, error: kundaliError, refetch } = useKundali();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (loading && !kundali) {
    return (
      <DashboardPageShell title="Loading Charts..." subtitle="Please wait while we fetch your divisional charts">
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
      <DashboardPageShell title="Error Loading Charts" subtitle="We couldn&apos;t load your divisional charts">
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
      title="Divisional Charts"
      subtitle="D1, D9, D10 charts"
    >

          {kundali ? (
            <ErrorBoundary>
              <DivisionalCharts
                d1Data={kundali?.D1}
                d9Data={kundali?.D9}
                d10Data={kundali?.D10}
              />
            </ErrorBoundary>
          ) : !loading ? (
            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <Sparkles className="w-16 h-16 text-[#FFD57A]/40 mx-auto" />
                <h3 className="text-2xl font-display font-semibold text-white">No Charts Available</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  Your divisional charts will appear here once your Kundali is generated. Visit the Kundali page to create your birth chart.
                </p>
                <Link href="/kundali">
                  <Button className="mt-4 bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#05050A]">
                    Go to Kundali
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <SkeletonCard />
          )}
    </DashboardPageShell>
  );
}

