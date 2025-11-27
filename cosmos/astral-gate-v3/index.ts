/**
 * ASTRAL GATE ENGINE v3 (E63)
 * 
 * Phase 2 — Section 59: ASTRAL GATE ENGINE v3
 * 
 * Complete Astral Gate v3 system exports
 */

// Main component
export { AstralGateV3 } from './astral-gate';
export type { AstralGateV3Props } from './astral-gate';

// Engine
export { AstralGateEngine } from './astral-gate-engine';
export type { AstralGateEngineConfig, TwinArcData, TripleSpiralData, AscensionPillarData, HaloGlyphData, EnergyRunnerData, CrossSoulThreadData, AstralWaveData, AscensionStairData, LightBeamData } from './astral-gate-engine';

// Hooks
export { useAstralGateMotion } from './hooks/use-astral-gate-motion';
export type { AstralGateMotionState } from './hooks/use-astral-gate-motion';

export { useAstralGateUniforms } from './hooks/use-astral-gate-uniforms';
export type { AstralGateUniforms } from './hooks/use-astral-gate-uniforms';

// Shaders
export { astralGateVertexShader } from './shaders/astral-gate-vertex';
export { astralGateFragmentShader } from './shaders/astral-gate-fragment';

