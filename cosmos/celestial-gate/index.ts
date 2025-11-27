/**
 * CELESTIAL GATE ENGINE (E36)
 * 
 * Phase 2 — Section 32: CELESTIAL GATE ENGINE
 * 
 * Complete Celestial Gate system exports
 */

// Main component
export { CelestialGate } from './celestial-gate';
export type { CelestialGateProps } from './celestial-gate';

// Engine
export { CelestialGateEngine } from './celestial-gate-engine';
export type { CelestialGateEngineConfig, HaloData, SigilData, CoreData } from './celestial-gate-engine';

// Hooks
export { useCelestialGateMotion } from './hooks/use-gate-motion';
export type { CelestialGateMotionState } from './hooks/use-gate-motion';

export { useCelestialGateUniforms } from './hooks/use-gate-uniforms';
export type { CelestialGateUniforms } from './hooks/use-gate-uniforms';

// Shaders
export { gateVertexShader } from './shaders/gate-vertex';
export { gateFragmentShader } from './shaders/gate-fragment';

