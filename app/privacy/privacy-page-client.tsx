/**
 * Privacy Page Client Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
// Footer removed - using global FooterWrapper from app/layout.tsx

export function PrivacyPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      <GalaxySceneWrapper intensity={0.5} globalFade={globalProgress} />
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <CosmicHero
          variant="legal"
          title="Privacy Policy"
          subtitle="Your Privacy Matters"
          description="We are committed to protecting your personal information and ensuring your spiritual journey remains private and secure. Learn how we collect, use, and safeguard your data."
        />
        
        <section id="features" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Privacy Information</h2>
            <p className="text-lg text-white/80">Privacy policy content coming soon...</p>
          </div>
        </section>
        <section id="cta" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Questions?</h2>
            <p className="text-lg text-white/80">Contact us for privacy concerns...</p>
          </div>
        </section>
        {/* Footer Section */}
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}
