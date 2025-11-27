/**
 * AURA SHIELD ENGINE (E23)
 * 
 * Phase 2 — Section 19: AURA SHIELD ENGINE
 * 
 * Complete Aura Shield system exports
 */

// Main component
export { AuraShield } from './aura-shield';
export type { AuraShieldProps } from './aura-shield';

// Engine
export { AuraShieldEngine } from './aura-shield-engine';
export type { AuraShieldEngineConfig } from './aura-shield-engine';

// Hooks
export { useAuraShieldMotion } from './hooks/use-aura-shield-motion';
export type { AuraShieldMotionState } from './hooks/use-aura-shield-motion';

export { useAuraShieldUniforms } from './hooks/use-aura-shield-uniforms';
export type { AuraShieldUniforms } from './hooks/use-aura-shield-uniforms';

// Shaders
export { auraShieldVertexShader } from './shaders/aura-shield-vertex';
export { auraShieldFragmentShader } from './shaders/aura-shield-fragment';

