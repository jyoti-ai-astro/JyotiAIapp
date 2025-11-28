/**
 * Dynamic Import Wrapper for CosmicBackground
 * 
 * Lazy loads R3F components for better performance
 */

'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

const CosmicBackgroundDynamic = dynamic(
  () => import('./CosmicBackground').then((mod) => ({ default: mod.CosmicBackground })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-cosmic-navy via-cosmic-indigo to-cosmic-purple" />
    ),
  }
);

export const CosmicBackgroundLazy = memo(CosmicBackgroundDynamic);
CosmicBackgroundLazy.displayName = 'CosmicBackgroundLazy';

