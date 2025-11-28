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
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';
import { Button } from '@/components/ui/button';
import { RasiSelector } from '@/components/auth/RasiSelector';
import { useAuthFlow } from '@/lib/utils/auth-flow';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

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
    <PageTransitionWrapper>
      {/* R3F Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
          <Suspense fallback={null}>
            <NebulaShader intensity={1.0} />
            <ParticleField count={3000} intensity={1.0} />
            <RotatingMandala speed={0.1} intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <CosmicCursor />
      <SoundscapeController />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Glassmorphism Card */}
          <div className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <div className="text-center mb-8">
              <Star className="h-12 w-12 text-gold mx-auto mb-4" />
              <h1 className="text-3xl font-display font-bold text-white mb-2">Confirm Your Rashi</h1>
              <p className="text-white/80">Based on your birth details, we&apos;ve calculated your Rashi</p>
            </div>

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
    </PageTransitionWrapper>
  );
}

