/**
 * BLESSING WAVE ENGINE (E16)
 * 
 * Phase 2 — Section 13: ACCESSIBILITY & MOTION SAFETY LAYER v1.0
 * 
 * Complete Blessing Wave system exports
 */

// Main component
export { BlessingWave } from './blessing-wave';
export type { BlessingWaveProps } from './blessing-wave';

// Engine
export { BlessingEngine } from './blessing-engine';
export type { BlessingEngineConfig } from './blessing-engine';

// Hooks
export { useBlessingWaveTrigger } from './hooks/use-blessing-trigger';
export type { BlessingWaveTriggerState } from './hooks/use-blessing-trigger';

export { useBlessingUniforms } from './hooks/use-blessing-uniforms';
export type { BlessingState, BlessingUniforms } from './hooks/use-blessing-uniforms';

// Shaders
export { blessingVertexShader } from './shaders/blessing-vertex';
export { blessingFragmentShader } from './shaders/blessing-fragment';

