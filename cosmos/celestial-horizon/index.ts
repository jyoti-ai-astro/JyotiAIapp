/**
 * CELESTIAL HORIZON ENGINE (E45)
 * 
 * Phase 2 — Section 41: CELESTIAL HORIZON ENGINE
 * 
 * Complete Celestial Horizon system exports
 */

// Main component
export { CelestialHorizon } from './celestial-horizon';
export type { CelestialHorizonProps } from './celestial-horizon';

// Engine
export { CelestialHorizonEngine } from './celestial-horizon-engine';
export type { CelestialHorizonEngineConfig, PlaneData, BandData, ParticleData } from './celestial-horizon-engine';

// Hooks
export { useCelestialHorizonMotion } from './hooks/use-horizon-motion';
export type { CelestialHorizonMotionState } from './hooks/use-horizon-motion';

export { useCelestialHorizonUniforms } from './hooks/use-horizon-uniforms';
export type { CelestialHorizonUniforms } from './hooks/use-horizon-uniforms';

// Shaders
export { horizonVertexShader } from './shaders/horizon-vertex';
export { horizonFragmentShader } from './shaders/horizon-fragment';

