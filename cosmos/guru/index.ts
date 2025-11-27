/**
 * GURU AVATAR ENERGY SYSTEM (E15)
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * 
 * Complete Guru Avatar Energy system exports
 */

// Main component
export { GuruEnergy } from './guru-energy';
export type { GuruEnergyProps } from './guru-energy';

// Engine
export { GuruEngine } from './guru-engine';
export type { GuruEngineConfig } from './guru-engine';

// Hooks
export { useGuruBreath } from './hooks/use-guru-breath';
export type { GuruBreathState } from './hooks/use-guru-breath';

export { useGuruEye } from './hooks/use-guru-eye';
export type { GuruEyeState } from './hooks/use-guru-eye';

export { useGuruGlow } from './hooks/use-guru-glow';
export type { GuruGlowState } from './hooks/use-guru-glow';

export { useGuruSync } from './hooks/use-guru-sync';
export type { GuruState } from './hooks/use-guru-sync';

export { useGuruUniforms } from './hooks/use-guru-uniforms';
export type { GuruUniforms } from './hooks/use-guru-uniforms';

// Shaders
export { guruVertexShader } from './shaders/guru-vertex';
export { guruFragmentShader } from './shaders/guru-fragment';

