/**
 * KARMA WHEEL ENGINE (E40)
 * 
 * Phase 2 — Section 36: KARMA WHEEL ENGINE
 * 
 * Complete Karma Wheel system exports
 */

// Main component
export { KarmaWheel } from './karma-wheel';
export type { KarmaWheelProps } from './karma-wheel';

// Engine
export { KarmaWheelEngine } from './karma-wheel-engine';
export type { KarmaWheelEngineConfig, OuterRingData, GlyphData, CoreData } from './karma-wheel-engine';

// Hooks
export { useKarmaWheelMotion } from './hooks/use-karma-motion';
export type { KarmaWheelMotionState } from './hooks/use-karma-motion';

export { useKarmaWheelUniforms } from './hooks/use-karma-uniforms';
export type { KarmaWheelUniforms } from './hooks/use-karma-uniforms';

// Shaders
export { karmaVertexShader } from './shaders/karma-vertex';
export { karmaFragmentShader } from './shaders/karma-fragment';

