'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, Shield } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

const valueProps = [
  {
    icon: Sparkles,
    title: 'Vedic-grade accuracy',
    description:
      'Powered by ancient Brihat Parashara Hora Shastra calculations with Swiss Ephemeris precision.',
  },
  {
    icon: Zap,
    title: 'Real-time cosmic insights',
    description:
      'Get instant answers from The Guru AI, personalized predictions, and live dasha timelines.',
  },
  {
    icon: Target,
    title: 'Personalized karmic roadmap',
    description:
      'Discover your life path through numerology, palmistry, aura reading, and compatibility analysis.',
  },
  {
    icon: Shield,
    title: 'Privacy-first spiritual journey',
    description:
      'Your birth details and readings are encrypted. We never share your cosmic data with third parties.',
  },
];

export default function HomeValueProps() {
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
          Why choose{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            JyotiAI
          </span>
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          The only platform that combines ancient wisdom with modern AI for
          truly personalized spiritual guidance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {valueProps.map((prop, index) => {
          const Icon = prop.icon;
          return (
            <motion.div
              key={index}
              variants={fadeUp}
              className="group relative rounded-xl border border-[#FFD57A]/20 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm p-6 hover:border-[#FFD57A]/40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,213,122,0.15)]"
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFD57A]/20 to-[#FFB347]/10 flex items-center justify-center border border-[#FFD57A]/30">
                  <Icon className="w-6 h-6 text-[#FFD57A]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {prop.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

