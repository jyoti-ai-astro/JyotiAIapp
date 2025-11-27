/**
 * ASTRAL LOTUS ENGINE (E37)
 * 
 * Phase 2 — Section 33: ASTRAL LOTUS ENGINE
 * 
 * Complete Astral Lotus system exports
 */

// Main component
export { AstralLotus } from './astral-lotus';
export type { AstralLotusProps } from './astral-lotus';

// Engine
export { AstralLotusEngine } from './astral-lotus-engine';
export type { AstralLotusEngineConfig, OuterPetalData, InnerPetalData, CoreData } from './astral-lotus-engine';

// Hooks
export { useAstralLotusMotion } from './hooks/use-lotus-motion';
export type { AstralLotusMotionState } from './hooks/use-lotus-motion';

export { useAstralLotusUniforms } from './hooks/use-lotus-uniforms';
export type { AstralLotusUniforms } from './hooks/use-lotus-uniforms';

// Shaders
export { lotusVertexShader } from './shaders/lotus-vertex';
export { lotusFragmentShader } from './shaders/lotus-fragment';

