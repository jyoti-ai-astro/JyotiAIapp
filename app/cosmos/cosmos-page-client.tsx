/**
 * Cosmos Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures } from '@/components/sections/Features/CosmicFeatures';
import { CosmicCTA } from '@/components/sections/CTA/CosmicCTA';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { CosmicContentSection } from '@/components/sections/Content/CosmicContentSection';
import { cosmosPageContent } from '@/components/sections/Content/content-data';

export function CosmosPageClient() {
  return (
    <div 
        className="relative z-10 min-h-screen" 
        data-page-enter
        data-page-exit
        data-page-transition="cosmic"
        data-page-content
      >
        {/* Hero Section */}
        <CosmicHero
          variant="cosmos"
          title="Powered by the Universe. Driven by Precision."
          subtitle="Cosmic Features Showcase"
          description="Experience the full power of Jyoti.ai's spiritual engines: Kundali Engine, Numerology Engine, Aura & Chakra Scan, Palmistry Scanner, AI Guru Chat, and Predictive Reports."
          primaryCTA={{
            label: 'Explore Features',
            href: '/dashboard',
          }}
          secondaryCTA={{
            label: 'View Pricing',
            href: '/premium',
          }}
        />
        
        {/* Features Section - Full List (All 6 features) */}
        <CosmicFeatures
          variant="cosmos"
          title="All Cosmic Features"
          subtitle="Powered by the Universe. Driven by Precision."
          showPremium={true}
        />
        
        {/* Mid-Page Content Sections */}
        <CosmicContentSection blocks={cosmosPageContent} />
        
        {/* CTA Section */}
        <CosmicCTA variant="cosmos" />
        {/* Footer Section */}
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
  );
}
