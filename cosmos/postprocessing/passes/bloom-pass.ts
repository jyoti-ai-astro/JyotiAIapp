/**
 * Bloom Pass
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Lens & Bloom Engine (E12)
 * 
 * Multi-stage bloom implementation
 * Note: This is a helper for custom bloom thresholding
 * The actual bloom is handled by @react-three/postprocessing Bloom component
 */

export interface BloomPassConfig {
  threshold?: number;
  intensity?: number;
  radius?: number;
  bass?: number;
  mid?: number;
  high?: number;
}

export const defaultBloomPassConfig: BloomPassConfig = {
  threshold: 0.85,
  intensity: 1.0,
  radius: 0.4,
  bass: 0,
  mid: 0,
  high: 0,
};

