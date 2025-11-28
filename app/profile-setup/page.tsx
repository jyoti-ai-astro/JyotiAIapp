/**
 * Profile Setup Page
 * 
 * Batch 2 - Auth & Onboarding
 * 
 * Initial profile setup after signup
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
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm';
import { useAuthFlow } from '@/lib/utils/auth-flow';
import { User, Calendar, MapPin } from 'lucide-react';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const { handleProfileSetupSuccess } = useAuthFlow();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    dob: '',
    pob: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          dob: formData.dob,
          pob: formData.pob,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      updateUser({
        name: formData.name,
        dob: formData.dob,
        pob: formData.pob,
      });

      handleProfileSetupSuccess();
    } catch (error) {
      console.error('Profile setup error:', error);
      alert('Failed to save profile. Please try again.');
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

  if (!user) {
    return null;
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
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-white mb-2">Profile Setup</h1>
              <p className="text-white/80">Tell us about yourself</p>
            </div>

            <ProfileSetupForm
              onSubmit={handleSubmit}
              loading={loading}
              initialData={formData}
            />
          </div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}

