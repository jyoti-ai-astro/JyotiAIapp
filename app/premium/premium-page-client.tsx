/**
 * Premium Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { useEffect } from 'react';
import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures, FeatureModule } from '@/components/sections/Features/CosmicFeatures';
import { CosmicCTA } from '@/components/sections/CTA/CosmicCTA';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { CosmicContentSection } from '@/components/sections/Content/CosmicContentSection';
import { premiumPageContent } from '@/components/sections/Content/content-data';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';

export function PremiumPageClient() {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  
  // Emit premium boost event on page enter (Phase 12 - F27)
  useEffect(() => {
    orchestrator.emitSceneEvent('premium-boost');
  }, [orchestrator]);

  return (
    <>
      <GalaxySceneWrapper intensity={0.7} globalFade={globalProgress} />
      <div 
        className="relative z-10 min-h-screen" 
        data-page-enter
        data-page-exit
        data-page-transition="cosmic"
        data-page-content
      >
        {/* Hero Section */}
        <CosmicHero
          variant="premium"
          title="Your Destiny, Fully Unlocked"
          subtitle="Choose Your Cosmic Path"
          description="Unlock unlimited access to all spiritual engines, advanced predictions, detailed reports, and priority AI Guru guidance. Choose from Free, Standard, or Premium plans."
          primaryCTA={{
            label: 'View Plans',
            href: '/premium#pricing',
          }}
          secondaryCTA={{
            label: 'Start Free Trial',
            href: '/login',
          }}
        />
        
        {/* Features Section - Highlight premium-only features */}
        <CosmicFeatures
          variant="premium"
          title="Premium Features"
          subtitle="Unlock Your Full Cosmic Potential"
          features={[
            {
              id: 'kundali',
              title: 'Kundali Engine',
              subtitle: 'Vedic Birth Chart Analysis',
              description: 'Full access to interactive 3D birth chart, all divisional charts, and advanced dasha predictions.',
              highlights: [
                'Full access to interactive 3D birth chart',
                'All divisional charts (D1/D9/D10)',
                'Advanced dasha predictions',
              ],
              icon: '/features/kundali.png',
              href: '/kundali',
              isPremium: false,
              isLocked: false,
            },
            {
              id: 'numerology',
              title: 'Numerology Engine',
              subtitle: 'Life Path & Destiny Numbers',
              description: 'Complete numerology analysis with all number calculations and compatibility matching.',
              highlights: [
                'Complete numerology analysis',
                'All number calculations',
                'Compatibility matching',
              ],
              icon: '/features/numerology.png',
              href: '/numerology',
              isPremium: false,
              isLocked: false,
            },
            {
              id: 'aura-chakra',
              title: 'Aura & Chakra Scan',
              subtitle: 'Energy Field Analysis',
              description: 'Advanced aura visualization and comprehensive chakra analysis with imbalance warnings.',
              highlights: [
                'Advanced aura visualization',
                'Comprehensive chakra analysis',
                'Energy imbalance warnings',
              ],
              icon: '/features/aura.png',
              href: '/aura',
              isPremium: true,
              isLocked: true,
            },
            {
              id: 'palmistry',
              title: 'Palmistry Scanner',
              subtitle: 'AI-Powered Hand Reading',
              description: 'Unlimited palm scans with detailed line analysis and trait scoring.',
              highlights: [
                'Unlimited palm scans',
                'Detailed line analysis',
                'Trait scoring',
              ],
              icon: '/features/palmistry.png',
              href: '/palmistry',
              isPremium: true,
              isLocked: true,
            },
            {
              id: 'ai-guru',
              title: 'AI Guru Chat',
              subtitle: 'Spiritual Guidance Assistant',
              description: 'Priority AI Guru access with extended context memory and personalized guidance.',
              highlights: [
                'Priority AI Guru access',
                'Extended context memory',
                'Personalized guidance',
              ],
              icon: '/features/guru.png',
              href: '/guru',
              isPremium: true,
              isLocked: true,
            },
            {
              id: 'predictions',
              title: 'Reports + Predictions',
              subtitle: '12-Month Timeline Engine',
              description: 'Unlimited predictions and detailed PDF reports with premium insights.',
              highlights: [
                'Unlimited predictions',
                'Detailed PDF reports',
                'Premium insights',
              ],
              icon: '/features/reports.png',
              href: '/reports',
              isPremium: true,
              isLocked: true,
            },
          ]}
          showPremium={true}
        />
        
        {/* Mid-Page Content Sections */}
        <CosmicContentSection blocks={premiumPageContent} />
        
        {/* CTA Section - Gold Premium Glow */}
        <CosmicCTA variant="premium" />
        {/* Footer Section */}
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}
