/**
 * CELESTIAL HORIZON ENGINE v2 (E56)
 * 
 * Phase 2 — Section 52: CELESTIAL HORIZON ENGINE v2
 * 
 * Complete Celestial Horizon v2 system exports
 */

// Main component
export { CelestialHorizonV2 } from './celestial-horizon';
export type { CelestialHorizonV2Props } from './celestial-horizon';

// Engine
export { CelestialHorizonEngine } from './celestial-horizon-engine';
export type { CelestialHorizonEngineConfig, GradientPlaneData, FogBandData, DiffractionEdgeData, AuroraBandData, LightRayData, ParticleData } from './celestial-horizon-engine';

// Hooks
export { useCelestialHorizonMotion } from './hooks/use-celestial-horizon-motion';
export type { CelestialHorizonMotionState } from './hooks/use-celestial-horizon-motion';

export { useCelestialHorizonUniforms } from './hooks/use-celestial-horizon-uniforms';
export type { CelestialHorizonUniforms } from './hooks/use-celestial-horizon-uniforms';

// Shaders
export { celestialHorizonVertexShader } from './shaders/celestial-horizon-vertex';
export { celestialHorizonFragmentShader } from './shaders/celestial-horizon-fragment';

