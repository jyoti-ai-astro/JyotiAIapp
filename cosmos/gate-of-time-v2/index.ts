/**
 * GATE OF TIME ENGINE v2 (E61)
 * 
 * Phase 2 — Section 57: GATE OF TIME ENGINE v2
 * 
 * Complete Gate of Time v2 system exports
 */

// Main component
export { GateOfTimeV2 } from './gate-of-time';
export type { GateOfTimeV2Props } from './gate-of-time';

// Engine
export { GateOfTimeEngine } from './gate-of-time-engine';
export type { GateOfTimeEngineConfig, ChronoRingData, GlyphData, TimeStreamData, RippleWaveData, TemporalThreadData } from './gate-of-time-engine';

// Hooks
export { useGateOfTimeMotion } from './hooks/use-gate-of-time-motion';
export type { GateOfTimeMotionState } from './hooks/use-gate-of-time-motion';

export { useGateOfTimeUniforms } from './hooks/use-gate-of-time-uniforms';
export type { GateOfTimeUniforms } from './hooks/use-gate-of-time-uniforms';

// Shaders
export { gateOfTimeVertexShader } from './shaders/gate-of-time-vertex';
export { gateOfTimeFragmentShader } from './shaders/gate-of-time-fragment';

