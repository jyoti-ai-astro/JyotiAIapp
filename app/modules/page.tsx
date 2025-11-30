/**
 * Modules Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * Showcase all spiritual modules
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
import { ModulesSection } from '@/components/sections/Modules/ModulesSection';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ModulesPage() {
  const heroRef = useRef<HTMLDivElement>(null);

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
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">
            Spiritual Modules
          </h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">
            Explore Our Complete Suite of Tools
          </p>
        </motion.div>
      </div>

      {/* Modules Section */}
      <div className="relative z-10">
        <ModulesSection />
      </div>

      {/* Footer */}
      <div className="relative z-10">
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </PageTransitionWrapper>
  );
}

