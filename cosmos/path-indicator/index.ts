/**
 * PATH INDICATOR ENGINE (E24)
 * 
 * Phase 2 — Section 20: DIVINE PATH INDICATOR ENGINE
 * 
 * Complete Path Indicator system exports
 */

// Main component
export { PathIndicator } from './path-indicator';
export type { PathIndicatorProps } from './path-indicator';

// Engine
export { PathIndicatorEngine } from './path-indicator-engine';
export type { PathIndicatorEngineConfig, SplinePoint } from './path-indicator-engine';

// Hooks
export { usePathMotion } from './hooks/use-path-motion';
export type { PathMotionState } from './hooks/use-path-motion';

export { usePathUniforms } from './hooks/use-path-uniforms';
export type { PathUniforms } from './hooks/use-path-uniforms';

// Shaders
export { pathVertexShader } from './shaders/path-vertex';
export { pathFragmentShader } from './shaders/path-fragment';

