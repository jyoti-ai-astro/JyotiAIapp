/**
 * Cosmic Vignette v1 Effect Component
 * 
 * Phase 3 — Section 5: COSMIC VIGNETTE ENGINE v1
 * Cosmic Vignette Engine v1 (F5)
 * 
 * React wrapper for CosmicVignettePass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicVignettePass } from './cosmic-vignette-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicVignettePass);

export interface CosmicVignetteEffectProps {
  /** Vignette intensity */
  intensity?: number;
  
  /** Vignette radius */
  radius?: number;
  
  /** Color tint strength */
  tintStrength?: number;
  
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
  
  /** Mobile fallback: reduce tintStrength and enforce circular vignette */
  isMobile?: boolean;
}

export const CosmicVignetteEffect: React.FC<CosmicVignetteEffectProps> = ({
  intensity = 1.0,
  radius = 0.75,
  tintStrength = 0.1,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicVignettePass | null>(null);
  
  // Mobile fallback: reduce tintStrength and enforce circular vignette
  const adjustedTintStrength = isMobile ? tintStrength * 0.5 : tintStrength;
  const isCircular = isMobile;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-vignette', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-vignette');
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
    const reactiveIntensity = intensity * (1.0 + bass * 0.1 + mid * 0.08 + high * 0.05);
    passRef.current.setIntensity(reactiveIntensity);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      passRef.current.setCameraFOV((camera as any).fov);
    } else {
      passRef.current.setCameraFOV(cameraFOV);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicVignettePass | null) => {
        passRef.current = instance;
      }}
      intensity={intensity}
      vignetteStrength={0.5}
      vignetteRadius={radius}
      tintStrength={adjustedTintStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
      isCircular={isCircular}
    />
  );
};

