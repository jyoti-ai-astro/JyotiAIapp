/**
 * Grid Scroll Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Divine Alignment Grid Engine (E9)
 * 
 * Converts scroll position to 0-1 range for scroll-driven rotation
 */

import { useMemo } from 'react';

export interface UseGridScrollProps {
  /** Scroll position (0-1) */
  scroll?: number;
}

export function useGridScroll(
  props: UseGridScrollProps
): number {
  return useMemo(() => {
    // Ensure scroll is in 0-1 range
    return Math.max(0, Math.min(1, props.scroll || 0));
  }, [props.scroll]);
}

