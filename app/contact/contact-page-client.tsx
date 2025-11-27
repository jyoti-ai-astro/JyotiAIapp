/**
 * Contact Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
import { FooterWrapper } from '@/components/global/FooterWrapper';

export function ContactPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      <GalaxySceneWrapper intensity={0.6} globalFade={globalProgress} />
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <CosmicHero
          variant="contact"
          title="We're Here in the Cosmic Loop"
          subtitle="Get in Touch"
          description="Have questions about your spiritual journey? Need help with your account? Want to share feedback? We're here to help. Reach out through email, social media, or our support channels."
          primaryCTA={{
            label: 'Send Message',
            href: '/contact#form',
          }}
          secondaryCTA={{
            label: 'Visit Support',
            href: '/support',
          }}
        />
        
        <section id="features" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Contact Information</h2>
            <p className="text-lg text-white/80">Contact form and information coming soon...</p>
          </div>
        </section>
        <section id="cta" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Stay Connected</h2>
            <p className="text-lg text-white/80">Social media links coming soon...</p>
          </div>
        </section>
        {/* Footer Section */}
        <FooterWrapper />
      </div>
    </>
  );
}

