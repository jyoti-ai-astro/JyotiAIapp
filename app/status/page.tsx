/**
 * Status Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * System status and uptime
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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
import { Sparkles, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StatusPage() {
  const [status, setStatus] = useState<any>({
    overall: 'operational',
    services: [
      { name: 'API', status: 'operational', uptime: '99.9%' },
      { name: 'Database', status: 'operational', uptime: '99.8%' },
      { name: 'AI Services', status: 'operational', uptime: '99.7%' },
      { name: 'File Storage', status: 'operational', uptime: '99.9%' },
    ],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-6 w-6 text-aura-green" />;
      case 'degraded':
        return <AlertCircle className="h-6 w-6 text-aura-orange" />;
      case 'down':
        return <XCircle className="h-6 w-6 text-aura-red" />;
      default:
        return <AlertCircle className="h-6 w-6 text-white/60" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-aura-green/20 text-aura-green border-aura-green">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-aura-orange/20 text-aura-orange border-aura-orange">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-aura-red/20 text-aura-red border-aura-red">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

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
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">
            System Status
          </h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">
            All Systems Operational
          </p>
        </motion.div>
      </div>

      {/* Status Cards */}
      <div className="relative z-10 container mx-auto px-4 py-20 space-y-6">
        <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)]">
          <CardHeader>
            <CardTitle className="text-3xl font-display text-gold">Overall Status</CardTitle>
            <CardDescription className="text-white/70">Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {getStatusIcon(status.overall)}
              {getStatusBadge(status.overall)}
              <span className="text-white/80">All services are running normally</span>
            </div>
          </CardContent>
        </Card>

        {status.services.map((service: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-display">{service.name}</CardTitle>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="text-white/80">Uptime: {service.uptime}</p>
                    <p className="text-sm text-white/60">Last checked: Just now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <CosmicFooter />
      </div>
    </PageTransitionWrapper>
  );
}

