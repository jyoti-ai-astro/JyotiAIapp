/**
 * Shafts Scroll Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Light Shafts Engine (E11)
 * 
 * Converts scroll position to 0-1 range for scroll-reactive angle shift and vertical drift
 */

import { useMemo } from 'react';

export interface UseShaftsScrollProps {
  /** Scroll position (0-1) */
  scroll?: number;
}

export function useShaftsScroll(
  props: UseShaftsScrollProps
): number {
  return useMemo(() => {
    // Ensure scroll is in 0-1 range
    return Math.max(0, Math.min(1, props.scroll || 0));
  }, [props.scroll]);
}

