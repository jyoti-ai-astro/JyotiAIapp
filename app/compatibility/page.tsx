/**
 * Compatibility Screen
 * 
 * Master Plan v1.0 - Section 9: Compatibility Screen
 * Cosmic-themed compatibility checker
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useCompatibility } from '@/lib/hooks/useCompatibility';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Heart, Sparkles, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { useTicketAccess } from '@/lib/access/useTicketAccess';
import { getFeatureAccess } from '@/lib/payments/feature-access';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import type { AstroContext } from '@/lib/engines/astro-types';

export default function CompatibilityPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const featureKey = 'compatibility' as const;
  const { hasAccess, hasSubscription, tickets, loading: ticketLoading, config } = useTicketAccess(featureKey);
  const featureConfig = getFeatureAccess(featureKey);
  const { analysis, loading, analyzeCompatibility } = useCompatibility();
  const [partnerData, setPartnerData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    rashi: '',
  });
  const [astro, setAstro] = useState<AstroContext | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (hasAccess && !ticketLoading) {
      fetchAstroContext();
    }
  }, [user, router, hasAccess, ticketLoading]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    // Check access before analyzing
    const access = await checkFeatureAccess(user, 'compatibility');
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || '/pay/199');
      }
      return;
    }

    if (access.decrementTicket) {
      await decrementTicket('kundali_basic');
    }

    const partner1: any = {
      name: user.name || 'You',
      dob: user.dob || '',
      rashi: user.rashi || '',
    };

    const partner2 = {
      name: partnerData.name,
      dob: partnerData.dob,
      tob: partnerData.tob,
      pob: partnerData.pob,
      rashi: partnerData.rashi,
    };

    await analyzeCompatibility(partner1, partner2);

    // Decrement ticket if not subscription
    const hasSubscription =
      user.subscription === 'pro' &&
      user.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date();

    if (!hasSubscription && user.tickets?.kundali_basic && user.tickets.kundali_basic > 0) {
      const { decrementTicket } = await import('@/lib/access/ticket-access');
      await decrementTicket('kundali_basic');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardPageShell
      title="Compatibility Analysis"
      subtitle="Check relationship compatibility and marriage timing with your partner"
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Heart className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-cosmic-gold">
            Compatibility Analysis
          </h1>
          <p className="text-aura-cyan max-w-2xl mx-auto">
            Discover your compatibility with your partner through Kundali and Numerology
          </p>
        </motion.div>

        {/* Partner Details Form */}
        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="cosmic-card border-aura-red/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-red flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Enter Partner Details
                </CardTitle>
                <CardDescription className="text-aura-cyan">
                  Provide your partner's birth details for compatibility analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Partner Name
                    </label>
                    <Input
                      type="text"
                      value={partnerData.name}
                      onChange={(e) => setPartnerData({ ...partnerData, name: e.target.value })}
                      required
                      placeholder="Enter partner's full name"
                      className="cosmic-card border-aura-red/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={partnerData.dob}
                      onChange={(e) => setPartnerData({ ...partnerData, dob: e.target.value })}
                      required
                      className="cosmic-card border-aura-red/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Time of Birth
                    </label>
                    <Input
                      type="time"
                      value={partnerData.tob}
                      onChange={(e) => setPartnerData({ ...partnerData, tob: e.target.value })}
                      required
                      className="cosmic-card border-aura-red/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Place of Birth
                    </label>
                    <Input
                      type="text"
                      value={partnerData.pob}
                      onChange={(e) => setPartnerData({ ...partnerData, pob: e.target.value })}
                      required
                      placeholder="e.g., Mumbai, India"
                      className="cosmic-card border-aura-red/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="cosmic-button w-full hover-glow bg-gradient-to-r from-aura-red to-aura-violet text-white"
                  >
                    {loading ? 'Analyzing Compatibility...' : 'Check Compatibility'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Compatibility Score */}
            <Card className="cosmic-card border-cosmic-gold/30 bg-cosmic-indigo/10">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                  <p className="text-aura-cyan text-lg">Compatibility Score</p>
                  <motion.p
                    className="text-7xl font-bold text-cosmic-gold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    {analysis.score.overall}/100
                  </motion.p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-sm text-aura-cyan">Love</p>
                      <p className="text-xl font-semibold text-aura-green">
                        {analysis.score.love}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-aura-cyan">Career</p>
                      <p className="text-xl font-semibold text-aura-blue">
                        {analysis.score.career}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-aura-cyan">Communication</p>
                      <p className="text-xl font-semibold text-aura-violet">
                        {analysis.score.communication}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-aura-cyan">Long-term</p>
                      <p className="text-xl font-semibold text-aura-orange">
                        {analysis.score.longTerm}%
                      </p>
                    </div>
                  </div>
                  {analysis.marriageTiming && (
                    <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                      <p className="text-sm text-gold font-semibold mb-2">Best Marriage Period</p>
                      <p className="text-white">{analysis.marriageTiming.bestPeriod}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <Card className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-green">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-aura-cyan">
                        <span className="text-aura-green mt-1">•</span>
                        <div>
                          <p className="font-semibold">{strength.area}</p>
                          <p className="text-sm text-white/70">{strength.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <Card className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-orange">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-aura-cyan">
                        <span className="text-aura-orange mt-1">•</span>
                        <div>
                          <p className="font-semibold">{risk.area}</p>
                          <p className="text-sm text-white/70">{risk.description}</p>
                          {risk.remedy && (
                            <p className="text-xs text-gold mt-1">Remedy: {risk.remedy}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {analysis.summary && (
              <Card className="cosmic-card border-cosmic-gold/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-cosmic-gold">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-aura-cyan leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-violet flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-aura-cyan">
                        <span className="text-aura-violet mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setPartnerData({ name: '', dob: '', tob: '', pob: '', rashi: '' });
                }}
                className="cosmic-button border-aura-cyan/30 text-aura-cyan hover:bg-aura-cyan/10"
              >
                Analyze Another Partner
              </Button>
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        {/* Ask Guru With Context Button */}
        {astro && (
          <div className="flex justify-center mb-4">
            <Button
              onClick={() => router.push(`/guru?context=${encodeURIComponent(JSON.stringify(astro))}`)}
              className="gold-btn"
            >
              Ask Guru With My Birth Context
            </Button>
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button className="cosmic-button border-aura-cyan/30 text-aura-cyan hover:bg-aura-cyan/10">
              Back to Dashboard
            </Button>
          </Link>
        </div>
    </DashboardPageShell>
  );
}

