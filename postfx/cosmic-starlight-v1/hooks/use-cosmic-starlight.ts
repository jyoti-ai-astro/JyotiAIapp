/**
 * Cosmic Starlight v1 Hook
 * 
 * Phase 3 — Section 10: COSMIC STARLIGHT ENGINE v1
 * Cosmic Starlight Engine v1 (F10)
 * 
 * Register with Motion Orchestrator and update starlight
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { motionOrchestrator } from '../../../cosmos/motion/orchestrator';
import { CosmicStarlightPass } from '../cosmic-starlight-pass';

export interface UseCosmicStarlightConfig {
  starIntensity?: number;
  twinkleStrength?: number;
  layerDensity?: number;
  blessingWaveProgress?: number;
  mousePosition?: { x: number; y: number };
  cameraFOV?: number;
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  isMobile?: boolean;
}

export interface UseCosmicStarlightReturn {
  pass: CosmicStarlightPass;
  update: (deltaTime: number) => void;
}

export function useCosmicStarlight(config: UseCosmicStarlightConfig = {}): UseCosmicStarlightReturn {
  const { size, camera } = useThree();
  const passRef = useRef<CosmicStarlightPass | null>(null);
  const timeRef = useRef<number>(0);

  // Mobile fallback: reduce star count by 50%, disable parallax
  const adjustedLayerDensity = config.isMobile 
    ? (config.layerDensity ?? 1.0) * 0.5 
    : (config.layerDensity ?? 1.0);
  const starCount = config.isMobile ? 200.0 * 0.5 : 200.0;
  const disableParallax = config.isMobile ?? false;

  // Default mouse position
  const defaultMouse = useMemo(() => new Vector2(0.5, 0.5), []);
  const mouse = useMemo(() => {
    if (config.mousePosition) {
      return new Vector2(config.mousePosition.x, config.mousePosition.y);
    }
    return defaultMouse;
  }, [config.mousePosition, defaultMouse]);

  // Create pass
  if (!passRef.current) {
    passRef.current = new CosmicStarlightPass({
      starIntensity: config.starIntensity,
      twinkleStrength: config.twinkleStrength,
      layerDensity: adjustedLayerDensity,
      bass: config.audioReactive?.bass ?? 0,
      mid: config.audioReactive?.mid ?? 0,
      high: config.audioReactive?.high ?? 0,
      blessingWaveProgress: config.blessingWaveProgress ?? 0,
      mouse,
      cameraFOV: config.cameraFOV ?? 75.0,
      time: 0,
      disableParallax,
      starCount,
    });
  }

  const pass = passRef.current;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-starlight', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-starlight');
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

    // Update mouse position for parallax
    if (config.mousePosition) {
      pass.setMouse(config.mousePosition.x, config.mousePosition.y);
    } else {
      pass.setMouse(0.5, 0.5);
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
      pass.setDisableParallax(true);
      pass.setStarCount(starCount);
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

