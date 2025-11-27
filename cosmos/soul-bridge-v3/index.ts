/**
 * SOUL BRIDGE ENGINE v3 (E62)
 * 
 * Phase 2 — Section 58: SOUL BRIDGE ENGINE v3
 * 
 * Complete Soul Bridge v3 system exports
 */

// Main component
export { SoulBridgeV3 } from './soul-bridge';
export type { SoulBridgeV3Props } from './soul-bridge';

// Engine
export { SoulBridgeEngine } from './soul-bridge-engine';
export type { SoulBridgeEngineConfig, TwinSpiralData, SoulLightData, SpiralRunnerData, AstralThreadData, SoulWaveData, BridgeGlyphData } from './soul-bridge-engine';

// Hooks
export { useSoulBridgeMotion } from './hooks/use-soul-bridge-motion';
export type { SoulBridgeMotionState } from './hooks/use-soul-bridge-motion';

export { useSoulBridgeUniforms } from './hooks/use-soul-bridge-uniforms';
export type { SoulBridgeUniforms } from './hooks/use-soul-bridge-uniforms';

// Shaders
export { soulBridgeVertexShader } from './shaders/soul-bridge-vertex';
export { soulBridgeFragmentShader } from './shaders/soul-bridge-fragment';

