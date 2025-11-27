/**
 * Cosmos Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { CosmosPageClient } from './cosmos-page-client';

export const metadata: Metadata = {
  title: 'Cosmos | Jyoti.ai - Immersive Cosmic Experience',
  description: 'Explore the cosmic universe with our immersive 3D galaxy scene and spiritual visualizations',
  openGraph: {
    title: 'Cosmos | Jyoti.ai',
    description: 'Explore the cosmic universe with our immersive 3D galaxy scene',
    type: 'website',
    images: [
      {
        url: '/og-image-cosmos.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai Cosmos',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CosmosPage() {
  return <CosmosPageClient />;
}

