/**
 * Guru Chat Page Client Component
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * 
 * Client component for Guru Chat page with Super Cosmic UI
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeBanner } from '@/components/ui/upgrade-banner';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat';
import GuruHero from '@/src/ui/sections/guru/GuruHero';
import GuruLayoutShell from '@/src/ui/sections/guru/GuruLayoutShell';
import { useUserStore } from '@/store/user-store';

export function GuruPageClient() {
  const router = useRouter();
  const { user } = useUserStore();
  
  // Check if user has remaining Guru tickets
  const aiGuruTickets = user?.aiGuruTickets || 0;
  const hasNoTickets = aiGuruTickets === 0;

  return (
    <div className="relative">
      <section className="page-container pt-8 md:pt-16">
        <GuruHero />
      </section>

      {hasNoTickets && (
        <section className="page-container pt-6 md:pt-10">
          <OneTimeOfferBanner 
            feature="AI Guru questions"
            productId="199"
          />
        </section>
      )}

      <section className="page-container pt-6 md:pt-10">
        <UpgradeBanner
          buttonText="Upgrade for deeper sessions"
          description="Unlock longer conversations, priority queue, and advanced karmic insights."
          onClick={() => router.push('/pricing')}
        />
      </section>

      <section
        id="guru-console"
        className="page-container pt-6 md:pt-10 pb-16 md:pb-24"
      >
        <GuruLayoutShell>
          <CosmicGuruChat />
        </GuruLayoutShell>
      </section>
    </div>
  );
}
