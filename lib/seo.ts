/**
 * SEO Metadata Helper
 * 
 * Generates consistent SEO metadata for all pages
 */

import type { Metadata } from 'next';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  path?: string;
  noIndex?: boolean;
}

const defaultTitle = 'JyotiAI - Your Spiritual Operating System';
const defaultDescription = 'AI-powered spiritual guidance combining astrology, palmistry, face reading, aura analysis, and more';
const defaultKeywords = ['astrology', 'palmistry', 'spiritual', 'AI', 'kundali', 'numerology'];
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.jyotiai.in';

export function generateMetadata(options: SEOOptions = {}): Metadata {
  const {
    title,
    description = defaultDescription,
    keywords = defaultKeywords,
    image = '/og-image.jpg',
    path = '',
    noIndex = false,
  } = options;

  const fullTitle = title ? `${title} | JyotiAI` : defaultTitle;
  const url = `${baseUrl}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'JyotiAI' }],
    creator: 'JyotiAI',
    publisher: 'JyotiAI',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: fullTitle,
      description,
      siteName: 'JyotiAI',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    themeColor: '#020916',
  };
}

