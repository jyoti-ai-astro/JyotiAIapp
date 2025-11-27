/**
 * DHARMA WHEEL ENGINE v2 (E59)
 * 
 * Phase 2 — Section 55: DHARMA WHEEL ENGINE v2
 * 
 * Complete Dharma Wheel v2 system exports
 */

// Main component
export { DharmaWheelV2 } from './dharma-wheel';
export type { DharmaWheelV2Props } from './dharma-wheel';

// Engine
export { DharmaWheelEngine } from './dharma-wheel-engine';
export type { DharmaWheelEngineConfig, SpokeData, ChakraRingData, GlyphData, MantraBandData } from './dharma-wheel-engine';

// Hooks
export { useDharmaWheelMotion } from './hooks/use-dharma-wheel-motion';
export type { DharmaWheelMotionState } from './hooks/use-dharma-wheel-motion';

export { useDharmaWheelUniforms } from './hooks/use-dharma-wheel-uniforms';
export type { DharmaWheelUniforms } from './hooks/use-dharma-wheel-uniforms';

// Shaders
export { dharmaWheelVertexShader } from './shaders/dharma-wheel-vertex';
export { dharmaWheelFragmentShader } from './shaders/dharma-wheel-fragment';

