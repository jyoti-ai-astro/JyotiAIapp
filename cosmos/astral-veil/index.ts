/**
 * ASTRAL VEIL ENGINE (E33)
 * 
 * Phase 2 — Section 29: ASTRAL VEIL ENGINE
 * 
 * Complete Astral Veil system exports
 */

// Main component
export { AstralVeil } from './astral-veil';
export type { AstralVeilProps } from './astral-veil';

// Engine
export { AstralVeilEngine } from './astral-veil-engine';
export type { AstralVeilEngineConfig, FrontVeilData, RearVeilData, MistParticleData } from './astral-veil-engine';

// Hooks
export { useAstralVeilMotion } from './hooks/use-veil-motion';
export type { AstralVeilMotionState } from './hooks/use-veil-motion';

export { useAstralVeilUniforms } from './hooks/use-veil-uniforms';
export type { AstralVeilUniforms } from './hooks/use-veil-uniforms';

// Shaders
export { veilVertexShader } from './shaders/veil-vertex';
export { veilFragmentShader } from './shaders/veil-fragment';

