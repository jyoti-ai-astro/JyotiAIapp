/**
 * Cosmos Page
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 */

import type { Metadata } from 'next';
import { CosmosPageClient } from './cosmos-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cosmos | JyotiAI - Immersive Cosmic Experience',
  description: 'Explore the cosmic universe with our immersive 3D galaxy scene and spiritual visualizations',
  openGraph: {
    title: 'Cosmos | JyotiAI',
    description: 'Explore the cosmic universe with our immersive 3D galaxy scene',
    type: 'website',
    images: [
      {
        url: '/og-image-cosmos.jpg',
        width: 1200,
        height: 630,
        alt: 'JyotiAI Cosmos',
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

