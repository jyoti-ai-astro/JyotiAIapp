/**
 * Career Destiny Page
 * 
 * Master Plan v1.0 - Section 8: Career Destiny Engine
 * Cosmic-themed career and business compatibility checker
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Sparkles, Lightbulb } from 'lucide-react';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import Link from 'next/link';

export default function CareerPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [careerData, setCareerData] = useState<any>(null);
  const [businessIdea, setBusinessIdea] = useState('');
  const [businessResult, setBusinessResult] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      loadCareerData();
    }
  }, [user, router]);

  const loadCareerData = async () => {
    try {
      const response = await fetch('/api/career/analyze', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCareerData(data);
      }
    } catch (error) {
      console.error('Career data error:', error);
    }
  };

  const checkBusinessCompatibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check access before analyzing
      const { checkFeatureAccess } = await import('@/lib/access/checkFeatureAccess');
      const access = await checkFeatureAccess('career');
      if (!access.allowed) {
        if (access.redirectTo) {
          router.push(access.redirectTo);
        }
        setLoading(false);
        return;
      }

      const response = await fetch('/api/business/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessName: businessIdea,
          businessType: 'general',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze business compatibility');
      }

      const data = await response.json();
      setBusinessResult(data.compatibility);

      // Decrement ticket if not subscription
      const hasSubscription =
        user?.subscription === 'pro' &&
        user?.subscriptionExpiry &&
        new Date(user.subscriptionExpiry) > new Date();

      if (!hasSubscription && user?.tickets?.kundali_basic && user.tickets.kundali_basic > 0) {
        const { decrementTicket } = await import('@/lib/access/ticket-access');
        await decrementTicket('kundali_basic');
      }
    } catch (error: any) {
      console.error('Business compatibility error:', error);
      alert(error.message || 'Failed to analyze business compatibility');
    } finally {
      setLoading(false);
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
          feature="Career Reading (Lite)"
          description="Get instant career guidance and job compatibility analysis — included in Deep Insights."
          priceLabel="₹199"
          ctaLabel="Get Career Reading for ₹199"
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
            <Briefcase className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-cosmic-gold">
            Your Career Destiny
          </h1>
          <p className="text-aura-cyan max-w-2xl mx-auto">
            Discover whether you're destined for a job, business, or hybrid path
          </p>
        </motion.div>

        {/* Career Scores */}
        {careerData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-aura-cyan mb-2">Job Score</p>
                <motion.p
                  className="text-5xl font-bold text-aura-blue"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  {careerData.jobScore || 48}/100
                </motion.p>
              </CardContent>
            </Card>
            <Card className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-aura-cyan mb-2">Business Score</p>
                <motion.p
                  className="text-5xl font-bold text-aura-green"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  {careerData.businessScore || 84}/100
                </motion.p>
              </CardContent>
            </Card>
            <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-aura-cyan mb-2">Hybrid Score</p>
                <motion.p
                  className="text-5xl font-bold text-aura-violet"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  {careerData.hybridScore || 62}/100
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommendation */}
        {careerData && (
          <Card className="cosmic-card border-cosmic-gold/30 bg-cosmic-indigo/10">
            <CardHeader>
              <CardTitle className="text-cosmic-gold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-aura-cyan text-lg">
                {careerData.recommendation || 
                  "You should do BUSINESS. Your Rashi, Dasha, and Palm lines show leadership energy."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Business Idea Compatibility Checker */}
        <Card className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10">
          <CardHeader>
            <CardTitle className="text-aura-orange flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Business Idea Compatibility Checker
            </CardTitle>
            <CardDescription className="text-aura-cyan">
              Check if your business idea aligns with your cosmic destiny
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={checkBusinessCompatibility} className="space-y-4">
              <Input
                type="text"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="e.g., I want to open a chai café"
                required
                className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10 text-white"
              />
              <Button
                type="submit"
                disabled={loading}
                className="cosmic-button w-full hover-glow bg-gradient-to-r from-aura-orange to-aura-red text-white"
              >
                {loading ? 'Analyzing...' : 'Check Compatibility'}
              </Button>
            </form>

            {/* Business Result */}
            {businessResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="text-center p-6 rounded-xl bg-cosmic-gold/10 border border-cosmic-gold/30">
                  <p className="text-aura-cyan mb-2">Suitability Score</p>
                  <p className="text-4xl font-bold text-cosmic-gold">
                    {businessResult.suitabilityScore || 92}/100
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-cosmic-indigo/5">
                    <p className="text-sm text-aura-cyan mb-2">Risk Score</p>
                    <p className="text-2xl font-semibold text-aura-red">
                      {businessResult.riskScore || 18}/100
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-cosmic-indigo/5">
                    <p className="text-sm text-aura-cyan mb-2">Planet Support</p>
                    <p className="text-lg font-semibold text-aura-green">
                      {businessResult.planetSupport || 'Strong Jupiter & Moon'}
                    </p>
                  </div>
                </div>
                {businessResult.recommendedLaunchMonth && (
                  <div className="p-4 rounded-xl bg-aura-violet/10 border border-aura-violet/30">
                    <p className="text-sm text-aura-cyan mb-1">Recommended Launch Month</p>
                    <p className="text-xl font-semibold text-aura-violet">
                      {businessResult.recommendedLaunchMonth}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

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

