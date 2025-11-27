/**
 * About Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures, FeatureModule } from '@/components/sections/Features/CosmicFeatures';
import { CosmicCTA } from '@/components/sections/CTA/CosmicCTA';
import { FooterWrapper } from '@/components/global/FooterWrapper';
import { CosmicContentSection } from '@/components/sections/Content/CosmicContentSection';
import { aboutPageContent } from '@/components/sections/Content/content-data';

export function AboutPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      <GalaxySceneWrapper intensity={0.6} globalFade={globalProgress} />
      <div 
        className="relative z-10 min-h-screen" 
        data-page-enter
        data-page-exit
        data-page-transition="cosmic"
        data-page-content
      >
        {/* Hero Section */}
        <CosmicHero
          variant="about"
          title="A Story Written in the Stars"
          subtitle="Vision + Mission + Divinity"
          description="Jyoti.ai is not just an app—it's a spiritual experience. We combine ancient Vedic wisdom with modern AI technology to create a sacred cosmic chamber where AI, astrology, and divine energy blend into one."
          primaryCTA={{
            label: 'Explore Our Vision',
            href: '/about#mission',
          }}
          secondaryCTA={{
            label: 'Contact Us',
            href: '/contact',
          }}
        />
        
        {/* Features Section - Minimal 3-card cosmic highlight */}
        <CosmicFeatures
          variant="about"
          title="Our Spiritual Journey"
          subtitle="A Story Written in the Stars"
          maxFeatures={3}
          showPremium={false}
        />
        
        {/* Mid-Page Content Sections */}
        <CosmicContentSection blocks={aboutPageContent} />
        
        {/* CTA Section - Divine Fade (Soft) */}
        <CosmicCTA variant="about" />
        {/* Footer Section */}
        <FooterWrapper />
      </div>
    </>
  );
}
