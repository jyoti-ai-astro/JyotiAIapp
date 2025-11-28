/**
 * Structured Data (Schema.org JSON-LD)
 * 
 * Generate structured data for SEO
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface PersonSchema {
  name: string;
  jobTitle?: string;
  image?: string;
  url?: string;
}

export interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function generateOrganizationSchema(data: OrganizationSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...(data.contactPoint && { contactPoint: data.contactPoint }),
    ...(data.sameAs && { sameAs: data.sameAs }),
  };
}

export function generatePersonSchema(data: PersonSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    ...(data.jobTitle && { jobTitle: data.jobTitle }),
    ...(data.image && { image: data.image }),
    ...(data.url && { url: data.url }),
  };
}

export function generateWebSiteSchema(data: WebSiteSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    ...(data.potentialAction && { potentialAction: data.potentialAction }),
  };
}

export function generateFAQSchema(data: FAQSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

// Predefined schemas
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jyoti.ai';

export const defaultOrganizationSchema = generateOrganizationSchema({
  name: 'Jyoti.ai',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: 'AI-Powered Spiritual Guidance Platform',
  sameAs: [
    'https://twitter.com/jyotiai',
    'https://facebook.com/jyotiai',
    'https://instagram.com/jyotiai',
  ],
});

export const defaultWebSiteSchema = generateWebSiteSchema({
  name: 'Jyoti.ai',
  url: siteUrl,
  description: 'Your Destiny, Decoded by AI + Ancient Wisdom',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const predictionsFAQSchema = generateFAQSchema({
  questions: [
    {
      question: 'How accurate are the astrological predictions?',
      answer: 'Our predictions are based on Vedic astrology principles and planetary calculations. While we provide detailed insights, individual experiences may vary.',
    },
    {
      question: 'How often are predictions updated?',
      answer: 'Daily predictions are updated every day, weekly predictions are updated weekly, and monthly predictions are updated at the beginning of each month.',
    },
    {
      question: 'Can I get predictions for specific life areas?',
      answer: 'Yes, our predictions cover five main categories: Love, Career, Money, Health, and Spiritual growth.',
    },
  ],
});

export const guruFAQSchema = generateFAQSchema({
  questions: [
    {
      question: 'What is AI Guru Chat?',
      answer: 'AI Guru Chat is an AI-powered spiritual assistant that provides personalized guidance based on your Kundali, Numerology, Aura, and other spiritual data.',
    },
    {
      question: 'How does AI Guru use my spiritual data?',
      answer: 'AI Guru analyzes your birth chart, numerology profile, aura scan, and other spiritual insights to provide context-aware responses to your questions.',
    },
    {
      question: 'Is AI Guru available 24/7?',
      answer: 'Yes, AI Guru is available 24/7 to answer your spiritual questions and provide guidance.',
    },
  ],
});

export const reportsFAQSchema = generateFAQSchema({
  questions: [
    {
      question: 'What types of reports are available?',
      answer: 'We offer comprehensive reports for Love, Career, Money, Health, Numerology, and Kundali Summary.',
    },
    {
      question: 'How long does it take to generate a report?',
      answer: 'Reports are typically generated within a few seconds. Premium reports may take slightly longer due to additional analysis.',
    },
    {
      question: 'Can I download my reports?',
      answer: 'Yes, all reports can be downloaded as PDF files for your reference.',
    },
  ],
});

