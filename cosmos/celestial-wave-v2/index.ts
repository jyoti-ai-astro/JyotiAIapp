/**
 * CELESTIAL WAVE ENGINE v2 (E55)
 * 
 * Phase 2 — Section 51: CELESTIAL WAVE ENGINE v2
 * 
 * Complete Celestial Wave v2 system exports
 */

// Main component
export { CelestialWaveV2 } from './celestial-wave';
export type { CelestialWaveV2Props } from './celestial-wave';

// Engine
export { CelestialWaveEngine } from './celestial-wave-engine';
export type { CelestialWaveEngineConfig, WaveSheetData, CrossWaveData, RippleRingData, AuraStreamData, ParticleData } from './celestial-wave-engine';

// Hooks
export { useCelestialWaveMotion } from './hooks/use-celestial-wave-motion';
export type { CelestialWaveMotionState } from './hooks/use-celestial-wave-motion';

export { useCelestialWaveUniforms } from './hooks/use-celestial-wave-uniforms';
export type { CelestialWaveUniforms } from './hooks/use-celestial-wave-uniforms';

// Shaders
export { celestialWaveVertexShader } from './shaders/celestial-wave-vertex';
export { celestialWaveFragmentShader } from './shaders/celestial-wave-fragment';

