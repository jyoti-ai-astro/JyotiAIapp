'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { CosmicOnboarding } from '@/components/onboarding/CosmicOnboarding';
import { invalidateAuthenticatedRead } from '@/lib/client/authenticated-read'

interface RashiData {
  moon: string;
  sun: string;
  ascendant: string;
  nakshatra: string;
}

interface FormData {
  dob: string;
  tob: string;
  pob: string;
  lat?: number;
  lng?: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rashiData, setRashiData] = useState<RashiData | null>(null);
  const [selectedRashi, setSelectedRashi] = useState<'moon' | 'sun' | 'ascendant'>('moon');

  const [formData, setFormData] = useState<FormData>({
    dob: '',
    tob: '',
    pob: '',
    lat: undefined,
    lng: undefined,
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  /**
   * Normalize backend response so we NEVER pass an object directly
   * into JSX (this fixes the "nakshatra object" React error).
   */
  const normalizeRashiResponse = (data: any): RashiData => {
    const src = data?.rashi || data || {};
    const nakshSrc = data?.nakshatra || src?.nakshatra;

    const moon = String(
      src.moon ??
        src.moonSign ??
        src.chandraRashi ??
        ''
    );

    const sun = String(
      src.sun ??
        src.sunSign ??
        src.suryaRashi ??
        ''
    );

    const ascendant = String(
      src.ascendant ??
        src.lagna ??
        src.risingSign ??
        ''
    );

    let nakshatra = '';

    if (typeof nakshSrc === 'string') {
      nakshatra = nakshSrc;
    } else if (nakshSrc && typeof nakshSrc === 'object') {
      // Backend might send { name: 'Rohini', pada: 2 } etc.
      nakshatra =
        nakshSrc.name ??
        nakshSrc.label ??
        nakshSrc.nakshatra ??
        '';

      if (nakshatra && nakshSrc.pada) {
        nakshatra = `${nakshatra} · Pada ${nakshSrc.pada}`;
      }
    }

    return {
      moon,
      sun,
      ascendant,
      nakshatra,
    };
  };

  // Step 1: Save birth details with geocoding
  const handleBirthDetailsSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/onboarding/birth-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          dob: formData.dob,
          tob: formData.tob,
          pob: formData.pob,
          lat: formData.lat,
          lng: formData.lng,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to save birth details');
      }

      const data = await response.json().catch(() => ({}));

      // Update local store
      updateUser({
        dob: formData.dob,
        tob: formData.tob,
        pob: formData.pob,
        lat: data.geocode?.lat ?? formData.lat,
        lng: data.geocode?.lng ?? formData.lng,
        timezone: data.geocode?.timezone,
      });

      // Calculate Rashi and move to Step 2
      await calculateRashi();
    } catch (error: any) {
      console.error('Birth details error:', error);
      setErrorMessage(error.message || 'Failed to save birth details');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Rashi and Nakshatra
  const calculateRashi = async () => {
    try {
      const response = await fetch('/api/onboarding/calculate-rashi', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Rashi calculation error payload:', data);
        throw new Error(data.error || 'Failed to calculate Rashi');
      }

      const normalized = normalizeRashiResponse(data);
      setRashiData(normalized);
      setStep(2); // Move to Rashi confirmation step
    } catch (error: any) {
      console.error('Rashi calculation error:', error);
      setErrorMessage(error.message || 'Failed to calculate Rashi. Please try again.');
    }
  };

  // Step 2: Confirm Rashi selection
  const handleRashiConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/onboarding/confirm-rashi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rashiPreferred: selectedRashi }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Rashi confirmation error payload:', data);
        throw new Error(data.error || 'Failed to confirm Rashi');
      }

      updateUser({
        rashi: data.rashi,
        rashiPreferred: data.rashiPreferred,
      });

      setStep(3); // Move to numerology / completion step
    } catch (error: any) {
      console.error('Rashi confirmation error:', error);
      setErrorMessage(error.message || 'Failed to confirm Rashi. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete onboarding
  const handleComplete = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const kundaliResponse = await fetch('/api/kundali/generate-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ source: 'onboarding' }),
      });

      if (!kundaliResponse.ok) {
        const kundaliError = await kundaliResponse.json().catch(() => ({}));
        throw new Error(kundaliError.message || kundaliError.error || 'Failed to generate Kundali');
      }

      // Canonical Kundali changed: invalidate only dependent authenticated reads.
      invalidateAuthenticatedRead('/api/kundali/get')
      invalidateAuthenticatedRead('/api/astro/context')
      invalidateAuthenticatedRead('/api/timeline')

      // Mark as onboarded after the canonical onboarding Kundali exists.
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ onboarded: true }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Onboarding completion error payload:', data);
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      updateUser({ onboarded: true });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      setErrorMessage(error.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CosmicOnboarding
      step={step}
      formData={formData}
      setFormData={setFormData}
      rashiData={rashiData}
      selectedRashi={selectedRashi}
      setSelectedRashi={setSelectedRashi}
      onBirthDetailsSubmit={handleBirthDetailsSubmit}
      onRashiConfirm={handleRashiConfirm}
      onRashiBack={() => setStep(1)}
      onComplete={handleComplete}
      loading={loading}
      errorMessage={errorMessage}
    />
  );
}
