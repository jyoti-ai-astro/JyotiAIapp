/**
 * DHARMA WHEEL ENGINE (E28)
 * 
 * Phase 2 — Section 24: DHARMA WHEEL ENGINE
 * 
 * Complete Dharma Wheel system exports
 */

// Main component
export { DharmaWheel } from './dharma-wheel';
export type { DharmaWheelProps } from './dharma-wheel';

// Engine
export { DharmaWheelEngine } from './dharma-wheel-engine';
export type { DharmaWheelEngineConfig, WheelData, FlameRingData, JewelData } from './dharma-wheel-engine';

// Hooks
export { useDharmaWheelMotion } from './hooks/use-dharma-wheel-motion';
export type { DharmaWheelMotionState } from './hooks/use-dharma-wheel-motion';

export { useDharmaWheelUniforms } from './hooks/use-dharma-wheel-uniforms';
export type { DharmaWheelUniforms } from './hooks/use-dharma-wheel-uniforms';

// Shaders
export { dharmaWheelVertexShader } from './shaders/dharma-wheel-vertex';
export { dharmaWheelFragmentShader } from './shaders/dharma-wheel-fragment';

