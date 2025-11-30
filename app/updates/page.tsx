/**
 * Updates Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * Product updates and changelog
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
// Footer removed - using global FooterWrapper from app/layout.tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function UpdatesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const updatesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    updatesRef.current.forEach((update, index) => {
      if (update) {
        gsap.fromTo(
          update,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: update,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 1,
            },
          }
        );
      }
    });
  }, []);

  const updates = [
    {
      version: 'v6.1',
      date: '2024-01-15',
      title: 'Cosmic UI Redesign',
      description: 'Complete redesign with R3F backgrounds, cosmic animations, and enhanced user experience.',
      features: ['New cosmic color palette', 'R3F nebula backgrounds', 'Enhanced animations'],
    },
    {
      version: 'v6.0',
      date: '2023-12-01',
      title: 'AI Guru Enhancement',
      description: 'Improved AI Guru with better context understanding and spiritual guidance.',
      features: ['Enhanced AI responses', 'Better context awareness', 'Improved accuracy'],
    },
    {
      version: 'v5.9',
      date: '2023-11-15',
      title: 'Palmistry & Face Reading',
      description: 'Added AI-powered palmistry and face reading analysis features.',
      features: ['Palmistry analysis', 'Face reading', 'AI vision integration'],
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
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">
            Product Updates
          </h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">
            Stay Updated with Latest Features
          </p>
        </motion.div>
      </div>

      {/* Updates List */}
      <div className="relative z-10 container mx-auto px-4 py-20 space-y-8">
        {updates.map((update, index) => (
          <motion.div
            key={index}
            ref={(el) => {
              if (el) updatesRef.current[index] = el;
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-display text-gold">{update.title}</CardTitle>
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <CardDescription className="text-gold text-lg">{update.version}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-lg">{update.description}</p>
                <div>
                  <p className="text-gold font-semibold mb-2">New Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-white/70">
                    {update.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
    </PageTransitionWrapper>
  );
}

