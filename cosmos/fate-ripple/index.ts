/**
 * FATE RIPPLE ENGINE (E34)
 * 
 * Phase 2 — Section 30: FATE RIPPLE ENGINE
 * 
 * Complete Fate Ripple system exports
 */

// Main component
export { FateRipple } from './fate-ripple';
export type { FateRippleProps } from './fate-ripple';

// Engine
export { FateRippleEngine } from './fate-ripple-engine';
export type { FateRippleEngineConfig, RippleRingData, ShockwaveData, FragmentData } from './fate-ripple-engine';

// Hooks
export { useFateRippleMotion } from './hooks/use-ripple-motion';
export type { FateRippleMotionState } from './hooks/use-ripple-motion';

export { useFateRippleUniforms } from './hooks/use-ripple-uniforms';
export type { FateRippleUniforms } from './hooks/use-ripple-uniforms';

// Shaders
export { rippleVertexShader } from './shaders/ripple-vertex';
export { rippleFragmentShader } from './shaders/ripple-fragment';

