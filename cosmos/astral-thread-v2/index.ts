/**
 * ASTRAL THREAD ENGINE v2 (E58)
 * 
 * Phase 2 — Section 54: ASTRAL THREAD ENGINE v2
 * 
 * Complete Astral Thread v2 system exports
 */

// Main component
export { AstralThreadV2 } from './astral-thread';
export type { AstralThreadV2Props } from './astral-thread';

// Engine
export { AstralThreadEngine } from './astral-thread-engine';
export type { AstralThreadEngineConfig, BeamData, LatticeData, PacketData, StrandData } from './astral-thread-engine';

// Hooks
export { useAstralThreadMotion } from './hooks/use-astral-thread-motion';
export type { AstralThreadMotionState } from './hooks/use-astral-thread-motion';

export { useAstralThreadUniforms } from './hooks/use-astral-thread-uniforms';
export type { AstralThreadUniforms } from './hooks/use-astral-thread-uniforms';

// Shaders
export { astralThreadVertexShader } from './shaders/astral-thread-vertex';
export { astralThreadFragmentShader } from './shaders/astral-thread-fragment';

