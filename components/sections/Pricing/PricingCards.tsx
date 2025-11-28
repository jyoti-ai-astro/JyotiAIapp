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

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  isPremium?: boolean;
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

export function PricingCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-20 md:py-32"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white">
            Pricing Plans
          </h2>
          <p className="text-xl md:text-2xl text-gold font-heading">
            Flexible pricing for every spiritual journey
          </p>
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
                  'bg-cosmic-indigo/80 backdrop-blur-sm border text-white h-full transition-all duration-300',
                  tier.isPremium
                    ? 'border-gold/50 shadow-[0_0_30px_rgba(242,201,76,0.3)]'
                    : 'border-cosmic-purple/30 hover:border-cosmic-purple/50'
                )}
              >
                {tier.isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gold text-cosmic-navy px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-display text-gold mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-display font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-white/60">/month</span>
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
                  <Link href={tier.href} className="block">
                    <Button
                      className={cn(
                        'w-full text-lg py-6',
                        tier.isPremium
                          ? 'bg-gold text-cosmic-navy hover:bg-gold-light'
                          : 'bg-cosmic-purple/50 text-white hover:bg-cosmic-purple/70'
                      )}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

