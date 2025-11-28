/**
 * Press Kit Page
 * 
 * Batch 5 - Company Pages
 * 
 * Download buttons for logos, brand assets
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
import { Sparkles, Download, Image, FileText } from 'lucide-react';

export default function PressKitPage() {
  const assets = [
    {
      name: 'Logo - Light Background',
      type: 'Image',
      format: 'PNG',
      size: '2.5 MB',
      icon: Image,
    },
    {
      name: 'Logo - Dark Background',
      type: 'Image',
      format: 'PNG',
      size: '2.5 MB',
      icon: Image,
    },
    {
      name: 'Brand Guidelines',
      type: 'Document',
      format: 'PDF',
      size: '5.2 MB',
      icon: FileText,
    },
    {
      name: 'Icon Set',
      type: 'Image',
      format: 'SVG',
      size: '1.8 MB',
      icon: Image,
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
            <Sparkles className="h-20 w-20 text-gold mx-auto" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">Press Kit</h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">Brand Assets & Resources</p>
        </motion.div>
      </div>

      {/* Assets Grid */}
      <div className="relative z-10 container mx-auto px-4 py-20 space-y-6">
        {assets.map((asset, index) => (
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
                  <div className="flex items-center gap-4">
                    <asset.icon className="h-8 w-8 text-gold" />
                    <div>
                      <CardTitle className="text-xl font-display text-gold">{asset.name}</CardTitle>
                      <CardDescription className="text-white/70">
                        {asset.type} • {asset.format} • {asset.size}
                      </CardDescription>
                    </div>
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
                      // Placeholder download
                      alert(`Downloading ${asset.name}...`);
                    }}
                  >
                    <Download className="inline-block mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <CosmicFooter />
    </PageTransitionWrapper>
  );
}

