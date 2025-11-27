/**
 * Cosmic Chromatic v1 Effect Component
 * 
 * Phase 3 — Section 3: COSMIC CHROMATIC ENGINE v1
 * Cosmic Chromatic Engine v1 (F3)
 * 
 * React wrapper for CosmicChromaticPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicChromaticPass } from './cosmic-chromatic-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicChromaticPass);

export interface CosmicChromaticEffectProps {
  /** Chromatic aberration intensity */
  intensity?: number;
  
  /** Prism dispersion strength */
  prismStrength?: number;
  
  /** Velocity warp strength */
  warpStrength?: number;
  
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
  
  /** Global motion for velocity warp [x, y] */
  globalMotion?: [number, number];
  
  /** Mobile fallback: reduce RGB shift */
  isMobile?: boolean;
}

export const CosmicChromaticEffect: React.FC<CosmicChromaticEffectProps> = ({
  intensity = 0.02,
  prismStrength = 1.0,
  warpStrength = 0.1,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  globalMotion = [0, 0],
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const prevMouseRef = useRef<[number, number]>([0, 0]);
  const motionRef = useRef<[number, number]>([0, 0]);
  const passRef = useRef<CosmicChromaticPass | null>(null);
  
  // Mobile fallback: reduce RGB shift
  const adjustedIntensity = isMobile ? intensity * 0.5 : intensity;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-chromatic', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-chromatic');
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

    // Update intensity (motion-reactive: bass, mid, high)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive intensity
    const reactiveIntensity = adjustedIntensity * (1.0 + bass * 0.2 + mid * 0.15 + high * 0.1);
    passRef.current.setIntensity(reactiveIntensity);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      passRef.current.setCameraFOV((camera as any).fov);
    } else {
      passRef.current.setCameraFOV(cameraFOV);
    }

    // Update global motion for velocity warp
    // Approximate motion from globalMotion prop or calculate from state
    const motionX = globalMotion[0] || motionRef.current[0];
    const motionY = globalMotion[1] || motionRef.current[1];
    passRef.current.setGlobalMotion(motionX, motionY);
  });

  return (
    <Effect
      ref={(instance: CosmicChromaticPass | null) => {
        passRef.current = instance;
      }}
      intensity={adjustedIntensity}
      prismStrength={prismStrength}
      warpStrength={warpStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
      globalMotion={globalMotion}
    />
  );
};

