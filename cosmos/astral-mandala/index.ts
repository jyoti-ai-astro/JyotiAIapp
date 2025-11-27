/**
 * ASTRAL MANDALA ENGINE (E38)
 * 
 * Phase 2 — Section 34: ASTRAL MANDALA ENGINE
 * 
 * Complete Astral Mandala system exports
 */

// Main component
export { AstralMandala } from './astral-mandala';
export type { AstralMandalaProps } from './astral-mandala';

// Engine
export { AstralMandalaEngine } from './astral-mandala-engine';
export type { AstralMandalaEngineConfig, RingData, GlyphData, CoreData } from './astral-mandala-engine';

// Hooks
export { useAstralMandalaMotion } from './hooks/use-mandala-motion';
export type { AstralMandalaMotionState } from './hooks/use-mandala-motion';

export { useAstralMandalaUniforms } from './hooks/use-mandala-uniforms';
export type { AstralMandalaUniforms } from './hooks/use-mandala-uniforms';

// Shaders
export { mandalaVertexShader } from './shaders/mandala-vertex';
export { mandalaFragmentShader } from './shaders/mandala-fragment';

