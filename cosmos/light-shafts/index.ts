/**
 * CELESTIAL LIGHT SHAFTS ENGINE (E11)
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Complete Light Shafts system exports
 */

// Main component
export { LightShafts } from './light-shafts';
export type { LightShaftsProps } from './light-shafts';

// Hooks
export { useShaftsUniforms } from './hooks/use-shafts-uniforms';
export type { ShaftsUniforms, UseShaftsUniformsProps } from './hooks/use-shafts-uniforms';

export { useShaftsAudio } from './hooks/use-shafts-audio';
export type { UseShaftsAudioProps, ShaftsAudioValues } from './hooks/use-shafts-audio';

export { useShaftsScroll } from './hooks/use-shafts-scroll';
export type { UseShaftsScrollProps } from './hooks/use-shafts-scroll';

// Shaders
export { shaftsVertexShader } from './shaders/shafts-vertex';
export { shaftsFragmentShader } from './shaders/shafts-fragment';

