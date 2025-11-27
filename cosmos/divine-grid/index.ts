/**
 * DIVINE ALIGNMENT GRID ENGINE (E9)
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Complete Divine Alignment Grid system exports
 */

// Main component
export { DivineAlignmentGrid } from './divine-grid';
export type { DivineAlignmentGridProps } from './divine-grid';

// Hooks
export { useGridUniforms } from './hooks/use-grid-uniforms';
export type { GridUniforms, UseGridUniformsProps } from './hooks/use-grid-uniforms';

export { useGridAudio } from './hooks/use-grid-audio';
export type { UseGridAudioProps, GridAudioValues } from './hooks/use-grid-audio';

export { useGridScroll } from './hooks/use-grid-scroll';
export type { UseGridScrollProps } from './hooks/use-grid-scroll';

// Shaders
export { gridVertexShader } from './shaders/grid-vertex';
export { gridFragmentShader } from './shaders/grid-fragment';

