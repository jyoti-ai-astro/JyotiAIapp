/**
 * Cosmic FilmGrain v1 Hook
 * 
 * Phase 3 — Section 6: COSMIC FILMGRAIN ENGINE v1
 * Cosmic FilmGrain Engine v1 (F6)
 * 
 * Register with Motion Orchestrator and update film grain
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicFilmGrainPass } from '../cosmic-filmgrain-pass';

export interface UseCosmicFilmGrainConfig {
  intensity?: number;
  grainIntensity?: number;
  chromaIntensity?: number;
  flickerStrength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicFilmGrainReturn {
  pass: CosmicFilmGrainPass;
  update: (deltaTime: number) => void;
}

export function useCosmicFilmGrain(config: UseCosmicFilmGrainConfig = {}): UseCosmicFilmGrainReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicFilmGrainPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce grain size & disable chroma-noise
  const grainSize = config.isMobile ? 2.0 : 1.0;
  const adjustedChromaIntensity = config.isMobile 
    ? (config.chromaIntensity ?? 0.1) * 0.5 
    : (config.chromaIntensity ?? 0.1);
  const disableChroma = config.isMobile ?? false;

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicFilmGrainPass({
      intensity: config.intensity,
      grainIntensity: config.grainIntensity,
      chromaIntensity: adjustedChromaIntensity,
      flickerStrength: config.flickerStrength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      grainSize,
      disableChroma,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-filmgrain', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-filmgrain');
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

    // Update grain intensity (motion-reactive: bass → intensity)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionGrainIntensity = (config.grainIntensity ?? 0.15) * (1.0 + bass * 0.3);
    pass.setGrainIntensity(motionGrainIntensity);

    const motionChromaIntensity = adjustedChromaIntensity * (1.0 + mid * 0.2);
    pass.setChromaIntensity(motionChromaIntensity);

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

    // Update grain size and chroma disable for mobile
    if (config.isMobile) {
      pass.setGrainSize(2.0);
      pass.setDisableChroma(true);
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

