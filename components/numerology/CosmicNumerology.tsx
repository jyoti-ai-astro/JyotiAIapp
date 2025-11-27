/**
 * Cosmic Numerology Component
 * 
 * Master Plan v1.0 - Section 3.7: Numerology Page
 * Cosmic-themed numerology calculator with animated number cards
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { Hash, Sparkles, Calculator } from 'lucide-react';
import type { NumerologyProfile } from '@/lib/engines/numerology/calculator';

interface CosmicNumerologyProps {
  formData: {
    fullName: string;
    birthDate: string;
    mobileNumber: string;
    vehicleNumber: string;
    houseNumber: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  calculating: boolean;
  profile: NumerologyProfile | null;
}

// Animated Number Card
function NumberCard({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10 p-6 rounded-xl text-center hover-glow"
    >
      <p className="text-sm text-aura-cyan mb-2">{label}</p>
      <motion.p
        className="text-5xl font-bold text-cosmic-gold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 300 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}

export const CosmicNumerology: React.FC<CosmicNumerologyProps> = ({
  formData,
  setFormData,
  onSubmit,
  calculating,
  profile,
}) => {
  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      <CosmicBackground />
      
      <div className="container mx-auto p-6 space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Hash className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-cosmic-gold">
            Numerology Analysis
          </h1>
          <p className="text-aura-cyan max-w-2xl mx-auto">
            Discover the hidden meanings behind your name and numbers
          </p>
        </motion.div>

        {/* Input Form */}
        {!profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-blue flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Calculate Your Numerology
                </CardTitle>
                <CardDescription className="text-aura-cyan">
                  Enter your details to discover your numerology profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="Enter your full name"
                      className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      required
                      className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Mobile Number (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="e.g., +91 9876543210"
                      className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      Vehicle Number (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="e.g., DL 01 AB 1234"
                      className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-aura-cyan">
                      House Number (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      placeholder="e.g., 123 or A-45"
                      className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={calculating}
                    className="cosmic-button w-full hover-glow bg-gradient-to-r from-cosmic-purple to-aura-cyan text-white"
                  >
                    {calculating ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Calculating...
                      </span>
                    ) : (
                      'Calculate Numerology'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Core Numbers */}
            <Card className="cosmic-card border-cosmic-gold/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-cosmic-gold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your Core Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <NumberCard label="Life Path Number" value={profile.lifePathNumber} delay={0.1} />
                  <NumberCard label="Destiny Number" value={profile.destinyNumber} delay={0.2} />
                  <NumberCard label="Expression Number" value={profile.expressionNumber} delay={0.3} />
                  <NumberCard label="Soul Urge Number" value={profile.soulUrgeNumber} delay={0.4} />
                  <NumberCard label="Personality Number" value={profile.personalityNumber} delay={0.5} />
                  <NumberCard label="Birthday Number" value={profile.birthdayNumber} delay={0.6} />
                </div>
              </CardContent>
            </Card>

            {/* Mobile Number Analysis */}
            {profile.mobileNumber && (
              <Card className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-green">Mobile Number Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-cosmic-indigo/5">
                    <span className="text-aura-cyan">Number</span>
                    <span className="text-white font-semibold">{profile.mobileNumber.number}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-cosmic-indigo/5">
                    <span className="text-aura-cyan">Single Digit</span>
                    <span className="text-3xl font-bold text-cosmic-gold">
                      {profile.mobileNumber.singleDigit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-cosmic-indigo/5">
                    <span className="text-aura-cyan">Lucky</span>
                    <span className={profile.mobileNumber.isLucky ? 'text-aura-green' : 'text-aura-red'}>
                      {profile.mobileNumber.isLucky ? 'Yes ✓' : 'No ✗'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-cosmic-indigo/5">
                    <p className="text-sm text-aura-cyan mb-2">Compatibility</p>
                    <p className="text-white">{profile.mobileNumber.compatibility}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatibility */}
            {profile.compatibility && (
              <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-violet">Compatibility Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-aura-cyan mb-3">Best Numbers</p>
                      <div className="flex gap-2 flex-wrap">
                        {profile.compatibility.bestNumbers.map((num) => (
                          <motion.span
                            key={num}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-2 rounded-full bg-aura-green/20 border border-aura-green/50 text-aura-green font-semibold"
                          >
                            {num}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-aura-cyan mb-3">Challenging Numbers</p>
                      <div className="flex gap-2 flex-wrap">
                        {profile.compatibility.challengingNumbers.map((num) => (
                          <motion.span
                            key={num}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-2 rounded-full bg-aura-red/20 border border-aura-red/50 text-aura-red font-semibold"
                          >
                            {num}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

