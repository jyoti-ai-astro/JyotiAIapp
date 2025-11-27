/**
 * ENERGY RIBBON ENGINE (E5)
 * 
 * Phase 2 — Section 5 Extension: ENERGY RIBBON ENGINE
 * 
 * Complete Energy Ribbon system exports
 */

// Main component
export { EnergyRibbons } from './energy-ribbons';
export type { EnergyRibbonsProps } from './energy-ribbons';

// Hooks
export { useRibbonUniforms } from './hooks/use-ribbon-uniforms';
export type { RibbonUniforms, UseRibbonUniformsProps } from './hooks/use-ribbon-uniforms';

export { useRibbonAudio } from './hooks/use-ribbon-audio';
export type { UseRibbonAudioProps, RibbonAudioValues } from './hooks/use-ribbon-audio';

export { useRibbonScroll } from './hooks/use-ribbon-scroll';
export type { UseRibbonScrollProps } from './hooks/use-ribbon-scroll';

// Shaders
export { ribbonVertexShader } from './shaders/ribbon-vertex';
export { ribbonFragmentShader } from './shaders/ribbon-fragment';

