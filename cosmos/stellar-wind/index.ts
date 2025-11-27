/**
 * STELLAR WIND SHEAR ENGINE (E50)
 * 
 * Phase 2 — Section 46: STELLAR WIND SHEAR ENGINE
 * 
 * Complete Stellar Wind system exports
 */

// Main component
export { StellarWind } from './stellar-wind';
export type { StellarWindProps } from './stellar-wind';

// Engine
export { StellarWindEngine } from './stellar-wind-engine';
export type { StellarWindEngineConfig, WindSheetData, RibbonPlaneData, DustParticleData } from './stellar-wind-engine';

// Hooks
export { useStellarWindMotion } from './hooks/use-stellar-wind-motion';
export type { StellarWindMotionState } from './hooks/use-stellar-wind-motion';

export { useStellarWindUniforms } from './hooks/use-stellar-wind-uniforms';
export type { StellarWindUniforms } from './hooks/use-stellar-wind-uniforms';

// Shaders
export { stellarWindVertexShader } from './shaders/stellar-wind-vertex';
export { stellarWindFragmentShader } from './shaders/stellar-wind-fragment';

