/**
 * DIMENSIONAL RIPPLE ENGINE (E47)
 * 
 * Phase 2 — Section 43: DIMENSIONAL RIPPLE ENGINE
 * 
 * Complete Dimensional Ripple system exports
 */

// Main component
export { DimensionalRipple } from './dimensional-ripple';
export type { DimensionalRippleProps } from './dimensional-ripple';

// Engine
export { DimensionalRippleEngine } from './dimensional-ripple-engine';
export type { DimensionalRippleEngineConfig, RipplePlaneData, WarpPlaneData, ParticleData } from './dimensional-ripple-engine';

// Hooks
export { useDimensionalRippleMotion } from './hooks/use-ripple-motion';
export type { DimensionalRippleMotionState } from './hooks/use-ripple-motion';

export { useDimensionalRippleUniforms } from './hooks/use-ripple-uniforms';
export type { DimensionalRippleUniforms } from './hooks/use-ripple-uniforms';

// Shaders
export { rippleVertexShader } from './shaders/ripple-vertex';
export { rippleFragmentShader } from './shaders/ripple-fragment';

