/**
 * Astro Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { AstroPageClient } from './astro-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Astrology | JyotiAI - Vedic Astrology & Kundali',
  description: 'Get your personalized Vedic astrology readings, kundali analysis, and horoscope predictions powered by AI',
  openGraph: {
    title: 'Astrology | JyotiAI',
    description: 'Get your personalized Vedic astrology readings, kundali analysis, and horoscope predictions',
    type: 'website',
    images: [
      {
        url: '/og-image-astro.jpg',
        width: 1200,
        height: 630,
        alt: 'JyotiAI Astrology',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AstroPage() {
  return <AstroPageClient />;
}

