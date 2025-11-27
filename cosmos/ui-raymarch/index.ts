/**
 * COSMIC UI RAYMARCH OVERLAY ENGINE (E19)
 * 
 * Phase 2 — Section 15: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * 
 * Complete Cosmic UI Raymarch Overlay system exports
 */

// Main component
export { UIRaymarch } from './ui-raymarch';
export type { UIRaymarchProps } from './ui-raymarch';

// Hooks
export { useUIRaymarchMotion } from './hooks/use-ui-raymarch-motion';
export type { UIRaymarchMotionState } from './hooks/use-ui-raymarch-motion';

export { useUIRaymarchUniforms } from './hooks/use-ui-raymarch-uniforms';
export type { UIRaymarchUniforms } from './hooks/use-ui-raymarch-uniforms';

// Shaders
export { uiRaymarchVertexShader } from './shaders/ui-raymarch-vertex';
export { uiRaymarchFragmentShader } from './shaders/ui-raymarch-fragment';

