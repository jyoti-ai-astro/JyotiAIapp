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
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
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
      const response = await fetch('/api/subscriptions/status', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      
      const data = await response.json();
      setSubscription(data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch subscription error:', error);
      setSubscription({
        active: false,
        planId: null,
        productId: null,
        razorpaySubscriptionId: null,
        status: null,
      });
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      // Refresh subscription status
      await fetchSubscription();
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      alert(error.message || 'Failed to cancel subscription');
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardPageShell
      title="Payments"
      subtitle="Manage your subscription and payments"
    >

          {loading ? (
            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12 text-center">
                <Sparkles className="w-8 h-8 text-[#FFD57A] animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading subscription details...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-display text-[#FFD57A]">Current Subscription</CardTitle>
                <CardDescription className="text-white/70">Your active subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.active ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Plan:</span>
                      <span className="text-[#FFD57A] font-semibold capitalize">
                        {subscription.planId || 'Active'}
                      </span>
                    </div>
                    {subscription.status && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Status:</span>
                        <span className="text-white/80 capitalize">{subscription.status}</span>
                      </div>
                    )}
                    {subscription.razorpaySubscriptionId && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Subscription ID:</span>
                        <span className="text-white/60 text-sm font-mono">
                          {subscription.razorpaySubscriptionId.substring(0, 12)}...
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={handleCancelSubscription}
                      variant="destructive"
                      className="w-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    >
                      Cancel Subscription
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <p className="text-white/60 mb-4">No active subscription</p>
                      <Button
                        onClick={() => router.push('/pricing')}
                        className="w-full bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#05050A] font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Sparkles className="inline-block mr-2 h-4 w-4" />
                        View Plans
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
    </DashboardPageShell>
  );
}

