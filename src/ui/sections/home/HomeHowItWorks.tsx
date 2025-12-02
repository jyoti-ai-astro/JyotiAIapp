'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Cpu, MessageCircle } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

const steps = [
  {
    number: '01',
    icon: User,
    title: 'Share your birth details',
    description:
      'Enter your date, time, and place of birth. Our system calculates your exact planetary positions using Vedic astrology.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Our engine decodes your chart',
    description:
      'Advanced AI processes your kundali, dasha periods, and divisional charts to generate personalized insights.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'You chat with The Guru',
    description:
      'Ask questions, get predictions, and receive spiritual guidance from our AI-powered cosmic advisor.',
  },
];

export default function HomeHowItWorks() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerChildren(0.15)}
      className="space-y-12"
    >
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">
          How{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            JyotiAI
          </span>{' '}
          Works
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Three simple steps to unlock your cosmic destiny.
        </p>
      </motion.div>

      <div className="relative">
        {/* Connecting line (desktop only) */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD57A]/20 via-[#FFB347]/30 to-[#FFD57A]/20 transform -translate-y-1/2" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center space-y-4"
              >
                {/* Step Number Badge */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-[#FFD57A]/40 bg-gradient-to-br from-[#0A0F1F] to-[#1A2347] flex items-center justify-center shadow-[0_0_30px_rgba(255,213,122,0.2)]">
                    <span className="text-2xl font-bold text-[#FFD57A]">
                      {step.number}
                    </span>
                  </div>
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#FFD57A]/20 animate-pulse" />
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FFD57A]/20 to-[#FFB347]/10 flex items-center justify-center border border-[#FFD57A]/30">
                  <Icon className="w-8 h-8 text-[#FFD57A]" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

