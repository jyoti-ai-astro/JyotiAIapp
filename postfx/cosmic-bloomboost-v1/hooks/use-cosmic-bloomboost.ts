/**
 * Cosmic BloomBoost v1 Hook
 * 
 * Phase 3 — Section 11: COSMIC BLOOMBOOST ENGINE v1
 * Cosmic BloomBoost Engine v1 (F11)
 * 
 * Register with Motion Orchestrator and update bloom boost
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicBloomBoostPass } from '../cosmic-bloomboost-pass';

export interface UseCosmicBloomBoostConfig {
  boostIntensity?: number;
  boostRadius?: number;
  threshold?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicBloomBoostReturn {
  pass: CosmicBloomBoostPass;
  update: (deltaTime: number) => void;
}

export function useCosmicBloomBoost(config: UseCosmicBloomBoostConfig = {}): UseCosmicBloomBoostReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicBloomBoostPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce glow radius by 50%, lower threshold
  const adjustedBoostRadius = config.isMobile 
    ? (config.boostRadius ?? 0.2) * 0.5 
    : (config.boostRadius ?? 0.2);
  const adjustedThreshold = config.isMobile 
    ? (config.threshold ?? 0.95) * 0.9 
    : (config.threshold ?? 0.95);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicBloomBoostPass({
      boostIntensity: config.boostIntensity,
      boostRadius: adjustedBoostRadius,
      threshold: adjustedThreshold,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-bloomboost', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-bloomboost');
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

    // Update boost radius (motion-reactive: bass → size)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionBoostRadius = adjustedBoostRadius * (1.0 + bass * 0.4);
    pass.setBoostRadius(motionBoostRadius);

    // Update mobile settings
    if (config.isMobile) {
      pass.setBoostRadius(adjustedBoostRadius);
      pass.setThreshold(adjustedThreshold);
    }

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

