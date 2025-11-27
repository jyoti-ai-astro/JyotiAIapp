/**
 * Contact Page
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 */

import type { Metadata } from 'next';
import { ContactPageClient } from './contact-page-client';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Contact | Jyoti.ai - We're Here in the Cosmic Loop",
  description: "Get in touch with Jyoti.ai. We're here to help you on your spiritual journey. Reach out via email, social media, or our support channels.",
  openGraph: {
    title: 'Contact | Jyoti.ai',
    description: "Get in touch with Jyoti.ai. We're here to help you on your spiritual journey.",
    type: 'website',
    images: [
      {
        url: '/og-image-contact.jpg',
        width: 1200,
        height: 630,
        alt: 'Jyoti.ai Contact',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}

