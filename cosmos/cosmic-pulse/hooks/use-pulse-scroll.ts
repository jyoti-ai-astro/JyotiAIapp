/**
 * Pulse Scroll Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Cosmic Pulse Field Engine (E8)
 * 
 * Converts scroll position to 0-1 range for scroll-driven amplitude boost
 */

import { useMemo } from 'react';

export interface UsePulseScrollProps {
  /** Scroll position (0-1) */
  scroll?: number;
}

export function usePulseScroll(
  props: UsePulseScrollProps
): number {
  return useMemo(() => {
    // Ensure scroll is in 0-1 range
    return Math.max(0, Math.min(1, props.scroll || 0));
  }, [props.scroll]);
}

