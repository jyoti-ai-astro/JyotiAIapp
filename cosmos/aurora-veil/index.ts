/**
 * AURORA VEIL ENGINE (E48)
 * 
 * Phase 2 — Section 44: AURORA VEIL ENGINE
 * 
 * Complete Aurora Veil system exports
 */

// Main component
export { AuroraVeil } from './aurora-veil';
export type { AuroraVeilProps } from './aurora-veil';

// Engine
export { AuroraVeilEngine } from './aurora-veil-engine';
export type { AuroraVeilEngineConfig, PrimaryAuroraData, ReverseAuroraData, DustParticleData } from './aurora-veil-engine';

// Hooks
export { useAuroraVeilMotion } from './hooks/use-aurora-motion';
export type { AuroraVeilMotionState } from './hooks/use-aurora-motion';

export { useAuroraVeilUniforms } from './hooks/use-aurora-uniforms';
export type { AuroraVeilUniforms } from './hooks/use-aurora-uniforms';

// Shaders
export { auroraVertexShader } from './shaders/aurora-vertex';
export { auroraFragmentShader } from './shaders/aurora-fragment';

