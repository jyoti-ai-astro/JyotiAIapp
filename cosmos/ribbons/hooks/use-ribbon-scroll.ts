/**
 * Ribbon Scroll Hook
 * 
 * Phase 2 — Section 5 Extension: ENERGY RIBBON ENGINE (E5)
 * 
 * Converts scroll position to 0-1 range for ribbon upward drift
 */

import { useMemo } from 'react';

export interface UseRibbonScrollProps {
  /** Scroll position (0-1) */
  scroll?: number;
}

export function useRibbonScroll(
  props: UseRibbonScrollProps
): number {
  return useMemo(() => {
    // Ensure scroll is in 0-1 range
    return Math.max(0, Math.min(1, props.scroll || 0));
  }, [props.scroll]);
}

