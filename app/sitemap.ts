/**
 * Sitemap Generation
 * 
 * Dynamic sitemap for all pages
 */

import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jyoti.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    // Public pages
    '',
    '/features',
    '/pricing',
    '/about',
    '/blog',
    '/contact',
    '/cosmos',
    '/astro',
    '/guru',
    '/premium',
    
    // App pages (require auth)
    '/dashboard',
    '/kundali',
    '/numerology',
    '/predictions',
    '/timeline',
    '/reports',
    '/compatibility',
    '/guru',
    '/business',
    '/pregnancy',
    '/face',
    '/aura',
    '/palmistry',
    '/planets',
    '/houses',
    '/charts',
    '/dasha',
    '/settings',
    '/payments',
    
    // Auth pages
    '/login',
    '/signup',
    '/magic-link',
    '/profile-setup',
    '/rasi-confirmation',
    
    // Legal pages
    '/legal/terms',
    '/legal/privacy',
    '/legal/refund',
    '/legal/cookies',
    '/legal/security',
    '/legal/licenses',
    
    // Company pages
    '/company/about',
    '/company/blog',
    '/company/careers',
    '/company/press-kit',
    '/company/contact',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/dashboard') || route.startsWith('/guru') ? 0.9 : 0.7,
  }));
}

