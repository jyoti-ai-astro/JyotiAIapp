/**
 * useScrollMotion Hook
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 */

'use client';

import { useScrollStore } from '@/lib/motion/scroll-store';

export function useScrollMotion() {
  const scrollState = useScrollStore();
  
  return {
    scrollY: scrollState.scrollY,
    scrollVelocity: scrollState.scrollVelocity,
    direction: scrollState.direction,
    sectionProgress: scrollState.sectionProgress,
    sectionActive: scrollState.sectionActive,
  };
}

