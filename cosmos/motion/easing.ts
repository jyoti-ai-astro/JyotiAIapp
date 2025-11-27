/**
 * Easing Library
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Global easing function library
 */

/**
 * Linear easing (no easing)
 */
export function linear(t: number): number {
  return t;
}

/**
 * Ease in cubic
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Ease out cubic
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease in-out cubic
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease in exponential
 */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

/**
 * Ease out exponential
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Ease in-out exponential
 */
export function easeInOutExpo(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/**
 * Ease out back
 */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Ease in back
 */
export function easeInBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}

/**
 * Bounce out
 */
export function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Overshoot (with configurable overshoot amount)
 */
export function overshoot(t: number, amount: number = 0.3): number {
  const c1 = 1.70158 + amount;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Spring easing (parameterized)
 */
export function spring(
  t: number,
  tension: number = 0.5,
  friction: number = 0.5
): number {
  // Simplified spring simulation
  const omega = 2 * Math.PI * (1 / (tension * 10 + 1));
  const zeta = friction;
  const A = 1;
  const B = zeta * omega;
  
  if (zeta < 1) {
    // Underdamped
    const phi = Math.atan((1 - zeta * zeta) / zeta);
    return A * Math.exp(-B * t) * Math.cos(omega * Math.sqrt(1 - zeta * zeta) * t + phi);
  } else {
    // Overdamped or critically damped
    return A * Math.exp(-B * t);
  }
}

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Easing function map
 */
export const EASING = {
  linear,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeOutBack,
  easeInBack,
  bounceOut,
  overshoot,
  spring,
} as const;

