/**
 * ASTRAL BLOOM ENGINE (E43)
 * 
 * Phase 2 — Section 39: ASTRAL BLOOM ENGINE
 * 
 * Complete Astral Bloom system exports
 */

// Main component
export { AstralBloom } from './astral-bloom';
export type { AstralBloomProps } from './astral-bloom';

// Engine
export { AstralBloomEngine } from './astral-bloom-engine';
export type { AstralBloomEngineConfig, DiscData, RingData, ParticleData } from './astral-bloom-engine';

// Hooks
export { useAstralBloomMotion } from './hooks/use-bloom-motion';
export type { AstralBloomMotionState } from './hooks/use-bloom-motion';

export { useAstralBloomUniforms } from './hooks/use-bloom-uniforms';
export type { AstralBloomUniforms } from './hooks/use-bloom-uniforms';

// Shaders
export { bloomVertexShader } from './shaders/bloom-vertex';
export { bloomFragmentShader } from './shaders/bloom-fragment';

