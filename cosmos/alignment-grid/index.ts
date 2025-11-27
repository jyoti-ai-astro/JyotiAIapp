/**
 * ALIGNMENT GRID ENGINE (E26)
 * 
 * Phase 2 — Section 22: COSMIC ALIGNMENT GRID ENGINE
 * 
 * Complete Alignment Grid system exports
 */

// Main component
export { AlignmentGrid } from './grid';
export type { AlignmentGridProps } from './grid';

// Engine
export { AlignmentGridEngine } from './grid-engine';
export type { AlignmentGridEngineConfig } from './grid-engine';

// Hooks
export { useGridMotion } from './hooks/use-grid-motion';
export type { GridMotionState } from './hooks/use-grid-motion';

export { useGridUniforms } from './hooks/use-grid-uniforms';
export type { GridUniforms } from './hooks/use-grid-uniforms';

// Shaders
export { gridVertexShader } from './shaders/grid-vertex';
export { gridFragmentShader } from './shaders/grid-fragment';

