/**
 * Guru Chat Page Client Component
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * 
 * Client component for Guru Chat page with animated shader hero
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AnimatedShaderHero from '@/components/ui/animated-shader-hero';
import { UpgradeBanner } from '@/components/ui/upgrade-banner';
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat';

export function GuruPageClient() {
  const router = useRouter();

  const scrollToChat = () => {
    const el = document.getElementById('guru-console');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="cosmic-page min-h-screen flex flex-col">
      <AnimatedShaderHero
        trustBadge={{
          text: 'Powered by JyotiAI · AstroContext · Pinecone RAG',
          icons: ['✨', '🪐', '📡'],
        }}
        headline={{
          line1: 'Ask The Cosmic Guru',
          line2: 'Guidance from Your Birth Stars',
        }}
        subtitle="Your personal Astro engine, Guru Brain and Knowledge Vault — fused into one cosmic console. Ask anything about life, career, money, love or destiny."
        buttons={{
          primary: {
            text: 'Open Guru Console',
            onClick: scrollToChat,
          },
          secondary: {
            text: 'View Prediction Engine',
            onClick: () => router.push('/predictions'),
          },
        }}
      />

      <div className="container mx-auto px-4 pb-16 space-y-6" id="guru-console">
        <UpgradeBanner
          className="mt-4 mb-2 flex justify-center"
          onClick={() => router.push('/pricing')}
        />
        <section id="guru-chat" className="relative z-20">
          <CosmicGuruChat />
        </section>
      </div>
    </div>
  );
}

