/**
 * CELESTIAL WAVE ENGINE (E46)
 * 
 * Phase 2 — Section 42: CELESTIAL WAVE ENGINE
 * 
 * Complete Celestial Wave system exports
 */

// Main component
export { CelestialWave } from './celestial-wave';
export type { CelestialWaveProps } from './celestial-wave';

// Engine
export { CelestialWaveEngine } from './celestial-wave-engine';
export type { CelestialWaveEngineConfig, WavePlaneData, CrossWaveData, MistParticleData } from './celestial-wave-engine';

// Hooks
export { useCelestialWaveMotion } from './hooks/use-wave-motion';
export type { CelestialWaveMotionState } from './hooks/use-wave-motion';

export { useCelestialWaveUniforms } from './hooks/use-wave-uniforms';
export type { CelestialWaveUniforms } from './hooks/use-wave-uniforms';

// Shaders
export { waveVertexShader } from './shaders/wave-vertex';
export { waveFragmentShader } from './shaders/wave-fragment';

