/**
 * COSMIC FRACTURE ENGINE (E54)
 * 
 * Phase 2 — Section 50: COSMIC FRACTURE ENGINE
 * 
 * Complete Cosmic Fracture system exports
 */

// Main component
export { CosmicFracture } from './cosmic-fracture';
export type { CosmicFractureProps } from './cosmic-fracture';

// Engine
export { CosmicFractureEngine } from './cosmic-fracture-engine';
export type { CosmicFractureEngineConfig, FracturePlaneData, ShardData, CrystalData } from './cosmic-fracture-engine';

// Hooks
export { useCosmicFractureMotion } from './hooks/use-cosmic-fracture-motion';
export type { CosmicFractureMotionState } from './hooks/use-cosmic-fracture-motion';

export { useCosmicFractureUniforms } from './hooks/use-cosmic-fracture-uniforms';
export type { CosmicFractureUniforms } from './hooks/use-cosmic-fracture-uniforms';

// Shaders
export { cosmicFractureVertexShader } from './shaders/cosmic-fracture-vertex';
export { cosmicFractureFragmentShader } from './shaders/cosmic-fracture-fragment';

