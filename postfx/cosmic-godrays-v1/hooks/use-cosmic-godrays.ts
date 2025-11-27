/**
 * Cosmic GodRays v1 Hook
 * 
 * Phase 3 — Section 14: COSMIC GODRAYS ENGINE v1
 * Cosmic GodRays Engine v1 (F14)
 * 
 * Register with Motion Orchestrator and update god rays
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import * as THREE from 'three';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicGodRaysPass } from '../cosmic-godrays-pass';

export interface UseCosmicGodRaysConfig {
  sunPos?: { x: number; y: number };
  lightDir?: { x: number; y: number; z: number };
  intensity?: number;
  scatteringStrength?: number;
  stepCount?: number;
  parallaxStrength?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  depthBuffer?: THREE.Texture | null;
  mouse?: { x: number; y: number };
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicGodRaysReturn {
  pass: CosmicGodRaysPass;
  update: (deltaTime: number) => void;
}

export function useCosmicGodRays(config: UseCosmicGodRaysConfig = {}): UseCosmicGodRaysReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicGodRaysPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce steps to 12, reduce scattering strength
  const adjustedStepCount = config.isMobile 
    ? 12.0 
    : (config.stepCount ?? 24.0);
  const adjustedScatteringStrength = config.isMobile 
    ? (config.scatteringStrength ?? 0.3) * 0.7 
    : (config.scatteringStrength ?? 0.3);

  // Convert to Vector2/Vector3
  const sunPosVec = useMemo(() => {
    return new Vector2(config.sunPos?.x ?? 0.5, config.sunPos?.y ?? 0.5);
  }, [config.sunPos?.x, config.sunPos?.y]);

  const lightDirVec = useMemo(() => {
    return new Vector3(config.lightDir?.x ?? 0.0, config.lightDir?.y ?? -1.0, config.lightDir?.z ?? 0.0);
  }, [config.lightDir?.x, config.lightDir?.y, config.lightDir?.z]);

  const mouseVec = useMemo(() => {
    return new Vector2(config.mouse?.x ?? 0.5, config.mouse?.y ?? 0.5);
  }, [config.mouse?.x, config.mouse?.y]);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicGodRaysPass({
      sunPos: sunPosVec,
      lightDir: lightDirVec,
      intensity: config.intensity,
      scatteringStrength: adjustedScatteringStrength,
      stepCount: adjustedStepCount,
      parallaxStrength: config.parallaxStrength,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      cameraFOV: config.cameraFOV ?? 75.0,
      depthTexture: config.depthBuffer ?? null,
      time: 0,
      mouse: mouseVec,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-godrays', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-godrays');
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

    // Update depth texture
    if (config.depthBuffer !== undefined) {
      pass.setDepthTexture(config.depthBuffer);
    }

    // Update mouse position
    if (config.mouse) {
      pass.setMouse(config.mouse.x, config.mouse.y);
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
      pass.setStepCount(adjustedStepCount);
      pass.setScatteringStrength(adjustedScatteringStrength);
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

