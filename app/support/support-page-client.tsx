/**
 * Support Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
// Footer removed - using global FooterWrapper from app/layout.tsx

export function SupportPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      <GalaxySceneWrapper intensity={0.6} globalFade={globalProgress} />
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <CosmicHero
          variant="support"
          title="Guided Help from the Cosmos"
          subtitle="Support & Help Center"
          description="Find answers to your questions, get help with your account, learn about our features, and discover how to make the most of your spiritual journey with Jyoti.ai."
          primaryCTA={{
            label: 'Browse FAQ',
            href: '/support#faq',
          }}
          secondaryCTA={{
            label: 'Contact Support',
            href: '/contact',
          }}
        />
        
        <section id="features" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Support Categories</h2>
            <p className="text-lg text-white/80">Support categories and FAQ coming soon...</p>
          </div>
        </section>
        <section id="cta" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Need More Help?</h2>
            <p className="text-lg text-white/80">Contact our support team...</p>
          </div>
        </section>
        {/* Footer Section */}
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}

