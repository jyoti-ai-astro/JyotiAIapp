'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp } from '@/src/ui/theme/global-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import { Shield, Sparkles } from 'lucide-react';

export default function HomeFinalCTA() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeUp}
      className="relative rounded-3xl border border-[#FFD57A]/30 bg-gradient-to-br from-[#0A0F1F]/90 to-[#1A2347]/80 backdrop-blur-xl p-12 md:p-16 text-center space-y-8 shadow-[0_8px_32px_rgba(255,213,122,0.15)]"
    >
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-[#FFD57A]/10 blur-2xl" />
      <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-[#4B1E92]/10 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD57A] to-[#FFB347] flex items-center justify-center shadow-[0_0_30px_rgba(255,213,122,0.4)]">
            <Sparkles className="w-8 h-8 text-[#0A0F1F]" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight">
          Your stars are talking.
          <br />
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            Are you listening?
          </span>
        </h2>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
          Join thousands of seekers discovering their cosmic destiny with
          JyotiAI. Privacy-first, AI-powered, Vedic-accurate.
        </p>

        <div className="pt-4">
          <Link href="/dashboard">
            <GradientButton className="px-10 py-5 text-lg md:text-xl">
              Open JyotiAI Dashboard
            </GradientButton>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-white/50 pt-4">
          <Shield className="w-4 h-4" />
          <span>End-to-end encrypted • 100% private • Vedic-grade accuracy</span>
        </div>
      </div>
    </motion.div>
  );
}

