/**
 * COSMIC DRIFT FIELD ENGINE (E49)
 * 
 * Phase 2 — Section 45: COSMIC DRIFT FIELD ENGINE
 * 
 * Complete Cosmic Drift Field system exports
 */

// Main component
export { CosmicDriftField } from './drift-field';
export type { CosmicDriftFieldProps } from './drift-field';

// Engine
export { CosmicDriftFieldEngine } from './drift-field-engine';
export type { CosmicDriftFieldEngineConfig, NebulaPlaneData, FlowPlaneData, DustParticleData } from './drift-field-engine';

// Hooks
export { useCosmicDriftFieldMotion } from './hooks/use-drift-field-motion';
export type { CosmicDriftFieldMotionState } from './hooks/use-drift-field-motion';

export { useCosmicDriftFieldUniforms } from './hooks/use-drift-field-uniforms';
export type { CosmicDriftFieldUniforms } from './hooks/use-drift-field-uniforms';

// Shaders
export { driftFieldVertexShader } from './shaders/drift-field-vertex';
export { driftFieldFragmentShader } from './shaders/drift-field-fragment';

