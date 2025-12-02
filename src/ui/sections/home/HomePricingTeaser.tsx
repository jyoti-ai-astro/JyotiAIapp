'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Zap } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import { getAllSubscriptionPlans, getAllOneTimeProducts } from '@/lib/pricing/plans';

export default function HomePricingTeaser() {
  const subscriptionPlans = getAllSubscriptionPlans();
  const oneTimeProducts = getAllOneTimeProducts();
  const starterPlan = subscriptionPlans.find(p => p.id === 'starter');
  const supremePlan = subscriptionPlans.find(p => p.id === 'supreme');
  const quickReading = oneTimeProducts.find(p => p.id === 'quick_99');

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerChildren(0.1)}
      className="space-y-8"
    >
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">
          Simple plans when you're{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            ready
          </span>
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Monthly subscriptions starting at {starterPlan?.priceLabel}{starterPlan?.period}. 
          Not ready for a subscription? Try a one-time Quick Reading from ₹99.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {starterPlan && (
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-[#FFD57A]/20 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8 hover:border-[#FFD57A]/50 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#FFD57A]/20 border border-[#FFD57A]/30">
                  <Sparkles className="w-6 h-6 text-[#FFD57A]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#FFD57A]/70">
                    {starterPlan.badge}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {starterPlan.name}
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white">{starterPlan.name}</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {starterPlan.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#FFD57A]">{starterPlan.priceLabel}</span>
                <span className="text-sm text-white/60">{starterPlan.period}</span>
              </div>
            </div>
          </motion.div>
        )}

        {supremePlan && (
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-[#FFD57A]/40 bg-gradient-to-br from-[#0A0F1F]/90 to-[#1A2347]/80 shadow-[0_8px_32px_rgba(255,213,122,0.25)] backdrop-blur-sm p-8 hover:border-[#FFD57A]/50 transition-all duration-300"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#0A0F1F] text-xs font-semibold">
                {supremePlan.badge}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#FFD57A] to-[#FFB347]">
                  <Crown className="w-6 h-6 text-[#0A0F1F]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#FFD57A]/70">
                    Complete OS
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {supremePlan.name}
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white">{supremePlan.name}</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {supremePlan.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#FFD57A]">{supremePlan.priceLabel}</span>
                <span className="text-sm text-white/60">{supremePlan.period}</span>
              </div>
            </div>
          </motion.div>
        )}

        {quickReading && (
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-[#FFD57A]/20 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-8 hover:border-[#FFD57A]/50 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#FFD57A]/20 border border-[#FFD57A]/30">
                  <Zap className="w-6 h-6 text-[#FFD57A]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#FFD57A]/70">
                    One-Time
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {quickReading.name}
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white">{quickReading.name}</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {quickReading.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#FFD57A]">₹{quickReading.amountInINR}</span>
                <span className="text-sm text-white/60">one-time</span>
              </div>
              <Link href={`/pay/${quickReading.productId}`}>
                <button className="w-full mt-4 rounded-xl bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#0A0F1F] font-semibold py-3 hover:scale-[1.02] transition-transform">
                  Get {quickReading.name}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div variants={fadeUp} className="text-center pt-4">
        <Link href="/pricing">
          <GradientButton className="px-8 py-4 text-lg">
            View full pricing
          </GradientButton>
        </Link>
      </motion.div>
    </motion.div>
  );
}
