/**
 * Motion Tokens
 * 
 * Phase 3 — Section 12: MOTION DESIGN SYSTEM
 * Phase 3 — Section 14.7: Motion Tokens (GSAP + Framer)
 */

export const durations = {
  fast: 120,
  medium: 240,
  slow: 400,
  glide: 650,
  cosmic: 1200,
} as const;

export const easing = {
  'in-out-soft': 'cubic-bezier(0.45, 0, 0.55, 1)',
  'out-smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'cosmic-wave': 'cubic-bezier(0.37, 0.13, 0.13, 0.99)',
  anticipate: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  drift: 'cubic-bezier(0.18, 0.72, 0.14, 0.99)',
} as const;

export const motionDistances = {
  sm: '4px',
  md: '12px',
  lg: '32px',
} as const;

export const motionRotations = {
  sm: '3deg',
  md: '6deg',
} as const;

export const motionGlow = {
  base: 0.25,
  strong: 0.45,
} as const;

export const motionParallax = {
  depth1: 0.15,
  depth2: 0.35,
  depth3: 0.55,
} as const;

// State Motion Tokens (Phase 3 — Section 13.4)
export const stateMotion = {
  hover: '180ms cubic-bezier(0.22, 1, 0.36, 1)',
  active: '120ms cubic-bezier(0.22, 1, 0.36, 1)',
  focus: '220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  disabled: '0ms',
} as const;
