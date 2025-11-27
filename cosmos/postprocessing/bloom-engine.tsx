/**
 * Celestial Bloom Engine Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Lens & Bloom Engine (E12)
 * 
 * Post-processing bloom system with:
 * - HDR tone mapping (ACES)
 * - Additive light accumulation
 * - Selective bloom thresholding
 * - Multi-stage bloom
 * - Audio-reactive bloom
 * - Godray pass
 * - Lens dirt overlay
 */

'use client';

import React, { useMemo } from 'react';
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { GodrayEffect } from './passes/godray-effect';
import { LensDirtEffect } from './passes/lens-dirt-effect';
import { defaultHDRConfig } from './hdr-config';

export interface CelestialBloomProps {
  /** Intensity multiplier */
  intensity?: number;
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Bloom threshold */
  threshold?: number;
  
  /** Bloom intensity */
  bloomIntensity?: number;
  
  /** Bloom radius */
  bloomRadius?: number;
  
  /** Godray intensity */
  godrayIntensity?: number;
  
  /** Lens dirt intensity */
  lensDirtIntensity?: number;
}

export const CelestialBloom: React.FC<CelestialBloomProps> = ({
  intensity = 1.0,
  scroll = 0,
  audioReactive,
  threshold = 0.85,
  bloomIntensity = 1.0,
  bloomRadius = 0.4,
  godrayIntensity = 0.3,
  lensDirtIntensity = 1.0,
}) => {
  // Normalize audio values
  const bass = useMemo(() => Math.max(0, Math.min(1, audioReactive?.bass || 0)), [audioReactive?.bass]);
  const mid = useMemo(() => Math.max(0, Math.min(1, audioReactive?.mid || 0)), [audioReactive?.mid]);
  const high = useMemo(() => Math.max(0, Math.min(1, audioReactive?.high || 0)), [audioReactive?.high]);
  
  // Calculate bloom strength with bass boost
  const bloomStrength = useMemo(() => {
    // Bass → Bloom Strength Boost (+0.1 to +0.4)
    return bloomIntensity * (1.0 + 0.1 + bass * 0.3);
  }, [bloomIntensity, bass]);
  
  // Calculate bloom radius with mid modulation
  const bloomRadiusModulated = useMemo(() => {
    // Mid → Bloom Radius Modulation
    return bloomRadius * (1.0 + mid * 0.2);
  }, [bloomRadius, mid]);
  
  return (
    <EffectComposer>
      {/* Stage A: Pre-Threshold Extract (via Bloom component) */}
      <Bloom
        intensity={bloomStrength}
        luminanceThreshold={threshold}
        luminanceSmoothing={0.9}
        mipmapBlur={true}
        radius={bloomRadiusModulated}
      />
      
      {/* Stage B & C: Gaussian Blur + Composite (handled by Bloom) */}
      
      {/* HDR Tone Mapping (ACES) */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={defaultHDRConfig.whitePoint}
        middleGrey={0.6}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={2.0}
      />
      
      {/* Godray Pass */}
      <GodrayEffect
        intensity={godrayIntensity * intensity}
        scroll={scroll}
        high={high}
      />
      
      {/* Stage D: Lens Dirt Overlay (subtle) */}
      <LensDirtEffect
        intensity={lensDirtIntensity * intensity}
        scroll={scroll}
        high={high}
      />
      
      {/* Subtle vignette for depth */}
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={0.3}
      />
    </EffectComposer>
  );
};

