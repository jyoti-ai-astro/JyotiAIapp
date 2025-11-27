/**
 * Cosmic Vignette v1 Hook
 * 
 * Phase 3 — Section 5: COSMIC VIGNETTE ENGINE v1
 * Cosmic Vignette Engine v1 (F5)
 * 
 * Register with Motion Orchestrator and update vignette
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicVignettePass } from '../cosmic-vignette-pass';

export interface UseCosmicVignetteConfig {
  intensity?: number;
  radius?: number;
  tintStrength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicVignetteReturn {
  pass: CosmicVignettePass;
  update: (deltaTime: number) => void;
}

export function useCosmicVignette(config: UseCosmicVignetteConfig = {}): UseCosmicVignetteReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicVignettePass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce tintStrength and enforce circular vignette
  const adjustedTintStrength = config.isMobile 
    ? (config.tintStrength ?? 0.1) * 0.5 
    : (config.tintStrength ?? 0.1);
  const isCircular = config.isMobile ?? false;

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicVignettePass({
      intensity: config.intensity,
      vignetteStrength: 0.5,
      vignetteRadius: config.radius,
      tintStrength: adjustedTintStrength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      isCircular,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-vignette', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-vignette');
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
    
    const motionIntensity = (config.intensity ?? 1.0) * (1.0 + bass * 0.1 + mid * 0.08 + high * 0.05);
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

