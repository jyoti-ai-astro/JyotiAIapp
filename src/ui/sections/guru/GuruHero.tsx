'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Users, MapPin } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import AnimatedShaderHero from '@/components/ui/animated-shader-hero';

export default function GuruHero() {
  const scrollToChat = () => {
    const el = document.getElementById('guru-console');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[70vh] flex items-center">
      {/* Background: AnimatedShaderHero with reduced opacity */}
      <div className="absolute inset-0 z-0 opacity-40">
        <AnimatedShaderHero
          trustBadge={{
            text: 'Powered by JyotiAI · AstroContext · Pinecone RAG',
            icons: ['✨', '🪐', '📡'],
          }}
          headline={{
            line1: '',
            line2: '',
          }}
          subtitle=""
          buttons={undefined}
        />
      </div>

      {/* Foreground Content */}
      <div className="page-container relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren(0.1)}
            className="space-y-6"
          >
            <motion.div variants={fadeUp} className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD57A]/10 border border-[#FFD57A]/30 text-sm font-medium text-[#FFD57A]">
                <Sparkles className="w-4 h-4" />
                <span>JyotiAI • Ask The Cosmic Guru</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
                <span className="block bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
                  Ask The Cosmic Guru
                </span>
                <span className="block text-white mt-2">
                  Guidance from your birth stars
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-white/70 leading-relaxed space-y-2"
            >
              <span className="block">
                AI-powered Jyotish that understands your kundali, dasha periods,
                and karmic patterns.
              </span>
              <span className="block">
                Get instant insights on career, relationships, money, and
                destiny—built for this digital yuga.
              </span>
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <GradientButton
                onClick={scrollToChat}
                className="w-full sm:w-auto px-8 py-4 text-lg"
              >
                Start a Session
              </GradientButton>
              <Link href="/features">
                <button className="px-8 py-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                  See how it works
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Stats Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:flex justify-end"
          >
            <div className="rounded-2xl border border-[#FFD57A]/30 bg-gradient-to-br from-[#0A0F1F]/90 to-[#1A2347]/80 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(255,213,122,0.25)] max-w-sm w-full">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-[#FFD57A]/70 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Live sessions today</span>
                  </div>
                  <p className="text-3xl font-bold text-white">128+</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#FFD57A]/70 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Average reply time</span>
                  </div>
                  <p className="text-3xl font-bold text-white">&lt; 5s</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Users mostly from India</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

