/**
 * Cosmic FilmGrain v1 Effect Component
 * 
 * Phase 3 — Section 6: COSMIC FILMGRAIN ENGINE v1
 * Cosmic FilmGrain Engine v1 (F6)
 * 
 * React wrapper for CosmicFilmGrainPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicFilmGrainPass } from './cosmic-filmgrain-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicFilmGrainPass);

export interface CosmicFilmGrainEffectProps {
  /** Grain intensity */
  intensity?: number;
  
  /** Luma grain intensity */
  grainIntensity?: number;
  
  /** Chromatic grain intensity */
  chromaIntensity?: number;
  
  /** Flicker strength */
  flickerStrength?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** Camera FOV */
  cameraFOV?: number;
  
  /** Mobile fallback: reduce grain size & disable chroma-noise */
  isMobile?: boolean;
}

export const CosmicFilmGrainEffect: React.FC<CosmicFilmGrainEffectProps> = ({
  intensity = 1.0,
  grainIntensity = 0.15,
  chromaIntensity = 0.1,
  flickerStrength = 0.05,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicFilmGrainPass | null>(null);
  
  // Mobile fallback: reduce grain size & disable chroma-noise
  const grainSize = isMobile ? 2.0 : 1.0;
  const adjustedChromaIntensity = isMobile ? chromaIntensity * 0.5 : chromaIntensity;
  const disableChroma = isMobile;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-filmgrain', (motionState) => {
      // Update audio reactive values
      if (passRef.current) {
        passRef.current.setAudioReactive(
          motionState.bassMotion,
          motionState.midMotion,
          motionState.highMotion
        );
      }
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-filmgrain');
    };
  }, []);

  // Update pass each frame
  useFrame((state, delta) => {
    if (!passRef.current) return;
    
    timeRef.current += delta;

    // Update time
    passRef.current.setTime(timeRef.current);

    // Update resolution
    passRef.current.setResolution(size.width, size.height);

    // Update grain intensity (motion-reactive: bass → intensity)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive grain intensity: bass → intensity
    const reactiveGrainIntensity = grainIntensity * (1.0 + bass * 0.3);
    passRef.current.setGrainIntensity(reactiveGrainIntensity);

    // Motion-reactive chroma intensity: mid → intensity
    const reactiveChromaIntensity = adjustedChromaIntensity * (1.0 + mid * 0.2);
    passRef.current.setChromaIntensity(reactiveChromaIntensity);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      passRef.current.setCameraFOV((camera as any).fov);
    } else {
      passRef.current.setCameraFOV(cameraFOV);
    }

    // Update grain size and chroma disable for mobile
    if (isMobile) {
      passRef.current.setGrainSize(2.0);
      passRef.current.setDisableChroma(true);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicFilmGrainPass | null) => {
        passRef.current = instance;
      }}
      intensity={intensity}
      grainIntensity={grainIntensity}
      chromaIntensity={adjustedChromaIntensity}
      flickerStrength={flickerStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
      grainSize={grainSize}
      disableChroma={disableChroma}
    />
  );
};

