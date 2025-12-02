'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Crown } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';
import { GradientButton } from '@/components/ui/gradient-button';

const plans = [
  {
    icon: Sparkles,
    label: 'Free Explorer',
    title: 'Start your journey',
    description: '3 questions with The Guru, basic kundali insights, and limited predictions.',
    badge: 'Free',
  },
  {
    icon: Crown,
    label: 'JyotiAI Premium',
    title: 'Unlock everything',
    description: 'Unlimited Guru chats, advanced predictions, priority queue, and detailed reports.',
    badge: 'Premium',
    featured: true,
  },
];

export default function HomePricingTeaser() {
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
          Start free, upgrade anytime. No hidden fees, cancel whenever you want.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={index}
              variants={fadeUp}
              className={`relative rounded-2xl border ${
                plan.featured
                  ? 'border-[#FFD57A]/40 bg-gradient-to-br from-[#0A0F1F]/90 to-[#1A2347]/80 shadow-[0_8px_32px_rgba(255,213,122,0.25)]'
                  : 'border-[#FFD57A]/20 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60'
              } backdrop-blur-sm p-8 hover:border-[#FFD57A]/50 transition-all duration-300`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD57A] to-[#FFB347] text-[#0A0F1F] text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      plan.featured
                        ? 'bg-gradient-to-br from-[#FFD57A] to-[#FFB347]'
                        : 'bg-[#FFD57A]/20 border border-[#FFD57A]/30'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        plan.featured ? 'text-[#0A0F1F]' : 'text-[#FFD57A]'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#FFD57A]/70">
                      {plan.label}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {plan.badge}
                    </p>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white">{plan.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {plan.description}
                </p>
              </div>
            </motion.div>
          );
        })}
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

