/**
 * Guru Chat Page Client Component
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * 
 * Client component for Guru Chat page with animated shader hero
 */

'use client';

import React from 'react';
import AnimatedShaderHero from '@/components/ui/animated-shader-hero';
import { CosmicGuruChat } from '@/components/guru/CosmicGuruChat';

export function GuruPageClient() {
  const scrollToChat = () => {
    const el = document.getElementById('guru-chat');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="cosmic-page min-h-screen">
      <AnimatedShaderHero
        trustBadge={{
          text: 'Powered by Guru Brain + Astro Engine',
          icons: ['✨', '🪐'],
        }}
        headline={{
          line1: 'Ask the Cosmic Guru',
          line2: 'Astrology Answers. In Seconds.',
        }}
        subtitle="Powered by your birth chart, dasha and a trained Vedic Knowledge Vault — Guru decodes your life questions in real time."
        buttons={{
          primary: {
            text: 'Start Asking',
            onClick: scrollToChat,
          },
          secondary: {
            text: 'View Plans',
            onClick: () => (window.location.href = '/pricing'),
          },
        }}
      />

      <section id="guru-chat" className="relative z-20 -mt-32 md:-mt-40 pb-24">
        <CosmicGuruChat />
      </section>
    </div>
  );
}

