/**
 * Route Transition Handler Component
 * 
 * Phase 3 — Section 25: PAGES PHASE 10 (F25)
 * 
 * Handles route transitions by calling useRouteMotion hook
 */

'use client';

import { useRouteMotion } from '@/hooks/motion/useRouteMotion';

export function RouteTransitionHandler() {
  useRouteMotion();
  return null;
}

