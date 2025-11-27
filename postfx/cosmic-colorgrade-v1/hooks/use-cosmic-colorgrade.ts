/**
 * Cosmic ColorGrade v1 Hook
 * 
 * Phase 3 — Section 13: COSMIC COLORGRADE ENGINE v1
 * Cosmic ColorGrade Engine v1 (F13)
 * 
 * Register with Motion Orchestrator and update color grading
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicColorGradePass } from '../cosmic-colorgrade-pass';

export interface UseCosmicColorGradeConfig {
  lutStrength?: number;
  temperature?: number;
  tint?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  vibrance?: number;
  fade?: number;
  rolloff?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicColorGradeReturn {
  pass: CosmicColorGradePass;
  update: (deltaTime: number) => void;
}

export function useCosmicColorGrade(config: UseCosmicColorGradeConfig = {}): UseCosmicColorGradeReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicColorGradePass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduced LUT strength, reduced vibrance
  const adjustedLutStrength = config.isMobile 
    ? (config.lutStrength ?? 0.3) * 0.7 
    : (config.lutStrength ?? 0.3);
  const adjustedVibrance = config.isMobile 
    ? (config.vibrance ?? 1.0) * 0.5 
    : (config.vibrance ?? 1.0);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicColorGradePass({
      lutStrength: adjustedLutStrength,
      temperature: config.temperature,
      tint: config.tint,
      contrast: config.contrast,
      gamma: config.gamma,
      saturation: config.saturation,
      vibrance: adjustedVibrance,
      fade: config.fade,
      rolloff: config.rolloff,
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
    motionOrchestrator.registerEngine('cosmic-colorgrade', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-colorgrade');
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

    // Update mobile settings
    if (config.isMobile) {
      pass.setLutStrength(adjustedLutStrength);
      pass.setVibrance(adjustedVibrance);
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

