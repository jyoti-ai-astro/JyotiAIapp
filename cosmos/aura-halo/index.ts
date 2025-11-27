/**
 * AURA HALO ENGINE (E7)
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Complete Aura Halo system exports
 */

// Main component
export { AuraHalo } from './aura-halo';
export type { AuraHaloProps } from './aura-halo';

// Hooks
export { useAuraHaloUniforms } from './hooks/use-aura-halo-uniforms';
export type { AuraHaloUniforms, UseAuraHaloUniformsProps } from './hooks/use-aura-halo-uniforms';

export { useAuraHaloAudio } from './hooks/use-aura-halo-audio';
export type { UseAuraHaloAudioProps, AuraHaloAudioValues } from './hooks/use-aura-halo-audio';

export { useAuraHaloScroll } from './hooks/use-aura-halo-scroll';
export type { UseAuraHaloScrollProps } from './hooks/use-aura-halo-scroll';

// Shaders
export { auraHaloVertexShader } from './shaders/aura-halo-vertex';
export { auraHaloFragmentShader } from './shaders/aura-halo-fragment';

