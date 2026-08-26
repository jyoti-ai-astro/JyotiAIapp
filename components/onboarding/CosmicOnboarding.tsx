'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Star, Moon, Sun } from 'lucide-react';
import { DatePickerInput } from '@/components/auth/DatePickerInput';
import { LocationAutocomplete } from '@/components/auth/LocationAutocomplete';
import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark';

interface OnboardingStepProps {
  formData: {
    dob: string;
    tob: string;
    pob: string;
    lat?: number;
    lng?: number;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  loading: boolean;
  onBack?: () => void;
  errorMessage?: string | null;
}

interface NakshatraObj {
  nakshatra: string;
  name?: string;
  pada?: string;
}

interface RashiConfirmationProps {
  rashiData: {
    moon: string;
    sun: string;
    ascendant: string;
    nakshatra: string | NakshatraObj;
  };
  selectedRashi: 'moon' | 'sun' | 'ascendant';
  setSelectedRashi: (rashi: 'moon' | 'sun' | 'ascendant') => void;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

// Step 1: Birth Details
const BirthDetailsStep: React.FC<OnboardingStepProps> = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  errorMessage,
}) => {
  const timeInputId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-block"
        >
          <SolarJyotiMark className="mx-auto mb-4 h-16 w-16 text-[#FFF7E8]" />
        </motion.div>
        <h2 className="font-heading text-3xl text-[#FFF7E8]">
          Create Your Birth Profile
        </h2>
        <p className="text-[#B9C2BF]">
          Enter verified birth details so JyotiAI can generate your Kundali
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!formData.dob || !formData.tob || !formData.pob) {
            return;
          }
          if (!formData.dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return;
          }
          if (!formData.tob.match(/^\d{2}:\d{2}$/)) {
            return;
          }
          onSubmit();
        }}
        className="space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DatePickerInput
            value={formData.dob}
            onChange={(value) => setFormData({ ...formData, dob: value })}
            required
            label="Date of Birth"
            className=""
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label
            htmlFor={timeInputId}
            className="mb-2 flex items-center gap-2 text-sm font-medium text-[#B9C2BF]"
          >
            <Clock className="w-4 h-4" />
            Time of Birth
          </label>
          <Input
            type="time"
            id={timeInputId}
            value={formData.tob}
            onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
            required
            className="border-[#D8B56A]/30 bg-[#FFF8E6]/10 text-[#FFF7E8]"
          />
          <p className="mt-1 text-xs text-[#B9C2BF]">
            Use 24-hour format (e.g., 14:30)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LocationAutocomplete
            value={formData.pob}
            onChange={(value, coordinates) => {
              setFormData({
                ...formData,
                pob: value,
                lat: coordinates?.lat,
                lng: coordinates?.lng,
              });
            }}
            required
            label="Place of Birth"
            className=""
          />
          <p className="mt-1 text-xs text-[#B9C2BF]">
            Start typing to search for your city
          </p>
        </motion.div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          >
            {errorMessage}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F28C28] text-[#07131F] hover:bg-[#F28C28]/90"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Calculating Rashi...
              </span>
            ) : (
              'Calculate Rashi'
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

// Step 2: Rashi Confirmation
const RashiConfirmationStep: React.FC<RashiConfirmationProps> = ({
  rashiData,
  selectedRashi,
  setSelectedRashi,
  onConfirm,
  onBack,
  loading,
}) => {
  const nakshatraDisplay =
    typeof rashiData.nakshatra === 'string'
      ? rashiData.nakshatra
      : `${rashiData.nakshatra.nakshatra || rashiData.nakshatra.name || ''}${
          rashiData.nakshatra.pada ? ` - Pada ${rashiData.nakshatra.pada}` : ''
        }`.trim() || '—';

  const rashiOptions = [
    {
      key: 'moon' as const,
      icon: Moon,
      label: 'Moon Sign (Chandra Rashi)',
      value: rashiData.moon,
      description: 'Most common in India - Recommended',
      color: 'aura-blue',
    },
    {
      key: 'sun' as const,
      icon: Sun,
      label: 'Sun Sign',
      value: rashiData.sun,
      description: 'Western astrology',
      color: 'aura-orange',
    },
    {
      key: 'ascendant' as const,
      icon: Star,
      label: 'Ascendant (Lagna)',
      value: rashiData.ascendant,
      description: 'Rising sign',
      color: 'aura-violet',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Star className="mx-auto mb-4 h-16 w-16 text-[#F1C979]" />
        </motion.div>
        <h2 className="font-heading text-3xl text-[#FFF7E8]">
          Select Your Rashi System
        </h2>
        <p className="text-[#B9C2BF]">
          Choose which Rashi system resonates with you
        </p>
      </div>

      <div className="space-y-4">
        {rashiOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedRashi === option.key;

          return (
            <motion.div
              key={option.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <motion.button
                type="button"
                onClick={() => setSelectedRashi(option.key)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#F28C28] bg-[#F28C28]/16 shadow-[0_0_22px_rgba(242,140,40,0.18)]'
                    : 'border-[#D8B56A]/24 bg-[#FFF8E6]/8 hover:border-[#D8B56A]/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-[#FFF8E6]/10 p-3 text-[#F1C979]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#FFF7E8]">{option.label}</p>
                      <p className="text-sm text-[#B9C2BF]">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        isSelected ? 'text-[#F1C979]' : 'text-[#FFF7E8]'
                      }`}
                    >
                      {option.value}
                    </p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-lg border border-[#D8B56A]/24 bg-[#FFF8E6]/8 p-4"
      >
        <p className="text-sm text-[#FFF7E8]">
          <span className="font-semibold text-[#F1C979]">Nakshatra:</span>{' '}
          <span className="text-[#B9C2BF]">{nakshatraDisplay}</span>
        </p>
      </motion.div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-[#D8B56A]/35 text-[#FFF7E8] hover:bg-[#FFF8E6]/10"
        >
          Previous
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="bg-[#F28C28] text-[#07131F] hover:bg-[#F28C28]/90"
        >
          {loading ? 'Confirming...' : 'Confirm & Continue'}
        </Button>
      </div>
    </motion.div>
  );
};

// Step 3: Completion
const CompletionStep: React.FC<{ onComplete: () => void; loading: boolean }> = ({
  onComplete,
  loading,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <SolarJyotiMark className="mx-auto mb-6 h-24 w-24 text-[#FFF7E8]" />
      </motion.div>

      <h2 className="font-heading text-3xl text-[#FFF7E8]">
        Your Spiritual Profile is Ready!
      </h2>

      <p className="mx-auto max-w-md text-[#B9C2BF]">
        Your numerology profile will be calculated automatically based on your name and
        birth date. You can explore your complete astrological profile in the dashboard.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-6"
      >
        <Button
          onClick={onComplete}
          disabled={loading}
          className="bg-[#F28C28] px-8 py-6 text-lg text-[#07131F] hover:bg-[#F28C28]/90"
        >
          {loading ? 'Completing Setup...' : 'Enter the Cosmos'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Main Onboarding Component
export interface CosmicOnboardingProps {
  step: number;
  formData: {
    dob: string;
    tob: string;
    pob: string;
    lat?: number;
    lng?: number;
  };
  setFormData: (data: any) => void;
  rashiData: {
    moon: string;
    sun: string;
    ascendant: string;
    nakshatra: string | NakshatraObj;
  } | null;
  selectedRashi: 'moon' | 'sun' | 'ascendant';
  setSelectedRashi: (rashi: 'moon' | 'sun' | 'ascendant') => void;
  onBirthDetailsSubmit: () => void;
  onRashiConfirm: () => void;
  onRashiBack: () => void;
  onComplete: () => void;
  loading: boolean;
  errorMessage?: string | null;
}

export const CosmicOnboarding: React.FC<CosmicOnboardingProps> = ({
  step,
  formData,
  setFormData,
  rashiData,
  selectedRashi,
  setSelectedRashi,
  onBirthDetailsSubmit,
  onRashiConfirm,
  onRashiBack,
  onComplete,
  loading,
  errorMessage,
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07131F] text-[#FFF7E8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(242,140,40,0.18),transparent_24rem),radial-gradient(circle_at_18%_34%,rgba(47,125,126,0.16),transparent_22rem)]" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D8B56A]/12" aria-hidden="true" />

      <div className="container relative z-10 mx-auto flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-[#D8B56A]/24 bg-[#07131F]/76 text-[#FFF7E8] backdrop-blur-md">
            <CardContent className="pt-8 pb-8">
              {/* Progress indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <motion.div
                      key={s}
                      className={`h-2 rounded-full transition-all ${
                        s <= step ? 'w-8 bg-[#F28C28]' : 'w-2 bg-[#FFF8E6]/18'
                      }`}
                      initial={{ width: s <= step ? 8 : 2 }}
                      animate={{ width: s <= step ? 32 : 8 }}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <BirthDetailsStep
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={onBirthDetailsSubmit}
                    loading={loading}
                    errorMessage={errorMessage}
                  />
                )}
                {step === 2 && rashiData && (
                  <>
                    {errorMessage && (
                      <div
                        role="alert"
                        className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                      >
                        {errorMessage}
                      </div>
                    )}
                    <RashiConfirmationStep
                      rashiData={rashiData}
                      selectedRashi={selectedRashi}
                      setSelectedRashi={setSelectedRashi}
                      onConfirm={onRashiConfirm}
                      onBack={onRashiBack}
                      loading={loading}
                    />
                  </>
                )}
                {step === 3 && (
                  <>
                    {errorMessage && (
                      <div
                        role="alert"
                        className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                      >
                        {errorMessage}
                      </div>
                    )}
                    <CompletionStep onComplete={onComplete} loading={loading} />
                  </>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
