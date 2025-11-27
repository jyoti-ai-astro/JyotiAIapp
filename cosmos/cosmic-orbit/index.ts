/**
 * COSMIC ORBIT ENGINE (E41)
 * 
 * Phase 2 — Section 37: COSMIC ORBIT ENGINE
 * 
 * Complete Cosmic Orbit system exports
 */

// Main component
export { CosmicOrbit } from './cosmic-orbit';
export type { CosmicOrbitProps } from './cosmic-orbit';

// Engine
export { CosmicOrbitEngine } from './cosmic-orbit-engine';
export type { CosmicOrbitEngineConfig, OrbitRingData, SatelliteData, CoreData } from './cosmic-orbit-engine';

// Hooks
export { useCosmicOrbitMotion } from './hooks/use-orbit-motion';
export type { CosmicOrbitMotionState } from './hooks/use-orbit-motion';

export { useCosmicOrbitUniforms } from './hooks/use-orbit-uniforms';
export type { CosmicOrbitUniforms } from './hooks/use-orbit-uniforms';

// Shaders
export { orbitVertexShader } from './shaders/orbit-vertex';
export { orbitFragmentShader } from './shaders/orbit-fragment';

