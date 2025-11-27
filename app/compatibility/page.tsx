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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function CompatibilityPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [partnerData, setPartnerData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/compatibility/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(partnerData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze compatibility');
      }

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      console.error('Compatibility error:', error);
      alert(error.message || 'Failed to analyze compatibility');
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
        {!result && (
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
        {result && (
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
                    {result.score || 86}/100
                  </motion.p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-sm text-aura-cyan">Emotional Synergy</p>
                      <p className="text-xl font-semibold text-aura-green">
                        {result.emotionalSynergy || 'Strong'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-aura-cyan">Marriage Timing</p>
                      <p className="text-xl font-semibold text-aura-blue">
                        {result.marriageTiming || '2026-27'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {result.riskFactors && result.riskFactors.length > 0 && (
              <Card className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-orange">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.riskFactors.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-aura-cyan">
                        <span className="text-aura-orange mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-violet flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec: string, i: number) => (
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
                onClick={() => setResult(null)}
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

