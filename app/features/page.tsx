/**
 * Features Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * Showcase all Jyoti.ai features with R3F hero and GSAP animations
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { CosmicFeatures } from '@/components/sections/Features/CosmicFeatures';
import { Star, Zap, Heart, Brain, Eye, Sparkles } from 'lucide-react';
import { defaultOrganizationSchema, defaultWebSiteSchema } from '@/lib/seo/structured-data';
import Script from 'next/script';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

const features = [
  {
    icon: Star,
    title: 'Kundali Generator',
    description: 'Generate accurate birth charts with D1, D9, D10 divisional charts',
    color: 'text-[#FFD57A]',
  },
  {
    icon: Zap,
    title: 'AI Guru',
    description: 'Chat with your spiritual guide powered by advanced AI',
    color: 'text-cyan-400',
  },
  {
    icon: Heart,
    title: 'Compatibility Analysis',
    description: 'Check relationship compatibility and marriage timing',
    color: 'text-red-400',
  },
  {
    icon: Brain,
    title: 'Career Engine',
    description: 'Discover your ideal career path and business opportunities',
    color: 'text-green-400',
  },
  {
    icon: Eye,
    title: 'Palmistry & Face Reading',
    description: 'AI-powered palmistry and face reading analysis',
    color: 'text-violet-400',
  },
  {
    icon: Sparkles,
    title: 'Aura Scan',
    description: 'Analyze your energy field and chakra balance',
    color: 'text-orange-400',
  },
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingPageShell
        eyebrow="JyotiAI Features"
        title={
          <>
            Everything you need for{' '}
            <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
              modern Jyotish
            </span>
          </>
        }
        description="Your complete spiritual operating system, powered by AI and ancient wisdom."
      >
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-6 hover:border-[#FFD57A]/30 transition-all duration-300"
            >
              <div className="flex flex-col items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`${feature.color} flex-shrink-0`}
                >
                  <feature.icon className="h-12 w-12 md:h-16 md:w-16" />
                </motion.div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-white/70 text-base md:text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cosmic Features Component */}
        <div className="mt-12">
          <CosmicFeatures
            variant="cosmos"
            title="All Features"
            subtitle="Powered by the Universe. Driven by Precision."
            features={undefined as any}
          />
        </div>
      </MarketingPageShell>

      {/* Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(defaultOrganizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(defaultWebSiteSchema),
        }}
      />
    </>
  );
}

