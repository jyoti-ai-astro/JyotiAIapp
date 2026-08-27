'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Ticket } from 'lucide-react';
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
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-saffron md:text-base">
          JyotiAI pricing
        </p>
        <h1 className="font-heading text-4xl font-semibold leading-tight text-primary md:text-5xl lg:text-6xl">
          Start free. Pay only when you need deeper guidance.
        </h1>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
      >
        Complete onboarding and generate your first basic Kundali for free. Choose a one-time reading pack for a specific need, or subscribe for ongoing access.
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-3 pt-4"
      >
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-jyoti-gold/35 bg-jyoti-gold/12 px-4 py-2 text-sm font-medium text-primary">
          <Shield className="h-4 w-4 text-saffron" aria-hidden="true" />
          <span>No hidden fees</span>
        </div>
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-jyoti-gold/35 bg-jyoti-gold/12 px-4 py-2 text-sm font-medium text-primary">
          <Ticket className="h-4 w-4 text-saffron" aria-hidden="true" />
          <span>One-time packs available</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
