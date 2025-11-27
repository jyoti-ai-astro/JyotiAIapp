/**
 * CELESTIAL RIBBON ENGINE (E42)
 * 
 * Phase 2 — Section 38: CELESTIAL RIBBON ENGINE
 * 
 * Complete Celestial Ribbon system exports
 */

// Main component
export { CelestialRibbon } from './celestial-ribbon';
export type { CelestialRibbonProps } from './celestial-ribbon';

// Engine
export { CelestialRibbonEngine } from './celestial-ribbon-engine';
export type { CelestialRibbonEngineConfig, RibbonData, SpiralData, ParticleData } from './celestial-ribbon-engine';

// Hooks
export { useCelestialRibbonMotion } from './hooks/use-ribbon-motion';
export type { CelestialRibbonMotionState } from './hooks/use-ribbon-motion';

export { useCelestialRibbonUniforms } from './hooks/use-ribbon-uniforms';
export type { CelestialRibbonUniforms } from './hooks/use-ribbon-uniforms';

// Shaders
export { ribbonVertexShader } from './shaders/ribbon-vertex';
export { ribbonFragmentShader } from './shaders/ribbon-fragment';

