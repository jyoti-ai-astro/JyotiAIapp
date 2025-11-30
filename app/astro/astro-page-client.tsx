/**
 * Astro Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures, FeatureModule } from '@/components/sections/Features/CosmicFeatures';
import { CosmicCTA } from '@/components/sections/CTA/CosmicCTA';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { CosmicContentSection } from '@/components/sections/Content/CosmicContentSection';
import { astroPageContent } from '@/components/sections/Content/content-data';

export function AstroPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      {/* Galaxy Scene Background */}
      <GalaxySceneWrapper intensity={0.8} globalFade={globalProgress} />
      
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
          variant="astro"
          title="Ask the Cosmos. Get the Answer."
          subtitle="Vedic Astrology & Kundali Analysis"
          description="Discover your cosmic blueprint through ancient Vedic wisdom, powered by AI precision. Get your personalized birth chart, planetary positions, dasha predictions, and divine guidance."
          primaryCTA={{
            label: 'Get Your Kundali',
            href: '/kundali',
          }}
          secondaryCTA={{
            label: 'Learn More',
            href: '/about',
          }}
        />

        {/* Features Section - Astrology-first ordering */}
        <CosmicFeatures
          variant="astro"
          title="Astrology Features"
          subtitle="Discover Your Cosmic Blueprint"
          features={[
            {
              id: 'kundali',
              title: 'Kundali Engine',
              subtitle: 'Interactive Birth Chart Wheel',
              description: '3D rotating birth chart with planetary positions, houses, divisional charts (D1/D9/D10), and dasha predictions.',
              highlights: [
                'Interactive 3D rotating birth chart wheel',
                'Planetary positions with degrees, house, nakshatra',
                'House-wise details for all 12 houses (Bhavas)',
                'Dasha + antar-dasha progression timeline',
              ],
              icon: '/features/kundali.png',
              href: '/kundali',
            },
            {
              id: 'numerology',
              title: 'Numerology Engine',
              subtitle: 'Life Path & Destiny Numbers',
              description: 'Calculate your Life Path, Expression, Soul, and Personality numbers.',
              highlights: [
                'Life Path, Destiny, Personality numbers',
                'Digit "fall-in" animation effects',
                'Compatibility scores calculation',
              ],
              icon: '/features/numerology.png',
              href: '/numerology',
            },
          ]}
          showPremium={false}
        />

        {/* Mid-Page Content Sections */}
        <CosmicContentSection blocks={astroPageContent} />

        {/* CTA Section */}
        <CosmicCTA variant="astro" />

        {/* Footer Section */}
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}

