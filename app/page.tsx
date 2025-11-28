/**
 * Landing Page
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Full cosmic landing page with Hero, Features, Testimonials, Modules, Astrological Wheel, Roadmap, Footer
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures } from '@/components/sections/Features/CosmicFeatures';
import { TestimonialsSection } from '@/components/sections/Testimonials/TestimonialsSection';
import { ModulesSection } from '@/components/sections/Modules/ModulesSection';
import { PricingCards } from '@/components/sections/Pricing/PricingCards';
import { AstrologicalWheel3D } from '@/components/sections/AstrologicalWheel/AstrologicalWheel3D';
import { RoadmapTimeline } from '@/components/sections/Roadmap/RoadmapTimeline';
import { CosmicFooter } from '@/components/sections/Footer/CosmicFooter';

export default function HomePage() {
  return (
    <PageTransitionWrapper>
      {/* R3F Background - Fixed, Full Screen */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
          <Suspense fallback={null}>
            <NebulaShader intensity={1.0} />
            <ParticleField count={3000} intensity={1.0} />
            <RotatingMandala speed={0.1} intensity={1.0} />
          </Suspense>
        </Canvas>
      </div>

      {/* Cursor & Sound */}
      <CosmicCursor />
      <SoundscapeController />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <CosmicHero
          variant="home"
          title="Your Destiny, Decoded by AI + Ancient Wisdom"
          subtitle="Astrology • Numerology • Aura • Palmistry • Remedies • Predictions"
          description="Experience the perfect fusion of ancient Indian spiritual sciences and cutting-edge AI technology. Get personalized insights, predictions, and guidance tailored to your unique cosmic blueprint."
          primaryCTA={{
            label: 'Start Free Reading',
            href: '/login',
          }}
          secondaryCTA={{
            label: 'Explore Features',
            href: '/features',
          }}
        />

        {/* Features Section */}
        <CosmicFeatures
          variant="home"
          title="Cosmic Features"
          subtitle="Powered by the Universe. Driven by Precision."
        />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Modules Section */}
        <ModulesSection />

        {/* Pricing Section */}
        <PricingCards />

        {/* Astrological Wheel */}
        <AstrologicalWheel3D />

        {/* Roadmap Timeline */}
        <RoadmapTimeline />

        {/* Footer */}
        <CosmicFooter />
      </div>
    </PageTransitionWrapper>
  );
}
