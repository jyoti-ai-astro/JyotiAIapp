/**
 * SOLAR ARC FIELD ENGINE (E51)
 * 
 * Phase 2 — Section 47: SOLAR ARC FIELD ENGINE
 * 
 * Complete Solar Arc system exports
 */

// Main component
export { SolarArc } from './solar-arc';
export type { SolarArcProps } from './solar-arc';

// Engine
export { SolarArcEngine } from './solar-arc-engine';
export type { SolarArcEngineConfig, PrimaryArcData, ReverseArcData, SparkData } from './solar-arc-engine';

// Hooks
export { useSolarArcMotion } from './hooks/use-solar-arc-motion';
export type { SolarArcMotionState } from './hooks/use-solar-arc-motion';

export { useSolarArcUniforms } from './hooks/use-solar-arc-uniforms';
export type { SolarArcUniforms } from './hooks/use-solar-arc-uniforms';

// Shaders
export { solarArcVertexShader } from './shaders/solar-arc-vertex';
export { solarArcFragmentShader } from './shaders/solar-arc-fragment';

