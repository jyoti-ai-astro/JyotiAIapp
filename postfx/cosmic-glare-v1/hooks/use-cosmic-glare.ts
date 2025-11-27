/**
 * Cosmic Glare v1 Hook
 * 
 * Phase 3 — Section 4: COSMIC GLARE ENGINE v1
 * Cosmic Glare Engine v1 (F4)
 * 
 * Register with Motion Orchestrator and update glare
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicGlarePass } from '../cosmic-glare-pass';

export interface UseCosmicGlareConfig {
  intensity?: number;
  streakLength?: number;
  starStrength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicGlareReturn {
  pass: CosmicGlarePass;
  update: (deltaTime: number) => void;
}

export function useCosmicGlare(config: UseCosmicGlareConfig = {}): UseCosmicGlareReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicGlarePass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce streak kernel
  const kernelSize = config.isMobile ? 9 : 15;

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicGlarePass({
      intensity: config.intensity,
      streakLength: config.streakLength,
      starStrength: config.starStrength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      kernelSize,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-glare', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-glare');
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
    
    const motionIntensity = (config.intensity ?? 1.0) * (1.0 + bass * 0.2 + mid * 0.15 + high * 0.1);
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

    // Update kernel size for mobile
    if (config.isMobile) {
      pass.setKernelSize(9);
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

