/**
 * Cosmic LensFlare v1 Effect Component
 * 
 * Phase 3 — Section 7: COSMIC LENSFLARE ENGINE v1
 * Cosmic LensFlare Engine v1 (F7)
 * 
 * React wrapper for CosmicLensFlarePass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicLensFlarePass } from './cosmic-lensflare-pass';

const Effect = wrapEffect(CosmicLensFlarePass);
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

export interface CosmicLensFlareEffectProps {
  /** Flare intensity */
  intensity?: number;
  
  /** Primary flare intensity */
  flareIntensity?: number;
  
  /** Ghost intensity */
  ghostIntensity?: number;
  
  /** Chroma strength */
  chromaStrength?: number;
  
  /** Streak length */
  streakLength?: number;
  
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
  
  /** Flare center position [x, y] (0-1) */
  flareCenter?: [number, number];
  
  /** Mobile fallback: reduce ghost count to 3 and streakLength *= 0.5 */
  isMobile?: boolean;
}

export const CosmicLensFlareEffect: React.FC<CosmicLensFlareEffectProps> = ({
  intensity = 1.0,
  flareIntensity = 0.3,
  ghostIntensity = 0.2,
  chromaStrength = 0.15,
  streakLength = 0.5,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  flareCenter = [0.5, 0.5],
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  
  // Mobile fallback: reduce ghost count to 3 and streakLength *= 0.5
  const ghostCount = isMobile ? 3.0 : 5.0;
  const adjustedStreakLength = isMobile ? streakLength * 0.5 : streakLength;
  
  // Create pass
  const pass = useMemo(() => {
    return new CosmicLensFlarePass({
      intensity,
      flareIntensity,
      ghostIntensity,
      chromaStrength,
      streakLength: adjustedStreakLength,
      bass: audioReactive?.bass ?? 0,
      mid: audioReactive?.mid ?? 0,
      high: audioReactive?.high ?? 0,
      blessingWaveProgress,
      cameraFOV,
      time: 0,
      ghostCount,
      flareCenter,
    });
  }, [intensity, flareIntensity, ghostIntensity, chromaStrength, adjustedStreakLength, blessingWaveProgress, cameraFOV, ghostCount, flareCenter]);

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-lensflare', (motionState) => {
      // Update audio reactive values
      pass.setAudioReactive(
        motionState.bassMotion,
        motionState.midMotion,
        motionState.highMotion
      );
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-lensflare');
    };
  }, [pass]);

  // Update pass each frame
  useFrame((state, delta) => {
    timeRef.current += delta;

    // Update time
    pass.setTime(timeRef.current);

    // Update resolution
    pass.setResolution(size.width, size.height);

    // Update flare intensity (motion-reactive: bass → flare length)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive flare length: bass → longer flares
    const reactiveStreakLength = adjustedStreakLength * (1.0 + bass * 0.5);
    pass.setStreakLength(reactiveStreakLength);

    // Motion-reactive ghost intensity: mid → ghost intensity
    const reactiveGhostIntensity = ghostIntensity * (1.0 + mid * 0.2);
    pass.setGhostIntensity(reactiveGhostIntensity);

    // Update blessing wave progress
    pass.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      pass.setCameraFOV((camera as any).fov);
    } else {
      pass.setCameraFOV(cameraFOV);
    }

    // Update ghost count for mobile
    if (isMobile) {
      pass.setGhostCount(3.0);
      pass.setStreakLength(adjustedStreakLength);
    }
  });

  return <Effect effect={pass} />;
};

