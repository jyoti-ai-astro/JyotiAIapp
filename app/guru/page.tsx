/**
 * Guru Chat Page
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * 
 * Server component for Guru Chat page
 */

import type { Metadata } from 'next';
import { GuruPageClient } from './guru-page-client';

export const metadata: Metadata = {
  title: 'AI Guru Chat | Jyoti.ai - Your Spiritual Guide',
  description: 'Chat with your AI Spiritual Guide. Get personalized answers combining insights from Kundali, Numerology, Aura analysis, and more.',
  openGraph: {
    title: 'AI Guru Chat | Jyoti.ai',
    description: 'Chat with your AI Spiritual Guide for personalized spiritual guidance',
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
