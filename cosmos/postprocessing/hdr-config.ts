/**
 * HDR Configuration
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Lens & Bloom Engine (E12)
 * 
 * HDR tone mapping configuration using ACES
 */

import { ToneMappingMode } from 'postprocessing';

export interface HDRConfig {
  /** Tone mapping mode */
  toneMapping: ToneMappingMode;
  
  /** Exposure */
  exposure: number;
  
  /** White point */
  whitePoint: number;
}

/**
 * ACES tone mapping configuration
 * Provides cinematic HDR rendering
 */
export const acesHDRConfig: HDRConfig = {
  toneMapping: ToneMappingMode.ACES_FILMIC,
  exposure: 1.0,
  whitePoint: 4.0,
};

/**
 * Default HDR config for cosmic scenes
 */
export const defaultHDRConfig: HDRConfig = {
  toneMapping: ToneMappingMode.ACES_FILMIC,
  exposure: 1.2,
  whitePoint: 5.0,
};

