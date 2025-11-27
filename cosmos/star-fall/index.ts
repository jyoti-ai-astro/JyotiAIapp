/**
 * STARFALL ENGINE (E44)
 * 
 * Phase 2 — Section 40: STARFALL ENGINE
 * 
 * Complete StarFall system exports
 */

// Main component
export { StarFall } from './star-fall';
export type { StarFallProps } from './star-fall';

// Engine
export { StarFallEngine } from './star-fall-engine';
export type { StarFallEngineConfig, StreakData, SparkData, GlowData } from './star-fall-engine';

// Hooks
export { useStarFallMotion } from './hooks/use-starfall-motion';
export type { StarFallMotionState } from './hooks/use-starfall-motion';

export { useStarFallUniforms } from './hooks/use-starfall-uniforms';
export type { StarFallUniforms } from './hooks/use-starfall-uniforms';

// Shaders
export { starfallVertexShader } from './shaders/starfall-vertex';
export { starfallFragmentShader } from './shaders/starfall-fragment';

