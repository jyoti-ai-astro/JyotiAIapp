/**
 * Cosmic Bloom v1 Effect Component
 * 
 * Phase 3 — Section 1: COSMIC BLOOM ENGINE v1
 * Cosmic Bloom Engine v1 (F1)
 * 
 * React wrapper for CosmicBloomPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { CosmicBloomPass } from './cosmic-bloom-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicBloomPass);

export interface CosmicBloomEffectProps {
  /** Bloom threshold */
  threshold?: number;
  
  /** Bloom intensity */
  intensity?: number;
  
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
}

export const CosmicBloomEffect: React.FC<CosmicBloomEffectProps> = ({
  threshold = 0.85,
  intensity = 1.0,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicBloomPass | null>(null);

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-bloom', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-bloom');
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
    
    // Motion-reactive intensity: bass + mid + high influence
    const reactiveIntensity = intensity * (1.0 + bass * 0.2 + mid * 0.15 + high * 0.1);
    passRef.current.setIntensity(reactiveIntensity);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update FOV
    if (camera && 'fov' in camera) {
      passRef.current.setFOV((camera as any).fov);
    } else {
      passRef.current.setFOV(cameraFOV);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicBloomPass | null) => {
        passRef.current = instance;
      }}
      threshold={threshold}
      intensity={intensity}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      fov={cameraFOV}
      time={0}
    />
  );
};

