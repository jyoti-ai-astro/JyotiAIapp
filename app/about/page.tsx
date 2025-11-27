/**
 * About Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { AboutPageClient } from './about-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About | Jyoti.ai - Our Story & Mission',
  description: 'Learn about Jyoti.ai, our mission to combine ancient Indian sciences with modern AI technology for spiritual guidance',
  openGraph: {
    title: 'About | Jyoti.ai',
    description: 'Learn about Jyoti.ai, our mission to combine ancient Indian sciences with modern AI technology',
    type: 'website',
    images: [
      {
        url: '/og-image-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Jyoti.ai',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}

