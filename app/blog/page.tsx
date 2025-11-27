/**
 * Blog Page
 * 
 * Phase 3 — Section 20: PAGES PHASE 5 (F20)
 */

import type { Metadata } from 'next';
import { BlogPageClient } from './blog-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog | Jyoti.ai - Spiritual Knowledge Base',
  description: 'Read articles about astrology, numerology, spiritual guidance, and ancient wisdom from Jyoti.ai',
  openGraph: {
    title: 'Blog | Jyoti.ai',
    description: 'Read articles about astrology, numerology, and spiritual guidance',
    type: 'website',
    images: [
      {
        url: '/og-image-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai Blog',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
