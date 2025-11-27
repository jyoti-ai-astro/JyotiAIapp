/**
 * Chakra Scroll Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Chakra Glow Rings Engine (E6)
 * 
 * Converts scroll position to 0-1 range for scroll-reactive intensity
 */

import { useMemo } from 'react';

export interface UseChakraScrollProps {
  /** Scroll position (0-1) */
  scroll?: number;
}

export function useChakraScroll(
  props: UseChakraScrollProps
): number {
  return useMemo(() => {
    // Ensure scroll is in 0-1 range
    return Math.max(0, Math.min(1, props.scroll || 0));
  }, [props.scroll]);
}

