/**
 * Final Composite v1 Hook
 * 
 * Phase 3 — Section 15: FINAL COMPOSITE ENGINE v1
 * Final Composite Engine v1 (F15)
 * 
 * Register with Motion Orchestrator and update final composite
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { FinalCompositePass } from '../final-composite-pass';

export interface UseFinalCompositeConfig {
  intensity?: number;
  exposure?: number;
  globalFade?: number;
  vibrance?: number;
  highlightRepair?: number;
  ditherStrength?: number;
  lift?: number;
  gamma?: number;
  gain?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseFinalCompositeReturn {
  pass: FinalCompositePass;
  update: (deltaTime: number) => void;
}

export function useFinalComposite(config: UseFinalCompositeConfig = {}): UseFinalCompositeReturn {
  const { size, camera } = useThree();
  const passRef = useRef<FinalCompositePass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce vibrance + reduce highlight repair strength
  const adjustedVibrance = config.isMobile 
    ? (config.vibrance ?? 1.0) * 0.8 
    : (config.vibrance ?? 1.0);
  const adjustedHighlightRepair = config.isMobile 
    ? (config.highlightRepair ?? 0.5) * 0.7 
    : (config.highlightRepair ?? 0.5);

  // Create pass
  if (!passRef.current) {
    passRef.current = new FinalCompositePass({
      intensity: config.intensity ?? 1.0,
      exposure: config.exposure ?? 1.0,
      fade: config.globalFade ?? 1.0,
      vibrance: adjustedVibrance,
      highlightRepair: adjustedHighlightRepair,
      ditherStrength: config.ditherStrength ?? 0.5,
      lift: config.lift ?? 0.0,
      gamma: config.gamma ?? 1.0,
      gain: config.gain ?? 1.0,
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
    motionOrchestrator.registerEngine('final-composite', (motionState) => {
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
      motionOrchestrator.unregisterEngine('final-composite');
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

    // Update fade
    if (config.globalFade !== undefined) {
      pass.setFade(config.globalFade);
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

    // Update mobile settings
    if (config.isMobile) {
      pass.setVibrance(adjustedVibrance);
      pass.setHighlightRepair(adjustedHighlightRepair);
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

