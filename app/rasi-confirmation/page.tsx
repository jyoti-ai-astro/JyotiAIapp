/**
 * Rashi Confirmation Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Confirm Rashi selection after profile setup
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RasiSelector } from '@/components/auth/RasiSelector';
import { useAuthFlow } from '@/lib/utils/auth-flow';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

interface RashiData {
  moon: string;
  sun: string;
  ascendant: string;
  nakshatra: string;
}

export default function RashiConfirmationPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const { handleRasiConfirmationSuccess } = useAuthFlow();
  const [loading, setLoading] = useState(false);
  const [rashiData, setRashiData] = useState<RashiData | null>(null);
  const [selectedRashi, setSelectedRashi] = useState<'moon' | 'sun' | 'ascendant'>('moon');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Calculate Rashi
    const calculateRashi = async () => {
      try {
        const response = await fetch('/api/onboarding/calculate-rashi', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to calculate Rashi');
        }

        const data = await response.json();
        setRashiData({
          moon: data.rashi.moon,
          sun: data.rashi.sun,
          ascendant: data.rashi.ascendant,
          nakshatra: data.nakshatra,
        });
      } catch (error) {
        console.error('Rashi calculation error:', error);
        alert('Failed to calculate Rashi. Please try again.');
      }
    };

    if (user.dob && user.pob) {
      calculateRashi();
    } else {
      router.push('/profile-setup');
    }
  }, [user, router]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/confirm-rashi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rashiPreferred: selectedRashi }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm Rashi');
      }

      const data = await response.json();
      updateUser({
        rashi: data.rashi,
        rashiPreferred: data.rashiPreferred,
      });

      handleRasiConfirmationSuccess();
    } catch (error) {
      console.error('Rashi confirmation error:', error);
      alert('Failed to confirm Rashi. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
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
  };

  if (!user || !rashiData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Calculating your Rashi...</div>
      </div>
    );
  }

  return (
    <MarketingPageShell
      eyebrow="Onboarding"
      title="Confirm Your Rashi"
      description="Based on your birth details, we've calculated your Rashi"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8 shadow-[0_8px_32px_rgba(255,213,122,0.15)]">

            <div className="space-y-6">
              <RasiSelector
                rashiData={rashiData}
                selectedRashi={selectedRashi}
                onRashiChange={setSelectedRashi}
              />

              <Button
                onClick={(e) => {
                  createRipple(e);
                  handleConfirm();
                }}
                disabled={loading}
                className="w-full bg-gold text-cosmic-navy hover:bg-gold-light relative overflow-hidden"
                size="lg"
              >
                {loading ? 'Confirming...' : 'Confirm & Continue'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}

