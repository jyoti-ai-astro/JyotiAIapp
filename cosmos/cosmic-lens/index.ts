/**
 * COSMIC LENS ENGINE (E53)
 * 
 * Phase 2 — Section 49: COSMIC LENS ENGINE
 * 
 * Complete Cosmic Lens system exports
 */

// Main component
export { CosmicLens } from './cosmic-lens';
export type { CosmicLensProps } from './cosmic-lens';

// Engine
export { CosmicLensEngine } from './cosmic-lens-engine';
export type { CosmicLensEngineConfig, LensPlaneData, ArcData, PhotonData } from './cosmic-lens-engine';

// Hooks
export { useCosmicLensMotion } from './hooks/use-cosmic-lens-motion';
export type { CosmicLensMotionState } from './hooks/use-cosmic-lens-motion';

export { useCosmicLensUniforms } from './hooks/use-cosmic-lens-uniforms';
export type { CosmicLensUniforms } from './hooks/use-cosmic-lens-uniforms';

// Shaders
export { cosmicLensVertexShader } from './shaders/cosmic-lens-vertex';
export { cosmicLensFragmentShader } from './shaders/cosmic-lens-fragment';

