/**
 * Privacy Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { PrivacyPageClient } from './privacy-page-client';

export const metadata: Metadata = {
  title: 'Privacy Policy | Jyoti.ai',
  description: 'Read Jyoti.ai privacy policy to understand how we collect, use, and protect your personal information',
  openGraph: {
    title: 'Privacy Policy | Jyoti.ai',
    description: 'Read Jyoti.ai privacy policy to understand how we protect your personal information',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai Privacy Policy',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

