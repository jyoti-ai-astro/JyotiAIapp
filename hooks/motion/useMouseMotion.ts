/**
 * useMouseMotion Hook
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 */

'use client';

import { useMouseStore } from '@/lib/motion/mouse-store';

export function useMouseMotion() {
  const mouseState = useMouseStore();
  
  return {
    mouseX: mouseState.mouseX,
    mouseY: mouseState.mouseY,
    deltaX: mouseState.deltaX,
    deltaY: mouseState.deltaY,
    velocity: mouseState.velocity,
    direction: mouseState.direction,
  };
}

