/**
 * About Page
 * 
 * Batch 5 - Company Pages
 * 
 * Mission, Vision, Technology, Sacred Sources with R3F background
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
// Footer removed - using global FooterWrapper from app/layout.tsx from '@/components/sections/Footer/CosmicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Target, Eye, Code, Book } from 'lucide-react';

export default function AboutPage() {
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
            <Sparkles className="h-20 w-20 text-gold mx-auto" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">About Jyoti.ai</h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">Your Spiritual Operating System</p>
        </motion.div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 container mx-auto px-4 py-20 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Target className="h-8 w-8 text-gold" />
                <CardTitle className="text-3xl font-display text-gold">Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 text-lg">
              <p>
                To democratize access to ancient spiritual wisdom through modern AI technology, making personalized
                astrological guidance accessible to everyone, regardless of their background or location.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Eye className="h-8 w-8 text-aura-cyan" />
                <CardTitle className="text-3xl font-display text-gold">Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 text-lg">
              <p>
                To become the world&apos;s most trusted spiritual guidance platform, combining the timeless wisdom of
                Vedic astrology, numerology, and palmistry with cutting-edge AI to help millions discover their true
                purpose and navigate life&apos;s challenges with confidence.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Code className="h-8 w-8 text-aura-green" />
                <CardTitle className="text-3xl font-display text-gold">Technology</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 text-lg">
              <p>
                We leverage advanced AI models, Swiss Ephemeris for precise astronomical calculations, and modern
                web technologies to deliver accurate, personalized spiritual insights. Our platform uses React Three
                Fiber for immersive cosmic experiences and real-time data processing for instant results.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Book className="h-8 w-8 text-aura-violet" />
                <CardTitle className="text-3xl font-display text-gold">Sacred Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-white/80 text-lg">
              <p>
                Our calculations are based on ancient Vedic texts including Brihat Parashara Hora Shastra, Jaimini
                Sutras, and classical palmistry texts. We honor the traditional methods while making them accessible
                through modern technology.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
    </PageTransitionWrapper>
  );
}

