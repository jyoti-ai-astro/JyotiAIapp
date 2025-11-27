/**
 * Footer Wrapper Component
 * 
 * Phase 3 — Section 20: PAGES PHASE 5 (F20)
 * 
 * Handles global fade + parallax intensity with page-specific multipliers
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CosmicFooter } from '@/components/sections/Footer/CosmicFooter';

export interface FooterWrapperProps {
  /** Override intensity (optional) */
  intensity?: number;
}

export function FooterWrapper({ intensity }: FooterWrapperProps) {
  const pathname = usePathname();
  
  // Automatically choose footer intensity per page
  const getIntensityForPage = (path: string): number => {
    if (intensity !== undefined) return intensity;
    
    if (path === '/home' || path === '/') return 1.0;
    if (path.startsWith('/astro')) return 0.9;
    if (path.startsWith('/cosmos')) return 0.8;
    if (path.startsWith('/premium')) return 1.2; // Gold premium mode
    if (path.startsWith('/about')) return 0.7; // Divine soft
    if (path.startsWith('/privacy') || path.startsWith('/terms')) return 0.5; // Minimal cosmic
    if (path.startsWith('/contact') || path.startsWith('/support')) return 0.8;
    if (path.startsWith('/blog')) return 0.8;
    
    // Default
    return 1.0;
  };
  
  const footerIntensity = getIntensityForPage(pathname);
  
  return <CosmicFooter intensity={footerIntensity} />;
}

