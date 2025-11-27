/**
 * DIVINE THRONE ENGINE v3 (E64)
 * 
 * Phase 2 — Section 60: DIVINE THRONE ENGINE v3
 * 
 * Complete Divine Throne v3 system exports
 */

// Main component
export { DivineThroneV3 } from './divine-throne';
export type { DivineThroneV3Props } from './divine-throne';

// Engine
export { DivineThroneEngine } from './divine-throne-engine';
export type { DivineThroneEngineConfig, ThronePillarData, GoldenInsigniaData, DivineSpireData, OrbitalRingData, KarmicThreadData, LightPillarData, AscensionRayData } from './divine-throne-engine';

// Hooks
export { useDivineThroneMotion } from './hooks/use-divine-throne-motion';
export type { DivineThroneMotionState } from './hooks/use-divine-throne-motion';

export { useDivineThroneUniforms } from './hooks/use-divine-throne-uniforms';
export type { DivineThroneUniforms } from './hooks/use-divine-throne-uniforms';

// Shaders
export { divineThroneVertexShader } from './shaders/divine-throne-vertex';
export { divineThroneFragmentShader } from './shaders/divine-throne-fragment';

