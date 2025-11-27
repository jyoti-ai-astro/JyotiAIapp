/**
 * SOUL MIRROR ENGINE (E30)
 * 
 * Phase 2 — Section 26: SOUL MIRROR ENGINE
 * 
 * Complete Soul Mirror system exports
 */

// Main component
export { SoulMirror } from './soul-mirror';
export type { SoulMirrorProps } from './soul-mirror';

// Engine
export { SoulMirrorEngine } from './soul-mirror-engine';
export type { SoulMirrorEngineConfig, MirrorDiscData, EchoRingData, GlyphData } from './soul-mirror-engine';

// Hooks
export { useSoulMirrorMotion } from './hooks/use-soul-mirror-motion';
export type { SoulMirrorMotionState } from './hooks/use-soul-mirror-motion';

export { useSoulMirrorUniforms } from './hooks/use-soul-mirror-uniforms';
export type { SoulMirrorUniforms } from './hooks/use-soul-mirror-uniforms';

// Shaders
export { soulMirrorVertexShader } from './shaders/soul-mirror-vertex';
export { soulMirrorFragmentShader } from './shaders/soul-mirror-fragment';

