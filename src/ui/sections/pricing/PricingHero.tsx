'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

export default function PricingHero() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerChildren(0.1)}
      className="text-center space-y-6 max-w-3xl mx-auto"
    >
      <motion.div variants={fadeUp} className="space-y-2">
        <p className="text-sm md:text-base font-medium text-[#FFD57A]/80 uppercase tracking-wider">
          Plans for every seeker
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            Simple pricing
          </span>
          <span className="block text-white mt-2">
            for cosmic clarity
          </span>
        </h1>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto"
      >
        Choose the plan that fits your spiritual journey. Start free, upgrade
        anytime. Every plan includes access to The Guru, personalized insights,
        and ongoing cosmic guidance.
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-4 pt-4"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD57A]/10 border border-[#FFD57A]/30 text-sm text-[#FFD57A]">
          <Shield className="w-4 h-4" />
          <span>No hidden fees</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD57A]/10 border border-[#FFD57A]/30 text-sm text-[#FFD57A]">
          <Sparkles className="w-4 h-4" />
          <span>Cancel anytime</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

