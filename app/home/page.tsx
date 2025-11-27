/**
 * Home Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { HomePageClient } from './home-page-client';

export const metadata: Metadata = {
  title: 'Home | Jyoti.ai - Your Spiritual Operating System',
  description: 'AI-powered spiritual guidance combining astrology, palmistry, face reading, aura analysis, and more',
  openGraph: {
    title: 'Jyoti.ai - Your Spiritual Operating System',
    description: 'AI-powered spiritual guidance combining ancient Indian sciences with modern technology',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}

