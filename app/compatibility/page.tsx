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
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';

export default function CompatibilityPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { analysis, loading, analyzeCompatibility } = useCompatibility();
  const [partnerData, setPartnerData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    rashi: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    // Check access before analyzing
    const { checkFeatureAccess } = await import('@/lib/access/checkFeatureAccess');
    const access = await checkFeatureAccess('compatibility');
    if (!access.allowed) {
      if (access.redirectTo) {
        router.push(access.redirectTo);
      }
      return;
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
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      <CosmicBackground />
      
      <div className="container mx-auto p-6 space-y-8 relative z-10">
        {/* One-Time Offer Banner */}
        <OneTimeOfferBanner
          feature="Relationship Compatibility (Lite)"
          description="Get instant compatibility analysis between you and your partner — included in Deep Insights."
          priceLabel="₹199"
          ctaLabel="Get Compatibility Report for ₹199"
          ctaHref="/pay/199"
        />

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
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button className="cosmic-button border-aura-cyan/30 text-aura-cyan hover:bg-aura-cyan/10">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

