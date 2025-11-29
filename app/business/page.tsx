/**
 * Business Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * Business idea compatibility checker
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useBusiness } from '@/lib/hooks/useBusiness';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Sparkles } from 'lucide-react';
import { BusinessEngine } from '@/components/engines/BusinessEngine';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import type { AstroContext } from '@/lib/engines/astro-types';
import Link from 'next/link';

export default function BusinessPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { analysis, loading, error, analyze } = useBusiness();
  const [businessIdea, setBusinessIdea] = useState('');
  const [astro, setAstro] = useState<AstroContext | null>(null);

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

  const handleAnalyze = async () => {
    if (!businessIdea.trim()) {
      alert('Please enter a business idea');
      return;
    }

    // Check access before analyzing
    const access = await checkFeatureAccess(user, 'business');
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || '/pay/199');
      }
      return;
    }

    if (access.decrementTicket) {
      await decrementTicket('kundali_basic');
    }

    await analyze(businessIdea);

    // Decrement ticket if not subscription
    const hasSubscription =
      user?.subscription === 'pro' &&
      user?.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date();

    if (!hasSubscription && user?.tickets?.kundali_basic && user.tickets.kundali_basic > 0) {
      const { decrementTicket } = await import('@/lib/access/ticket-access');
      await decrementTicket('kundali_basic');
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
            <Briefcase className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">Business Compatibility</h1>
            <p className="text-white/70 mt-2">Check if your business idea aligns with your cosmic blueprint</p>
          </div>

          <BusinessEngine onAnalysisComplete={(analysis) => setAnalysis(analysis)} />

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
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}

