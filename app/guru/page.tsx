/**
 * Guru Chat Page
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * 
 * Server component for Guru Chat page
 */

import type { Metadata } from 'next';
import { GuruPageClient } from './guru-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Jyoti Guru | JyotiAI',
  description: 'Ask Jyoti Guru for calm guidance using your saved Kundali context.',
  openGraph: {
    title: 'Jyoti Guru | JyotiAI',
    description: 'Ask for guidance from your saved Vedic birth chart context.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GuruPage() {
  return <GuruPageClient />;
}
