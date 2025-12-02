'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Clock, MapPin } from 'lucide-react';
import { fadeUp, staggerChildren, softFloat } from '@/src/ui/theme/global-motion';
import { GradientButton } from '@/components/ui/gradient-button';

export default function HomeHero() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh] py-12 lg:py-20">
      {/* Left: Text Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.1)}
        className="space-y-6 lg:space-y-8"
      >
        <motion.div variants={fadeUp} className="space-y-2">
          <p className="text-sm md:text-base font-medium text-[#FFD57A]/80 uppercase tracking-wider">
            JyotiAI • Cosmic Intelligence
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight">
            <span className="block bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
              Astrology, rebuilt
            </span>
            <span className="block text-white mt-2">
              for this digital universe
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
        >
          Experience the convergence of ancient Vedic wisdom and cutting-edge AI.
          Get real-time cosmic insights, personalized karmic guidance, and
          spiritual clarity—all in one intelligent platform.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Link href="/guru">
            <GradientButton className="w-full sm:w-auto px-8 py-4 text-lg">
              Ask the Guru
            </GradientButton>
          </Link>
          <Link href="/features">
            <button className="px-8 py-4 rounded-lg border border-[#FFD57A]/30 bg-[#FFD57A]/5 backdrop-blur-sm text-[#FFD57A] font-semibold text-lg hover:bg-[#FFD57A]/10 hover:border-[#FFD57A]/50 transition-all duration-200">
              Explore Features
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Right: Floating Card Stack */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.15)}
        className="relative h-[500px] lg:h-[600px] hidden lg:block"
      >
        {/* Background Cards (blurred, offset) */}
        <motion.div
          variants={softFloat}
          className="absolute top-8 right-8 w-[280px] h-[200px] rounded-2xl border border-[#FFD57A]/10 bg-[#0A0F1F]/60 backdrop-blur-xl opacity-40"
          style={{
            transform: 'rotate(-3deg)',
            boxShadow: '0 8px 32px rgba(255, 213, 122, 0.1)',
          }}
        />
        <motion.div
          variants={softFloat}
          className="absolute top-16 right-4 w-[280px] h-[200px] rounded-2xl border border-[#FFD57A]/10 bg-[#0A0F1F]/60 backdrop-blur-xl opacity-30"
          style={{
            transform: 'rotate(2deg)',
            boxShadow: '0 8px 32px rgba(255, 213, 122, 0.1)',
          }}
        />

        {/* Main Card */}
        <motion.div
          variants={fadeUp}
          className="absolute top-0 right-0 w-[320px] rounded-2xl border border-[#FFD57A]/30 bg-gradient-to-br from-[#0A0F1F]/90 to-[#1A2347]/90 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(255,213,122,0.25)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD57A] to-[#FFB347] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#0A0F1F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">User from India</p>
              <p className="text-xs text-[#FFD57A]/70">Live karmic insight</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="h-3 bg-[#FFD57A]/20 rounded-full w-3/4" />
            <div className="h-3 bg-[#FFD57A]/15 rounded-full w-full" />
            <div className="h-3 bg-[#FFD57A]/10 rounded-full w-5/6" />
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock className="w-3 h-3" />
            <span>Just now</span>
            <span className="mx-2">•</span>
            <MapPin className="w-3 h-3" />
            <span>Mumbai, India</span>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FFD57A]/5 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>
    </div>
  );
}

