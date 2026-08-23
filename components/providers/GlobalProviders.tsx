/**
 * Global Providers Wrapper
 * 
 */

'use client';

import React, { useEffect, useState } from 'react';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { ResponsiveWrapper } from '@/components/global/ResponsiveWrapper';

let globalProvidersMounted = false;

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!globalProvidersMounted) {
      globalProvidersMounted = true;
      setMounted(true);
    }
  }, []);

  // Only mount global components once
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ResponsiveWrapper>
      <CosmicCursor />
      {children}
    </ResponsiveWrapper>
  );
}

