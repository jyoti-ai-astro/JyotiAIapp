/**
 * CHAKRA PULSE ENGINE (E39)
 * 
 * Phase 2 — Section 35: CHAKRA PULSE ENGINE
 * 
 * Complete Chakra Pulse system exports
 */

// Main component
export { ChakraPulse } from './chakra-pulse';
export type { ChakraPulseProps } from './chakra-pulse';

// Engine
export { ChakraPulseEngine } from './chakra-pulse-engine';
export type { ChakraPulseEngineConfig, ChakraData, PulseRingData, SpineData } from './chakra-pulse-engine';

// Hooks
export { useChakraPulseMotion } from './hooks/use-chakra-motion';
export type { ChakraPulseMotionState } from './hooks/use-chakra-motion';

export { useChakraPulseUniforms } from './hooks/use-chakra-uniforms';
export type { ChakraPulseUniforms } from './hooks/use-chakra-uniforms';

// Shaders
export { chakraVertexShader } from './shaders/chakra-vertex';
export { chakraFragmentShader } from './shaders/chakra-fragment';

