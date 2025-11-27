/**
 * Cosmic GrainOverlay v1 Hook
 * 
 * Phase 3 — Section 9: COSMIC GRAINOVERLAY ENGINE v1
 * Cosmic GrainOverlay Engine v1 (F9)
 * 
 * Register with Motion Orchestrator and update grain overlay
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicGrainOverlayPass } from '../cosmic-grainoverlay-pass';

export interface UseCosmicGrainOverlayConfig {
  intensity?: number;
  overlayIntensity?: number;
  dustDensity?: number;
  shimmerStrength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicGrainOverlayReturn {
  pass: CosmicGrainOverlayPass;
  update: (deltaTime: number) => void;
}

export function useCosmicGrainOverlay(config: UseCosmicGrainOverlayConfig = {}): UseCosmicGrainOverlayReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicGrainOverlayPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: disable chroma noise, reduce dust count by 50%
  const adjustedDustDensity = config.isMobile 
    ? (config.dustDensity ?? 0.5) * 0.5 
    : (config.dustDensity ?? 0.5);
  const dustCount = adjustedDustDensity * 50.0;
  const disableChroma = config.isMobile ?? false;

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicGrainOverlayPass({
      intensity: config.intensity,
      overlayIntensity: config.overlayIntensity,
      dustDensity: adjustedDustDensity,
      shimmerStrength: config.shimmerStrength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      disableChroma,
      dustCount,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-grainoverlay', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-grainoverlay');
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

    // Update shimmer strength (motion-reactive: high → spark density)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionShimmerStrength = (config.shimmerStrength ?? 0.1) * (1.0 + high * 0.2);
    pass.setShimmerStrength(motionShimmerStrength);

    // Update dust count for mobile
    if (config.isMobile) {
      pass.setDustCount(adjustedDustDensity * 50.0);
      pass.setDisableChroma(true);
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

