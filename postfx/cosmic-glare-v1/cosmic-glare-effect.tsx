/**
 * Cosmic Glare v1 Effect Component
 * 
 * Phase 3 — Section 4: COSMIC GLARE ENGINE v1
 * Cosmic Glare Engine v1 (F4)
 * 
 * React wrapper for CosmicGlarePass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicGlarePass } from './cosmic-glare-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicGlarePass);

export interface CosmicGlareEffectProps {
  /** Glare intensity */
  intensity?: number;
  
  /** Streak length */
  streakLength?: number;
  
  /** Star strength */
  starStrength?: number;
  
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
  
  /** Mobile fallback: reduce streak kernel */
  isMobile?: boolean;
}

export const CosmicGlareEffect: React.FC<CosmicGlareEffectProps> = ({
  intensity = 1.0,
  streakLength = 0.5,
  starStrength = 1.0,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicGlarePass | null>(null);
  
  // Mobile fallback: reduce streak kernel
  const kernelSize = isMobile ? 9 : 15;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-glare', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-glare');
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
    const reactiveIntensity = intensity * (1.0 + bass * 0.2 + mid * 0.15 + high * 0.1);
    passRef.current.setIntensity(reactiveIntensity);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      passRef.current.setCameraFOV((camera as any).fov);
    } else {
      passRef.current.setCameraFOV(cameraFOV);
    }

    // Update kernel size for mobile
    if (isMobile) {
      passRef.current.setKernelSize(9);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicGlarePass | null) => {
        passRef.current = instance;
      }}
      intensity={intensity}
      streakLength={streakLength}
      starStrength={starStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
      kernelSize={kernelSize}
    />
  );
};

