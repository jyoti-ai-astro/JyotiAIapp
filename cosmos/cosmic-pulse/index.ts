/**
 * COSMIC PULSE FIELD ENGINE (E8)
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Complete Cosmic Pulse Field system exports
 */

// Main component
export { CosmicPulseField } from './cosmic-pulse-field';
export type { CosmicPulseFieldProps } from './cosmic-pulse-field';

// Hooks
export { usePulseUniforms } from './hooks/use-pulse-uniforms';
export type { PulseUniforms, UsePulseUniformsProps } from './hooks/use-pulse-uniforms';

export { usePulseAudio } from './hooks/use-pulse-audio';
export type { UsePulseAudioProps, PulseAudioValues } from './hooks/use-pulse-audio';

export { usePulseScroll } from './hooks/use-pulse-scroll';
export type { UsePulseScrollProps } from './hooks/use-pulse-scroll';

// Shaders
export { pulseVertexShader } from './shaders/pulse-vertex';
export { pulseFragmentShader } from './shaders/pulse-fragment';

