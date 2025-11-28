/**
 * Dynamic Import Wrapper for GuruChatShell
 * 
 * Lazy loads heavy Guru Chat component
 */

'use client';

import dynamic from 'next/dynamic';

export const GuruChatShellLazy = dynamic(
  () => import('./GuruChatShell').then((mod) => ({ default: mod.GuruChatShell })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-white/5 rounded-lg h-96" />
    ),
  }
);

