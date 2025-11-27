/**
 * Cosmic Depth v1 Hook
 * 
 * Phase 3 — Section 2: COSMIC DEPTH ENGINE v1
 * Cosmic Depth Engine v1 (F2)
 * 
 * Register with Motion Orchestrator and update depth-of-field
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicDepthPass } from '../cosmic-depth-pass';

export interface UseCosmicDepthConfig {
  focusDistance?: number;
  aperture?: number;
  blurIntensity?: number;
  nearBlur?: number;
  farBlur?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  cameraNear?: number;
  cameraFar?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicDepthReturn {
  pass: CosmicDepthPass;
  update: (deltaTime: number) => void;
}

export function useCosmicDepth(config: UseCosmicDepthConfig = {}): UseCosmicDepthReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicDepthPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce kernel size
  const kernelSize = config.isMobile ? 5 : 9;

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicDepthPass({
      focusDistance: config.focusDistance,
      aperture: config.aperture,
      blurIntensity: config.blurIntensity,
      nearBlur: config.nearBlur,
      farBlur: config.farBlur,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraNear: config.cameraNear ?? 0.1,
      cameraFar: config.cameraFar ?? 1000.0,
      fov: config.cameraFOV ?? 75.0,
      time: 0,
      kernelSize,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-depth', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-depth');
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

    // Update blur intensity (motion-reactive)
    const bass = config.audioReactive?.bass ?? 0;
    const mid = config.audioReactive?.mid ?? 0;
    const high = config.audioReactive?.high ?? 0;
    
    const motionBlurIntensity = (config.blurIntensity ?? 1.0) * (1.0 + bass * 0.1 + mid * 0.08 + high * 0.05);
    pass.setBlurIntensity(motionBlurIntensity);

    // Update blessing wave progress
    if (config.blessingWaveProgress !== undefined) {
      pass.setBlessingWaveProgress(config.blessingWaveProgress);
    }

    // Update camera parameters
    const near = config.cameraNear ?? 0.1;
    const far = config.cameraFar ?? 1000.0;
    const fov = config.cameraFOV ?? 75.0;
    if (camera && 'near' in camera && 'far' in camera && 'fov' in camera) {
      pass.setCameraParams(
        (camera as any).near || near,
        (camera as any).far || far,
        (camera as any).fov || fov
      );
    } else {
      pass.setCameraParams(near, far, fov);
    }

    // Update kernel size for mobile
    if (config.isMobile) {
      pass.setKernelSize(5);
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

