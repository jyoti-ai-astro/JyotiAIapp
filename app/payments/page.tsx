/**
 * Payments Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * Subscription and payment management
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Sparkles } from 'lucide-react';
import { PaymentCards } from '@/components/engines/PaymentCards';
import Link from 'next/link';

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchSubscription();
    }
  }, [user, router]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // Placeholder - fetch from API
      setTimeout(() => {
        setSubscription({
          plan: user?.subscription || 'free',
          expiry: user?.subscriptionExpiry || null,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Fetch subscription error:', error);
      setLoading(false);
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
          <div className="text-center">
            <CreditCard className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">Payments</h1>
            <p className="text-white/70 mt-2">Manage your subscription and payments</p>
          </div>

          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-aura-cyan">Current Subscription</CardTitle>
              <CardDescription className="text-white/70">Your active subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Plan:</span>
                <span className="text-gold font-semibold capitalize">{subscription?.plan || 'Free'}</span>
              </div>
              {subscription?.expiry && (
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Expires:</span>
                  <span className="text-white/80">
                    {new Date(subscription.expiry).toLocaleDateString()}
                  </span>
                </div>
              )}
              <Button
                className="w-full spiritual-gradient relative overflow-hidden"
                onClick={(e) => {
                  const button = e.currentTarget;
                  const ripple = document.createElement('span');
                  const rect = button.getBoundingClientRect();
                  const size = Math.max(rect.width, rect.height);
                  const x = e.clientX - rect.left - size / 2;
                  const y = e.clientY - rect.top - size / 2;
                  ripple.style.width = ripple.style.height = `${size}px`;
                  ripple.style.left = `${x}px`;
                  ripple.style.top = `${y}px`;
                  ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
                  button.appendChild(ripple);
                  setTimeout(() => ripple.remove(), 600);
                }}
              >
                <Sparkles className="inline-block mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

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

