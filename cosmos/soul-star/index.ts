/**
 * SOUL STAR ENGINE (E35)
 * 
 * Phase 2 — Section 31: SOUL STAR ENGINE
 * 
 * Complete Soul Star system exports
 */

// Main component
export { SoulStar } from './soul-star';
export type { SoulStarProps } from './soul-star';

// Engine
export { SoulStarEngine } from './soul-star-engine';
export type { SoulStarEngineConfig, CoreStarData, SpikeData, ParticleData } from './soul-star-engine';

// Hooks
export { useSoulStarMotion } from './hooks/use-star-motion';
export type { SoulStarMotionState } from './hooks/use-star-motion';

export { useSoulStarUniforms } from './hooks/use-star-uniforms';
export type { SoulStarUniforms } from './hooks/use-star-uniforms';

// Shaders
export { starVertexShader } from './shaders/star-vertex';
export { starFragmentShader } from './shaders/star-fragment';

