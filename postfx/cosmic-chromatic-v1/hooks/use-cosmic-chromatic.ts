/**
 * Cosmic Chromatic v1 Hook
 * 
 * Phase 3 — Section 3: COSMIC CHROMATIC ENGINE v1
 * Cosmic Chromatic Engine v1 (F3)
 * 
 * Register with Motion Orchestrator and update chromatic aberration
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicChromaticPass } from '../cosmic-chromatic-pass';

export interface UseCosmicChromaticConfig {
  intensity?: number;
  prismStrength?: number;
  warpStrength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  globalMotion?: [number, number];
  isMobile?: boolean;
}

export interface UseCosmicChromaticReturn {
  pass: CosmicChromaticPass;
  update: (deltaTime: number) => void;
}

export function useCosmicChromatic(config: UseCosmicChromaticConfig = {}): UseCosmicChromaticReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicChromaticPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce RGB shift
  const adjustedIntensity = config.isMobile 
    ? (config.intensity ?? 0.02) * 0.5 
    : (config.intensity ?? 0.02);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicChromaticPass({
      intensity: adjustedIntensity,
      prismStrength: config.prismStrength,
      warpStrength: config.warpStrength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      globalMotion: config.globalMotion ?? [0, 0],
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-chromatic', (motionState) => {
      // Update audio reactive values
      if (pass) {
        pass.setAudioReactive(
          motionState.bassMotion,
          motionState.midMotion,
          motionState.highMotion
        );
      }
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-chromatic');
    };
  }, [pass]);

  // Update pass each frame
  useFrame((state, delta) => {
    if (!pass) return;

    timeRef.current += delta;

    // Update time
    pass.setTime(timeRef.current);

    // Update resolution
    pass.setResolution(size.width, size.height);

    // Update intensity (motion-reactive)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionIntensity = adjustedIntensity * (1.0 + bass * 0.2 + mid * 0.15 + high * 0.1);
    pass.setIntensity(motionIntensity);

    // Update blessing wave progress
    if (config.blessingWaveProgress !== undefined) {
      pass.setBlessingWaveProgress(config.blessingWaveProgress);
    }

    // Update camera FOV
    const fov = config.cameraFOV ?? 75.0;
    if (camera && 'fov' in camera) {
      pass.setCameraFOV((camera as any).fov);
    } else {
      pass.setCameraFOV(fov);
    }

    // Update global motion for velocity warp
    const motion = config.globalMotion ?? [0, 0];
    pass.setGlobalMotion(motion[0], motion[1]);
  });

  return {
    pass,
    update: (deltaTime: number) => {
      if (pass) {
        pass.update(null, null, deltaTime);
      }
    },
  };
}

