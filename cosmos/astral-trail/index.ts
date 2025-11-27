/**
 * ASTRAL TRAIL ENGINE (E32)
 * 
 * Phase 2 — Section 28: ASTRAL TRAIL ENGINE
 * 
 * Complete Astral Trail system exports
 */

// Main component
export { AstralTrail } from './astral-trail';
export type { AstralTrailProps } from './astral-trail';

// Engine
export { AstralTrailEngine } from './astral-trail-engine';
export type { AstralTrailEngineConfig, ParticleData, RibbonPointData, EchoLineData } from './astral-trail-engine';

// Hooks
export { useAstralTrailMotion } from './hooks/use-trail-motion';
export type { AstralTrailMotionState } from './hooks/use-trail-motion';

export { useAstralTrailUniforms } from './hooks/use-trail-uniforms';
export type { AstralTrailUniforms } from './hooks/use-trail-uniforms';

// Shaders
export { trailVertexShader } from './shaders/trail-vertex';
export { trailFragmentShader } from './shaders/trail-fragment';

