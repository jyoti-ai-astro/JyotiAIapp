/**
 * Pricing Cards Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Three pricing cards: Starter, Advanced, Supreme with levitation effect and glow on hover
 */

'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PricingComparisonTable } from './PricingComparisonTable';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  isPremium?: boolean;
  badge?: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹499',
    description: 'Perfect for exploring core Jyoti features',
    features: [
      'Basic Kundali Chart',
      'Daily Horoscope',
      'Basic Numerology',
      'AI Guru – up to 5 questions/day',
    ],
    cta: 'Get Started',
    href: '/login',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '₹999',
    description: 'For serious spiritual seekers',
    features: [
      'Everything in Starter',
      'Full Kundali Analysis',
      'Palmistry & Face Reading',
      'Aura Scan',
      '12-Month Predictions',
    ],
    cta: 'Upgrade to Advanced',
    href: '/login',
  },
  {
    id: 'supreme',
    name: 'Supreme',
    price: '₹1,999',
    description: 'Complete spiritual operating system',
    features: [
      'Everything in Advanced',
      'Career & Business Engine',
      'Pregnancy Insights',
      'Compatibility Analysis',
      'Advanced Reports (PDF)',
      'Priority Support',
    ],
    cta: 'Go Supreme',
    href: '/login',
    isPremium: true,
  },
];

const oneTimePlans: PricingTier[] = [
  {
    id: 'quick-readings',
    name: 'Quick Readings',
    price: '₹99',
    period: 'one-time',
    badge: 'No Subscription',
    description: 'Perfect for quick answers and first-time users.',
    features: [
      'Daily Horoscope (7 days)',
      'Name Correction / Name Numerology',
      'One AI Guru Question',
      'Lucky Number & Color',
    ],
    cta: 'Buy for ₹99',
    href: '/pay/99',
  },
  {
    id: 'deep-insights',
    name: 'Deep Insights',
    price: '₹199',
    period: 'one-time',
    badge: 'Most Popular',
    description: 'Deeper insights without a monthly plan.',
    features: [
      'Kundali Report (Basic)',
      'Relationship Compatibility (Lite)',
      'Career Reading (Lite)',
      '3 AI Guru Questions',
    ],
    cta: 'Buy for ₹199',
    href: '/pay/199',
  },
];

export function PricingCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="cosmic-section"
    >
      <div className="cosmic-section-inner">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="cosmic-subheading">Pricing Plans</p>
          <h2 className="cosmic-heading">Flexible pricing for every spiritual journey</h2>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <Card
                className={cn(
                  'glass-card text-white h-full transition-all duration-300',
                  tier.isPremium && 'border-gold/80 shadow-[0_0_50px_rgba(242,201,76,0.4)] scale-[1.02]'
                )}
              >
                {(tier.isPremium || tier.badge) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className={cn(
                        'px-4 py-1',
                        tier.isPremium
                          ? 'bg-gold text-cosmic-navy'
                          : 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      )}
                    >
                      {tier.badge && <Sparkles className="h-3 w-3 mr-1" />}
                      {tier.badge || 'Most Popular'}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-display text-gold mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-2xl md:text-3xl font-heading font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-white/60 text-sm">
                      {tier.period === 'one-time' ? '/one-time' : '/month'}
                    </span>
                  </div>
                  <CardDescription className="text-white/70">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-aura-green flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.href} className={tier.isPremium ? 'gold-btn block w-full text-center' : 'gold-btn-outline block w-full text-center'}>
                    {tier.cta}
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* One-Time Readings Section */}
        <div className="mt-16 md:mt-20 pt-16 border-t border-white/10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="cosmic-subheading mb-2">One-Time Readings</p>
            <h2 className="text-2xl md:text-3xl font-heading text-gold mb-3">
              No Subscription Needed
            </h2>
            <p className="mt-3 text-sm md:text-base text-white/70 max-w-2xl mx-auto">
              Perfect for quick questions, first-time users, or gifting a single powerful reading.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {oneTimePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <Card className="glass-card text-white h-full transition-all duration-300">
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge
                        className={cn(
                          'px-4 py-1',
                          plan.badge === 'Most Popular'
                            ? 'bg-gold text-cosmic-navy'
                            : 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                        )}
                      >
                        {plan.badge === 'Most Popular' && <Sparkles className="h-3 w-3 mr-1" />}
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-display text-gold mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline justify-center gap-2 mb-4">
                      <span className="text-5xl font-display font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-white/60">/one-time</span>
                    </div>
                    <CardDescription className="text-white/70">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-aura-green flex-shrink-0 mt-0.5" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href} className="gold-btn block w-full text-center py-6">
                      {plan.cta}
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Comparison Table */}
        <PricingComparisonTable />
      </div>
    </section>
  );
}

