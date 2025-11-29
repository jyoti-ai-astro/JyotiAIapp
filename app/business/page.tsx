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
import Link from 'next/link';

export default function BusinessPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { analysis, loading, error, analyze } = useBusiness();
  const [businessIdea, setBusinessIdea] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleAnalyze = async () => {
    if (!businessIdea.trim()) {
      alert('Please enter a business idea');
      return;
    }

    // Check access before analyzing
    const { checkFeatureAccess } = await import('@/lib/access/checkFeatureAccess');
    const access = await checkFeatureAccess('career');
    if (!access.allowed) {
      if (access.redirectTo) {
        router.push(access.redirectTo);
      }
      return;
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
          {/* One-Time Offer Banner */}
          <OneTimeOfferBanner
            feature="Business Compatibility Analysis"
            description="Get instant business idea compatibility check based on your Kundali — included in Deep Insights."
            priceLabel="₹199"
            ctaLabel="Get Business Analysis for ₹199"
            ctaHref="/pay/199"
          />

          <div className="text-center">
            <Briefcase className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">Business Compatibility</h1>
            <p className="text-white/70 mt-2">Check if your business idea aligns with your cosmic blueprint</p>
          </div>

          <BusinessEngine onAnalysisComplete={(analysis) => setAnalysis(analysis)} />

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

