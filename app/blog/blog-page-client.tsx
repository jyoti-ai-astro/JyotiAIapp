/**
 * Blog Page Client Component
 * 
 * Phase 3 — Section 20: PAGES PHASE 5 (F20)
 */

'use client';

import { GalaxySceneWrapper } from '@/components/global/GalaxySceneWrapper';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { CosmicHero } from '@/components/sections/Hero/CosmicHero';
// Footer removed - using global FooterWrapper from app/layout.tsx

export function BlogPageClient() {
  const { globalProgress } = useGlobalProgress();

  return (
    <>
      <GalaxySceneWrapper intensity={0.6} globalFade={globalProgress} />
      <div className="relative z-10 min-h-screen">
        <CosmicHero
          variant="global"
          title="Spiritual Knowledge Base"
          subtitle="Blog & Articles"
          description="Discover articles about Vedic astrology, numerology, palmistry, aura reading, and spiritual guidance. Learn from ancient wisdom and modern insights."
        />
        
        <section id="blog-content" className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-8">Blog Articles</h2>
            <p className="text-lg text-white/80">Blog content coming soon...</p>
          </div>
        </section>
        
        {/* Footer removed - using global FooterWrapper from app/layout.tsx */}
      </div>
    </>
  );
}
