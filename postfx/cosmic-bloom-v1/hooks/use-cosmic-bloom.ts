/**
 * Cosmic Bloom v1 Hook
 * 
 * Phase 3 — Section 1: COSMIC BLOOM ENGINE v1
 * Cosmic Bloom Engine v1 (F1)
 * 
 * Register with Motion Orchestrator and update bloom intensity
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicBloomPass } from '../cosmic-bloom-pass';

export interface UseCosmicBloomConfig {
  threshold?: number;
  intensity?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

export interface UseCosmicBloomReturn {
  pass: CosmicBloomPass;
  update: (deltaTime: number) => void;
}

export function useCosmicBloom(config: UseCosmicBloomConfig = {}): UseCosmicBloomReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicBloomPass | null>(null);
  const timeRef = useRef<number>(0);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicBloomPass({
      threshold: config.threshold,
      intensity: config.intensity,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      fov: config.cameraFOV ?? 75.0,
      time: 0,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-bloom', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-bloom');
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

    // Update intensity (motion-reactive: bass, mid, high)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    // Motion-reactive intensity: bass + mid + high influence
    const motionIntensity = config.intensity ?? 1.0;
    const reactiveIntensity = motionIntensity * (1.0 + bass * 0.2 + mid * 0.15 + high * 0.1);
    pass.setIntensity(reactiveIntensity);

    // Update blessing wave progress
    if (config.blessingWaveProgress !== undefined) {
      pass.setBlessingWaveProgress(config.blessingWaveProgress);
    }

    // Update FOV
    if (config.cameraFOV !== undefined) {
      pass.setFOV(config.cameraFOV);
    } else if (camera && 'fov' in camera) {
      pass.setFOV((camera as any).fov);
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

