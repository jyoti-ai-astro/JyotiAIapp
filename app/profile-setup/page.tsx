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
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

interface ProfileFormData {
  name: string;
  dob: string;
  pob: string;
  lat?: number;
  lng?: number;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  const [formData] = useState<ProfileFormData>({
    name: user?.name || '',
    dob: user?.dob || '',
    pob: user?.pob || '',
    lat: user?.lat,
    lng: user?.lng,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          dob: data.dob,
          pob: data.pob,
          lat: data.lat,
          lng: data.lng,
        }),
      });

      const errorData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(errorData.error || 'Failed to update profile');
      }

      updateUser({
        name: data.name,
        dob: data.dob,
        pob: data.pob,
        lat: data.lat,
        lng: data.lng,
      });

      // Navigate into onboarding flow
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      alert(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingPageShell
      eyebrow="Account Setup"
      title="Complete your profile"
      description="Tell us about yourself to unlock personalized cosmic insights"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8 shadow-[0_8px_32px_rgba(255,213,122,0.15)]">
            <ProfileSetupForm
              onSubmit={handleSubmit}
              loading={loading}
              initialData={formData}
            />
          </div>
        </motion.div>
      </div>
    </MarketingPageShell>
  );
}
