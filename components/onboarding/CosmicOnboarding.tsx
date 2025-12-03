/**
 * Cosmic Onboarding Component
 * 
 * Master Plan v1.0 - Section 1: Onboarding Flow
 * Cosmic-themed multi-step onboarding with animations
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { Sparkles, Calendar, MapPin, Clock, Star, Moon, Sun } from 'lucide-react';
import { DatePickerInput } from '@/components/auth/DatePickerInput';
import { LocationAutocomplete } from '@/components/auth/LocationAutocomplete';

interface OnboardingStepProps {
  step: number;
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
}

interface RashiConfirmationProps {
  rashiData: {
    moon: string;
    sun: string;
    ascendant: string;
    nakshatra: string;
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
}) => {
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
          <Sparkles className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-display text-cosmic-gold">
          Create Your Spiritual Profile
        </h2>
        <p className="text-aura-cyan">
          Enter your birth details to unlock your cosmic destiny
        </p>
      </div>

      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          // Validate all fields are filled
          if (!formData.dob || !formData.tob || !formData.pob) {
            alert('Please fill in all fields: Date of Birth, Time of Birth, and Place of Birth');
            return;
          }
          // Validate date format (YYYY-MM-DD)
          if (!formData.dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
            alert('Please enter a valid date of birth');
            return;
          }
          // Validate time format (HH:MM)
          if (!formData.tob.match(/^\d{2}:\d{2}$/)) {
            alert('Please enter a valid time of birth (24-hour format, e.g., 14:30)');
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
          <label className="mb-2 block text-sm font-medium text-aura-cyan flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time of Birth
          </label>
          <Input
            type="time"
            value={formData.tob}
            onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
            required
            className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 text-white"
          />
          <p className="mt-1 text-xs text-aura-cyan/60">Use 24-hour format (e.g., 14:30)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LocationAutocomplete
            value={formData.pob}
            onChange={(value, coordinates) => {
              // Store both the formatted address and coordinates
              setFormData({ 
                ...formData, 
                pob: value,
                // Store coordinates in a way that can be passed to API
                lat: coordinates?.lat,
                lng: coordinates?.lng,
              });
            }}
            required
            label="Place of Birth"
            className=""
          />
          <p className="mt-1 text-xs text-aura-cyan/60">Start typing to search for your city</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={loading}
            className="cosmic-button w-full hover-glow bg-gradient-to-r from-cosmic-purple to-aura-cyan text-white"
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
          <Star className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-display text-cosmic-gold">
          Select Your Rashi System
        </h2>
        <p className="text-aura-cyan">
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
                    ? 'border-cosmic-gold bg-cosmic-gold/20 cosmic-glow'
                    : 'border-cosmic-indigo/30 bg-cosmic-indigo/10 hover:border-aura-cyan/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${option.color}/20`}>
                      <Icon className={`w-6 h-6 text-${option.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{option.label}</p>
                      <p className="text-sm text-aura-cyan/60">{option.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isSelected ? 'text-cosmic-gold' : 'text-white'}`}>
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
        className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10 p-4 rounded-xl"
      >
        <p className="text-sm text-white">
          <span className="text-aura-violet font-semibold">Nakshatra:</span>{' '}
          <span className="text-aura-cyan">{rashiData.nakshatra}</span>
        </p>
      </motion.div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="cosmic-button border-aura-cyan/30 text-aura-cyan hover:bg-aura-cyan/10"
        >
          Previous
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="cosmic-button hover-glow bg-gradient-to-r from-cosmic-purple to-aura-cyan text-white"
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
        <Sparkles className="w-24 h-24 text-cosmic-gold mx-auto mb-6" />
      </motion.div>
      
      <h2 className="text-3xl font-display text-cosmic-gold">
        Your Spiritual Profile is Ready!
      </h2>
      
      <p className="text-aura-cyan max-w-md mx-auto">
        Your numerology profile will be calculated automatically based on your name and birth date.
        You can explore your complete astrological profile in the dashboard.
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
          className="cosmic-button hover-glow bg-gradient-to-r from-cosmic-purple to-aura-cyan text-white px-8 py-6 text-lg"
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
    nakshatra: string;
  } | null;
  selectedRashi: 'moon' | 'sun' | 'ascendant';
  setSelectedRashi: (rashi: 'moon' | 'sun' | 'ascendant') => void;
  onBirthDetailsSubmit: () => void;
  onRashiConfirm: () => void;
  onComplete: () => void;
  loading: boolean;
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
  onComplete,
  loading,
}) => {
  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      {/* Subtle cosmic background */}
      <CosmicBackground />
      
      <div className="container mx-auto flex min-h-screen items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="cosmic-card border-cosmic-purple/30 bg-cosmic-indigo/20 backdrop-blur-md">
            <CardContent className="pt-8 pb-8">
              {/* Progress indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <motion.div
                      key={s}
                      className={`h-2 rounded-full transition-all ${
                        s <= step
                          ? 'bg-cosmic-gold w-8'
                          : 'bg-cosmic-indigo/50 w-2'
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
                    step={1}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={onBirthDetailsSubmit}
                    loading={loading}
                  />
                )}
                {step === 2 && rashiData && (
                  <RashiConfirmationStep
                    rashiData={rashiData}
                    selectedRashi={selectedRashi}
                    setSelectedRashi={setSelectedRashi}
                    onConfirm={onRashiConfirm}
                    onBack={() => {}}
                    loading={loading}
                  />
                )}
                {step === 3 && (
                  <CompletionStep onComplete={onComplete} loading={loading} />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

