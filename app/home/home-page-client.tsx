/**
 * Home Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures } from '@/components/sections/Features/CosmicFeatures';
import { CosmicCTA } from '@/components/sections/CTA/CosmicCTA';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { CosmicContentSection } from '@/components/sections/Content/CosmicContentSection';
import { homePageContent } from '@/components/sections/Content/content-data';

export function HomePageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      {/* Galaxy Scene Background */}
      <GalaxySceneWrapper intensity={1.0} globalFade={globalProgress} />
      
      {/* Page Content */}
      <div 
        className="relative z-10 min-h-screen" 
        data-page-enter
        data-page-exit
        data-page-transition="cosmic"
        data-page-content
      >
        {/* Hero Section */}
        <CosmicHero
          variant="home"
          title="Your Destiny, Decoded by AI + Ancient Wisdom"
          subtitle="The Cosmic Interface to Your Destiny"
          description="Astrology • Numerology • Aura • Palmistry • Remedies • Predictions"
          primaryCTA={{
            label: 'Start Free Reading',
            href: '/login',
          }}
          secondaryCTA={{
            label: 'Explore Features',
            href: '/cosmos',
          }}
        />

        {/* Features Section - Primary 5-card showcase */}
        <CosmicFeatures
          variant="home"
          title="Cosmic Features"
          subtitle="Experience the Power of Ancient Wisdom + AI"
          maxFeatures={5}
          showPremium={false}
        />

        {/* Mid-Page Content Sections */}
        <CosmicContentSection blocks={homePageContent} />

        {/* CTA Section - Highest Intensity */}
        <CosmicCTA variant="home" />

        {/* Footer Section */}
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}

