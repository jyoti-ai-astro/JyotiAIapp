/**
 * Cosmic Halation v1 Hook
 * 
 * Phase 3 — Section 8: COSMIC HALATION ENGINE v1
 * Cosmic Halation Engine v1 (F8)
 * 
 * Register with Motion Orchestrator and update halation
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicHalationPass } from '../cosmic-halation-pass';

export interface UseCosmicHalationConfig {
  intensity?: number;
  halationIntensity?: number;
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

export interface UseCosmicHalationReturn {
  pass: CosmicHalationPass;
  update: (deltaTime: number) => void;
}

export function useCosmicHalation(config: UseCosmicHalationConfig = {}): UseCosmicHalationReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicHalationPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce diffusion radius
  const adjustedRadius = config.isMobile 
    ? (config.radius ?? 0.3) * 0.5 
    : (config.radius ?? 0.3);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicHalationPass({
      intensity: config.intensity,
      halationIntensity: config.halationIntensity,
      radius: adjustedRadius,
      tintStrength: config.tintStrength,
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
    motionOrchestrator.registerEngine('cosmic-halation', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-halation');
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

    // Update halation intensity (motion-reactive: bass → halo width, high → tint strength)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionRadius = adjustedRadius * (1.0 + bass * 0.3);
    pass.setRadius(motionRadius);

    const motionTintStrength = (config.tintStrength ?? 0.15) * (1.0 + high * 0.15);
    pass.setTintStrength(motionTintStrength);

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

    // Update radius for mobile
    if (config.isMobile) {
      pass.setRadius(adjustedRadius);
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

