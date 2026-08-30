'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Ticket } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

export default function PricingHero() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.1)} className="mx-auto max-w-4xl space-y-6 text-center">
      <motion.div variants={fadeUp} className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772] md:text-sm">JyotiAI pricing</p>
        <h1 className="font-heading text-4xl font-medium leading-[1.03] tracking-[-0.02em] text-[#fff6df] md:text-6xl lg:text-7xl">
          Start free. Pay only when you need deeper guidance.
        </h1>
      </motion.div>

      <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-base leading-8 text-[#aab5b2] md:text-xl">
        Complete onboarding and generate your first basic Kundali for free. Choose a one-time reading pack for a specific need, or subscribe for ongoing access.
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 pt-3">
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-[#d9b75f]/30 bg-[#d9b75f]/[0.07] px-4 py-2 text-sm font-medium text-[#f3eadb]">
          <Shield className="h-4 w-4 text-[#efaa4f]" aria-hidden="true" />
          <span>No hidden fees</span>
        </div>
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-[#d9b75f]/30 bg-[#d9b75f]/[0.07] px-4 py-2 text-sm font-medium text-[#f3eadb]">
          <Ticket className="h-4 w-4 text-[#efaa4f]" aria-hidden="true" />
          <span>One-time packs available</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
