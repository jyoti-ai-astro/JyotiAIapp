/**
 * Terms Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { TermsPageClient } from './terms-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terms of Service | JyotiAI',
  description: 'Read JyotiAI terms of service to understand the rules and guidelines for using our platform',
  openGraph: {
    title: 'Terms of Service | JyotiAI',
    description: 'Read JyotiAI terms of service to understand the rules for using our platform',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JyotiAI Terms of Service',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}

