/**
 * Careers Page
 * 
 * Batch 5 - Company Pages
 * 
 * Role cards with apply button (placeholder)
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';
import { CosmicFooter } from '@/components/sections/Footer/CosmicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase } from 'lucide-react';

export default function CareersPage() {
  const roles = [
    {
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      description: 'Build and maintain our spiritual guidance platform using React, Next.js, and Node.js.',
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote',
      description: 'Develop and improve our AI models for astrological predictions and spiritual guidance.',
    },
    {
      title: 'Astrology Content Writer',
      department: 'Content',
      location: 'Remote',
      description: 'Create engaging and accurate content about astrology, numerology, and spirituality.',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      description: 'Design beautiful, intuitive interfaces for our cosmic spiritual platform.',
    },
  ];

  return (
    <PageTransitionWrapper>
      {/* R3F Background */}
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
      <div className="relative z-10 min-h-screen flex items-center justify-center">
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
            <Briefcase className="h-20 w-20 text-gold mx-auto" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">Careers</h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">Join Our Cosmic Mission</p>
        </motion.div>
      </div>

      {/* Roles Grid */}
      <div className="relative z-10 container mx-auto px-4 py-20 space-y-6">
        {roles.map((role, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display text-gold">{role.title}</CardTitle>
                    <CardDescription className="text-white/70 mt-2">
                      {role.department} • {role.location}
                    </CardDescription>
                  </div>
                  <Button
                    className="spiritual-gradient relative overflow-hidden"
                    onClick={(e) => {
                      const button = e.currentTarget;
                      const ripple = document.createElement('span');
                      const rect = button.getBoundingClientRect();
                      const size = Math.max(rect.width, rect.height);
                      const x = e.clientX - rect.left - size / 2;
                      const y = e.clientY - rect.top - size / 2;
                      ripple.style.width = ripple.style.height = `${size}px`;
                      ripple.style.left = `${x}px`;
                      ripple.style.top = `${y}px`;
                      ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
                      button.appendChild(ripple);
                      setTimeout(() => ripple.remove(), 600);
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">{role.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <CosmicFooter />
    </PageTransitionWrapper>
  );
}

