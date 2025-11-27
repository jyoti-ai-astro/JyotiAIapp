/**
 * KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Complete Kundalini wave engine exports
 */

// Main component
export { KundaliniWave } from './kundalini-wave';
export type { KundaliniWaveProps } from './kundalini-wave';

// Hooks
export { useKundaliniUniforms } from './hooks/use-kundalini-uniforms';
export type { KundaliniUniforms, UseKundaliniUniformsProps } from './hooks/use-kundalini-uniforms';

export { useKundaliniAudio } from './hooks/use-kundalini-audio';
export type { UseKundaliniAudioProps, KundaliniAudioValues } from './hooks/use-kundalini-audio';

export { useKundaliniScroll } from './hooks/use-kundalini-scroll';
export type { UseKundaliniScrollProps } from './hooks/use-kundalini-scroll';

// Shaders
export { kundaliniVertexShader } from './shaders/kundalini-vertex';
export { kundaliniFragmentShader } from './shaders/kundalini-fragment';

