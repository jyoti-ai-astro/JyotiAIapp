/**
 * SACRED GEOMETRY PROJECTION ENGINE (E17)
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * 
 * Complete Sacred Geometry Projection system exports
 */

// Main component
export { Projection } from './projection';
export type { ProjectionProps } from './projection';

// Engine
export { ProjectionEngine } from './projection-engine';
export type { ProjectionEngineConfig } from './projection-engine';

// Hooks
export { useProjectionUniforms } from './hooks/use-projection-uniforms';
export type { ProjectionState, ProjectionUniforms } from './hooks/use-projection-uniforms';

export { useProjectionMotion } from './hooks/use-projection-motion';

// Shaders
export { projectionVertexShader } from './shaders/projection-vertex';
export { projectionFragmentShader } from './shaders/projection-fragment';

