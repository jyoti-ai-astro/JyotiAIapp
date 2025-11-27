/**
 * CELESTIAL LENS & BLOOM ENGINE (E12)
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Complete post-processing system exports
 */

// Main component
export { CelestialBloom } from './bloom-engine';
export type { CelestialBloomProps } from './bloom-engine';

// HDR Config
export { acesHDRConfig, defaultHDRConfig } from './hdr-config';
export type { HDRConfig } from './hdr-config';

// Passes
export { BloomPass, defaultBloomPassConfig } from './passes/bloom-pass';
export type { BloomPassConfig } from './passes/bloom-pass';
export { GodrayPass } from './passes/godray-pass';
export { GodrayEffect } from './passes/godray-effect';
export type { GodrayEffectProps } from './passes/godray-effect';
export { LensDirtPass } from './passes/lens-dirt-pass';
export { LensDirtEffect } from './passes/lens-dirt-effect';
export type { LensDirtEffectProps } from './passes/lens-dirt-effect';

// Shaders
export { bloomThresholdShader } from './shaders/bloom-threshold';
export { lensDirtFragmentShader } from './shaders/lens-dirt-fragment';

