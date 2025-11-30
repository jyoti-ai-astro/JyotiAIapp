/**
 * Guru Chat Page Client Component
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * 
 * Client component for Guru Chat page with cosmic animations
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { CosmicFeatures } from '@/components/sections/Features/CosmicFeatures';
import { CosmicCTA } from '@/components/sections/CTA/CosmicCTA';
// Footer removed - using global FooterWrapper from app/layout.tsx
import { GuruChatShell } from '@/components/guru/GuruChatShell';
import { GuruContextProvider } from '@/components/guru/GuruContextProvider';

export function GuruPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      <GalaxySceneWrapper intensity={0.8} globalFade={globalProgress} />
      <div 
        className="relative z-10 min-h-screen" 
        data-page-enter
        data-page-exit
        data-page-transition="cosmic"
        data-page-content
      >
        {/* Hero Section */}
        <CosmicHero
          variant="guru"
          title="Your AI Spiritual Guide"
          subtitle="Wisdom Meets Technology"
          description="Experience personalized spiritual guidance powered by AI, combining insights from Kundali, Numerology, Aura analysis, and more. Ask questions and receive divine wisdom tailored to your cosmic blueprint."
          primaryCTA={{
            label: 'Start Chatting',
            href: '/guru#chat',
          }}
          secondaryCTA={{
            label: 'Learn More',
            href: '/about',
          }}
        />
        
        {/* Features Section - Highlight Guru */}
        <CosmicFeatures
          variant="guru"
          title="AI Guru Features"
          subtitle="Your Complete Spiritual Assistant"
          features={[
            {
              id: 'ai-guru',
              title: 'AI Guru Chat',
              subtitle: 'Spiritual Guidance Assistant',
              description: 'Get personalized answers to your spiritual questions, combining insights from all Jyoti.ai engines.',
              highlights: [
                'Multi-engine fusion (Kundali + Numerology + Aura)',
                'Context-aware responses',
                'Personalized spiritual guidance',
              ],
              icon: '/guru/guru-icon.png',
              href: '/guru',
              isPremium: false,
              isLocked: false,
            },
            {
              id: 'kundali-insights',
              title: 'Kundali Insights',
              subtitle: 'Vedic Astrology Context',
              description: 'AI Guru understands your birth chart and provides astrological context in responses.',
              highlights: [
                'Birth chart analysis',
                'Planetary influences',
                'Dasha predictions',
              ],
              icon: '/guru/kundali-icon.png',
              href: '/kundali',
              isPremium: false,
              isLocked: false,
            },
            {
              id: 'numerology-fusion',
              title: 'Numerology Fusion',
              subtitle: 'Life Path Integration',
              description: 'Numerology insights seamlessly integrated into AI Guru responses.',
              highlights: [
                'Life path numbers',
                'Destiny calculations',
                'Compatibility analysis',
              ],
              icon: '/guru/numerology-icon.png',
              href: '/numerology',
              isPremium: false,
              isLocked: false,
            },
            {
              id: 'aura-context',
              title: 'Aura Context',
              subtitle: 'Energy Field Awareness',
              description: 'AI Guru considers your aura and chakra state when providing guidance.',
              highlights: [
                'Aura color analysis',
                'Chakra balance',
                'Energy recommendations',
              ],
              icon: '/guru/aura-icon.png',
              href: '/aura',
              isPremium: true,
              isLocked: false,
            },
          ]}
          showPremium={false}
        />
        
        {/* Guru Chat Shell */}
        <GuruContextProvider>
          <GuruChatShell />
        </GuruContextProvider>
        
        {/* CTA Section */}
        <CosmicCTA variant="guru" />
        
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}

