/**
 * Modules Page
 * 
 * Batch 5 - Marketing Pages
 * 
 * Showcase all spiritual modules
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { ModulesSection } from '@/components/sections/Modules/ModulesSection';
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell';

export default function ModulesPage() {
  return (
    <MarketingPageShell
      eyebrow="JyotiAI Modules"
      title={
        <>
          One OS, many{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            cosmic tools
          </span>
        </>
      }
      description="Explore our complete suite of spiritual modules, from kundali generation to AI-powered guidance."
    >
      <ModulesSection />
    </MarketingPageShell>
  );
}

