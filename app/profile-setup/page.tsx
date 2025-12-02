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
import { useAuthFlow } from '@/lib/utils/auth-flow';
import { User, Calendar, MapPin } from 'lucide-react';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

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

