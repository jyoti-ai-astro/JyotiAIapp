/**
 * KARMIC THREAD ENGINE (E29)
 * 
 * Phase 2 — Section 25: COSMIC KARMIC THREAD ENGINE
 * 
 * Complete Karmic Thread system exports
 */

// Main component
export { KarmicThread } from './karmic-thread';
export type { KarmicThreadProps } from './karmic-thread';

// Engine
export { KarmicThreadEngine } from './karmic-thread-engine';
export type { KarmicThreadEngineConfig, RootThreadData, ParallelThreadData, GlyphData } from './karmic-thread-engine';

// Hooks
export { useKarmicThreadMotion } from './hooks/use-karmic-thread-motion';
export type { KarmicThreadMotionState } from './hooks/use-karmic-thread-motion';

export { useKarmicThreadUniforms } from './hooks/use-karmic-thread-uniforms';
export type { KarmicThreadUniforms } from './hooks/use-karmic-thread-uniforms';

// Shaders
export { karmicThreadVertexShader } from './shaders/karmic-thread-vertex';
export { karmicThreadFragmentShader } from './shaders/karmic-thread-fragment';

