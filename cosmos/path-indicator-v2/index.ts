/**
 * PATH INDICATOR ENGINE v2 (E57)
 * 
 * Phase 2 — Section 53: PATH INDICATOR ENGINE v2
 * 
 * Complete Path Indicator v2 system exports
 */

// Main component
export { PathIndicatorV2 } from './path-indicator';
export type { PathIndicatorV2Props } from './path-indicator';

// Engine
export { PathIndicatorEngine } from './path-indicator-engine';
export type { PathIndicatorEngineConfig, SplinePoint, PathLineData, NodeData, PulseData } from './path-indicator-engine';

// Hooks
export { usePathIndicatorMotion } from './hooks/use-path-indicator-motion';
export type { PathIndicatorMotionState } from './hooks/use-path-indicator-motion';

export { usePathIndicatorUniforms } from './hooks/use-path-indicator-uniforms';
export type { PathIndicatorUniforms } from './hooks/use-path-indicator-uniforms';

// Shaders
export { pathIndicatorVertexShader } from './shaders/path-indicator-vertex';
export { pathIndicatorFragmentShader } from './shaders/path-indicator-fragment';

