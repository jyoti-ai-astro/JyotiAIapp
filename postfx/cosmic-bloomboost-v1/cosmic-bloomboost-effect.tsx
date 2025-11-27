/**
 * Cosmic BloomBoost v1 Effect Component
 * 
 * Phase 3 — Section 11: COSMIC BLOOMBOOST ENGINE v1
 * Cosmic BloomBoost Engine v1 (F11)
 * 
 * React wrapper for CosmicBloomBoostPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicBloomBoostPass } from './cosmic-bloomboost-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicBloomBoostPass);

export interface CosmicBloomBoostEffectProps {
  /** Boost intensity */
  boostIntensity?: number;
  
  /** Boost radius */
  boostRadius?: number;
  
  /** Brightness threshold (higher than primary bloom) */
  threshold?: number;
  
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
  
  /** Mobile fallback: reduce glow radius by 50%, lower threshold */
  isMobile?: boolean;
}

export const CosmicBloomBoostEffect: React.FC<CosmicBloomBoostEffectProps> = ({
  boostIntensity = 0.4,
  boostRadius = 0.2,
  threshold = 0.95,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicBloomBoostPass | null>(null);
  
  // Mobile fallback: reduce glow radius by 50%, lower threshold
  const adjustedBoostRadius = isMobile ? boostRadius * 0.5 : boostRadius;
  const adjustedThreshold = isMobile ? threshold * 0.9 : threshold;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-bloomboost', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-bloomboost');
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

    // Update boost radius (motion-reactive: bass → size)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive glow radius: bass → size
    const reactiveBoostRadius = adjustedBoostRadius * (1.0 + bass * 0.4);
    passRef.current.setBoostRadius(reactiveBoostRadius);

    // Motion-reactive intensity: high → intensity (handled in shader)
    // Update boost intensity for mobile
    if (isMobile) {
      passRef.current.setBoostRadius(adjustedBoostRadius);
      passRef.current.setThreshold(adjustedThreshold);
    }

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
      ref={(instance: CosmicBloomBoostPass | null) => {
        passRef.current = instance;
      }}
      boostIntensity={boostIntensity}
      boostRadius={adjustedBoostRadius}
      threshold={adjustedThreshold}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
    />
  );
};

