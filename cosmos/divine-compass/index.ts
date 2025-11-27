/**
 * DIVINE COMPASS ENGINE (E31)
 * 
 * Phase 2 — Section 27: DIVINE COMPASS ENGINE
 * 
 * Complete Divine Compass system exports
 */

// Main component
export { DivineCompass } from './divine-compass';
export type { DivineCompassProps } from './divine-compass';

// Engine
export { DivineCompassEngine } from './divine-compass-engine';
export type { DivineCompassEngineConfig, CompassRingData, GlyphData, StarData, ArrowData } from './divine-compass-engine';

// Hooks
export { useCompassMotion } from './hooks/use-compass-motion';
export type { CompassMotionState } from './hooks/use-compass-motion';

export { useCompassUniforms } from './hooks/use-compass-uniforms';
export type { CompassUniforms } from './hooks/use-compass-uniforms';

// Shaders
export { compassVertexShader } from './shaders/compass-vertex';
export { compassFragmentShader } from './shaders/compass-fragment';

