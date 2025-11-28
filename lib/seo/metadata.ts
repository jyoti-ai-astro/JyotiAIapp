/**
 * SEO Metadata Builder
 * 
 * Centralized SEO metadata generation for all pages
 */

import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultOGImage = '/og-image.jpg';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jyoti.ai';

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    ogImage = defaultOGImage,
    ogType = 'website',
    canonical,
    noindex = false,
    nofollow = false,
  } = config;

  const fullTitle = `${title} | Jyoti.ai - AI-Powered Spiritual Guidance`;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: [{ name: 'Jyoti.ai' }],
    creator: 'Jyoti.ai',
    publisher: 'Jyoti.ai',
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonicalUrl || siteUrl,
      siteName: 'Jyoti.ai',
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    metadataBase: new URL(siteUrl),
  };
}

// Predefined metadata for common pages
export const pageMetadata = {
  home: generateMetadata({
    title: 'Home',
    description: 'Your Destiny, Decoded by AI + Ancient Wisdom. Astrology • Numerology • Aura • Palmistry • Remedies • Predictions',
    keywords: ['astrology', 'numerology', 'kundali', 'palmistry', 'aura', 'spiritual guidance', 'AI astrology'],
    canonical: '/',
    ogImage: '/og-home.jpg',
  }),
  features: generateMetadata({
    title: 'Features',
    description: 'Experience the power of Jyoti.ai\'s spiritual engines: Kundali Engine, Numerology Engine, Aura & Chakra Scan, Palmistry Scanner, AI Guru Chat, and Predictive Reports.',
    keywords: ['kundali engine', 'numerology engine', 'aura scan', 'palmistry', 'AI guru', 'spiritual features'],
    canonical: '/features',
    ogImage: '/og-features.jpg',
  }),
  pricing: generateMetadata({
    title: 'Pricing',
    description: 'Choose the perfect plan for your spiritual journey. Free, Premium, and Lifetime plans available.',
    keywords: ['pricing', 'subscription', 'premium', 'spiritual guidance pricing'],
    canonical: '/pricing',
    ogImage: '/og-pricing.jpg',
  }),
  guru: generateMetadata({
    title: 'AI Guru Chat',
    description: 'Get personalized spiritual guidance from our AI Guru. Ask questions about your Kundali, Numerology, Aura, and more.',
    keywords: ['AI guru', 'spiritual chat', 'astrology chat', 'spiritual guidance', 'AI assistant'],
    canonical: '/guru',
    ogImage: '/og-guru.jpg',
  }),
  predictions: generateMetadata({
    title: 'Predictions',
    description: 'Get daily, weekly, and monthly astrological predictions for love, career, money, health, and spiritual growth.',
    keywords: ['astrological predictions', 'daily predictions', 'weekly predictions', 'monthly predictions', 'horoscope'],
    canonical: '/predictions',
    ogImage: '/og-predictions.jpg',
  }),
  timeline: generateMetadata({
    title: '12-Month Timeline',
    description: 'View your personalized 12-month astrological timeline with transits, events, and auspicious periods.',
    keywords: ['astrological timeline', '12 month timeline', 'planetary transits', 'auspicious periods'],
    canonical: '/timeline',
    ogImage: '/og-timeline.jpg',
  }),
  reports: generateMetadata({
    title: 'Reports',
    description: 'Generate comprehensive spiritual reports: Love, Career, Money, Health, Numerology, and Kundali Summary reports.',
    keywords: ['spiritual reports', 'astrology reports', 'kundali report', 'numerology report'],
    canonical: '/reports',
    ogImage: '/og-reports.jpg',
  }),
  compatibility: generateMetadata({
    title: 'Compatibility Analysis',
    description: 'Check your compatibility with your partner using Kundali and Numerology analysis.',
    keywords: ['compatibility', 'relationship compatibility', 'marriage compatibility', 'kundali matching'],
    canonical: '/compatibility',
    ogImage: '/og-compatibility.jpg',
  }),
};

