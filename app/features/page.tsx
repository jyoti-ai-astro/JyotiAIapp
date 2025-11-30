/**
 * Features Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * Showcase all Jyoti.ai features with R3F hero and GSAP animations
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';
import { CosmicFeatures } from '@/components/sections/Features/CosmicFeatures';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Star, Zap, Heart, Brain, Eye } from 'lucide-react';
import { defaultOrganizationSchema, defaultWebSiteSchema } from '@/lib/seo/structured-data';
import Script from 'next/script';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FeaturesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // GSAP scroll animations
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 1,
            },
          }
        );
      }
    });
  }, []);

  const features = [
    {
      icon: Star,
      title: 'Kundali Generator',
      description: 'Generate accurate birth charts with D1, D9, D10 divisional charts',
      color: 'text-gold',
    },
    {
      icon: Zap,
      title: 'AI Guru',
      description: 'Chat with your spiritual guide powered by advanced AI',
      color: 'text-aura-cyan',
    },
    {
      icon: Heart,
      title: 'Compatibility Analysis',
      description: 'Check relationship compatibility and marriage timing',
      color: 'text-aura-red',
    },
    {
      icon: Brain,
      title: 'Career Engine',
      description: 'Discover your ideal career path and business opportunities',
      color: 'text-aura-green',
    },
    {
      icon: Eye,
      title: 'Palmistry & Face Reading',
      description: 'AI-powered palmistry and face reading analysis',
      color: 'text-aura-violet',
    },
    {
      icon: Sparkles,
      title: 'Aura Scan',
      description: 'Analyze your energy field and chakra balance',
      color: 'text-aura-orange',
    },
  ];

  return (
    <PageTransitionWrapper>
      {/* R3F Hero Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
          <Suspense fallback={null}>
            <NebulaShader intensity={1.0} />
            <ParticleField count={3000} intensity={1.0} />
            <RotatingMandala speed={0.1} intensity={0.8} />
          </Suspense>
        </Canvas>
      </div>

      <CosmicCursor />
      <SoundscapeController />

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 px-4"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="h-20 w-20 text-gold mx-auto" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-display font-bold text-white">
            Powerful Features
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gold font-heading">
            Your Complete Spiritual Operating System
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-12 sm:space-y-16 lg:space-y-20">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            ref={(el) => {
              if (el) sectionsRef.current[index] = el;
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(110,45,235,0.3)]"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`${feature.color} flex-shrink-0`}
              >
                <feature.icon className="h-12 w-12 sm:h-16 sm:w-16" />
              </motion.div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-gold mb-2 sm:mb-4">{feature.title}</h2>
                <p className="text-white/80 text-base sm:text-lg">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cosmic Features Component */}
      <div className="relative z-10">
        <CosmicFeatures
          variant="cosmos"
          title="All Features"
          subtitle="Powered by the Universe. Driven by Precision."
          features={undefined as any} // Will use default features from component
        />
      </div>

      {/* Footer */}
      <div className="relative z-10">
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>

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
    </PageTransitionWrapper>
  );
}

