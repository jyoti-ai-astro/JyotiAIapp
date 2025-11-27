/**
 * Support Page
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

import type { Metadata } from 'next';
import { SupportPageClient } from './support-page-client';

export const metadata: Metadata = {
  title: 'Support | Jyoti.ai - Guided Help from the Cosmos',
  description: 'Get help and support for your Jyoti.ai journey. Browse FAQs, contact support, or find answers to common questions about astrology, numerology, and our spiritual services.',
  openGraph: {
    title: 'Support | Jyoti.ai',
    description: 'Get help and support for your Jyoti.ai journey. Browse FAQs and find answers.',
    type: 'website',
    images: [
      {
        url: '/og-image-support.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai Support',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SupportPage() {
  return <SupportPageClient />;
}

