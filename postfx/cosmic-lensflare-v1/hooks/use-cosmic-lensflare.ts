/**
 * Cosmic LensFlare v1 Hook
 * 
 * Phase 3 — Section 7: COSMIC LENSFLARE ENGINE v1
 * Cosmic LensFlare Engine v1 (F7)
 * 
 * Register with Motion Orchestrator and update lens flare
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicLensFlarePass } from '../cosmic-lensflare-pass';

export interface UseCosmicLensFlareConfig {
  intensity?: number;
  flareIntensity?: number;
  ghostIntensity?: number;
  chromaStrength?: number;
  streakLength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  flareCenter?: [number, number];
  isMobile?: boolean;
}

export interface UseCosmicLensFlareReturn {
  pass: CosmicLensFlarePass;
  update: (deltaTime: number) => void;
}

export function useCosmicLensFlare(config: UseCosmicLensFlareConfig = {}): UseCosmicLensFlareReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicLensFlarePass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce ghost count to 3 and streakLength *= 0.5
  const ghostCount = config.isMobile ? 3.0 : 5.0;
  const adjustedStreakLength = config.isMobile 
    ? (config.streakLength ?? 0.5) * 0.5 
    : (config.streakLength ?? 0.5);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicLensFlarePass({
      intensity: config.intensity,
      flareIntensity: config.flareIntensity,
      ghostIntensity: config.ghostIntensity,
      chromaStrength: config.chromaStrength,
      streakLength: adjustedStreakLength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      ghostCount,
      flareCenter: config.flareCenter ?? [0.5, 0.5],
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-lensflare', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-lensflare');
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

    // Update flare length (motion-reactive: bass → flare length)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionStreakLength = adjustedStreakLength * (1.0 + bass * 0.5);
    pass.setStreakLength(motionStreakLength);

    // Update ghost intensity (motion-reactive: mid → ghost intensity)
    const motionGhostIntensity = (config.ghostIntensity ?? 0.2) * (1.0 + mid * 0.2);
    pass.setGhostIntensity(motionGhostIntensity);

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

    // Update ghost count for mobile
    if (config.isMobile) {
      pass.setGhostCount(3.0);
      pass.setStreakLength(adjustedStreakLength);
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

