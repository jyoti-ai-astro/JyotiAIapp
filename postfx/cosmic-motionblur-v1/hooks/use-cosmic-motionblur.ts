/**
 * Cosmic MotionBlur v1 Hook
 * 
 * Phase 3 — Section 12: COSMIC MOTIONBLUR ENGINE v1
 * Cosmic MotionBlur Engine v1 (F12)
 * 
 * Register with Motion Orchestrator and update motion blur
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicMotionBlurPass } from '../cosmic-motionblur-pass';

export interface UseCosmicMotionBlurConfig {
  blurStrength?: number;
  radialStrength?: number;
  velocityFactor?: number;
  sampleCount?: number;
  blessingWaveProgress?: number;
  scrollVelocity?: { x: number; y: number };
  mouseVelocity?: { x: number; y: number };
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicMotionBlurReturn {
  pass: CosmicMotionBlurPass;
  update: (deltaTime: number) => void;
}

export function useCosmicMotionBlur(config: UseCosmicMotionBlurConfig = {}): UseCosmicMotionBlurReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicMotionBlurPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce kernel samples by 50%, disable depth-aware blur
  const adjustedSampleCount = config.isMobile 
    ? (config.sampleCount ?? 16.0) / 2.0 
    : (config.sampleCount ?? 16.0);
  const disableDepthAware = config.isMobile ?? false;

  // Convert velocities to Vector2
  const scrollVel = useMemo(() => {
    return new Vector2(config.scrollVelocity?.x ?? 0, config.scrollVelocity?.y ?? 0);
  }, [config.scrollVelocity?.x, config.scrollVelocity?.y]);

  const mouseVel = useMemo(() => {
    return new Vector2(config.mouseVelocity?.x ?? 0, config.mouseVelocity?.y ?? 0);
  }, [config.mouseVelocity?.x, config.mouseVelocity?.y]);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicMotionBlurPass({
      blurStrength: config.blurStrength,
      radialStrength: config.radialStrength,
      velocityFactor: config.velocityFactor,
      sampleCount: adjustedSampleCount,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      scrollVelocity: scrollVel,
      mouseVelocity: mouseVel,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      disableDepthAware,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-motionblur', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-motionblur');
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

    // Update scroll velocity
    if (config.scrollVelocity) {
      pass.setScrollVelocity(config.scrollVelocity.x, config.scrollVelocity.y);
    }

    // Update mouse velocity
    if (config.mouseVelocity) {
      pass.setMouseVelocity(config.mouseVelocity.x, config.mouseVelocity.y);
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
      pass.setSampleCount(adjustedSampleCount);
      pass.setDisableDepthAware(true);
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

