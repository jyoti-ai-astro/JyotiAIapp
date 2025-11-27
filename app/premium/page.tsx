/**
 * Premium Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { PremiumPageClient } from './premium-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Premium | Jyoti.ai - Unlock Premium Features',
  description: 'Upgrade to Jyoti.ai Premium for advanced astrology readings, unlimited reports, and exclusive features',
  openGraph: {
    title: 'Premium | Jyoti.ai',
    description: 'Upgrade to Jyoti.ai Premium for advanced astrology readings and exclusive features',
    type: 'website',
    images: [
      {
        url: '/og-image-premium.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai Premium',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PremiumPage() {
  return <PremiumPageClient />;
}

