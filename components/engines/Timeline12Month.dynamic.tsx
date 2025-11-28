/**
 * Dynamic Import Wrapper for Timeline12Month
 * 
 * Lazy loads GSAP timeline component
 */

'use client';

import dynamic from 'next/dynamic';

export const Timeline12MonthLazy = dynamic(
  () => import('./Timeline12Month').then((mod) => ({ default: mod.Timeline12Month })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-white/5 rounded-lg h-64" />
    ),
  }
);

