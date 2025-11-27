/**
 * Cosmic Starlight v1 Effect Component
 * 
 * Phase 3 — Section 10: COSMIC STARLIGHT ENGINE v1
 * Cosmic Starlight Engine v1 (F10)
 * 
 * React wrapper for CosmicStarlightPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
const { Vector2 } = THREE;



import { CosmicStarlightPass } from './cosmic-starlight-pass';

const Effect = wrapEffect(CosmicStarlightPass);
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

export interface CosmicStarlightEffectProps {
  /** Star intensity */
  starIntensity?: number;
  
  /** Twinkle strength */
  twinkleStrength?: number;
  
  /** Layer density */
  layerDensity?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** Mouse position for parallax (0-1) */
  mousePosition?: { x: number; y: number };
  
  /** Camera FOV */
  cameraFOV?: number;
  
  /** Mobile fallback: reduce star count by 50%, disable parallax */
  isMobile?: boolean;
}

export const CosmicStarlightEffect: React.FC<CosmicStarlightEffectProps> = ({
  starIntensity = 0.3,
  twinkleStrength = 0.5,
  layerDensity = 1.0,
  audioReactive,
  blessingWaveProgress = 0,
  mousePosition,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  
  // Mobile fallback: reduce star count by 50%, disable parallax
  const adjustedLayerDensity = isMobile ? layerDensity * 0.5 : layerDensity;
  const starCount = isMobile ? 200.0 * 0.5 : 200.0;
  const disableParallax = isMobile;
  
  // Default mouse position (center)
  const defaultMouse = useMemo(() => new Vector2(0.5, 0.5), []);
  const mouse = useMemo(() => {
    if (mousePosition) {
      return new Vector2(mousePosition.x, mousePosition.y);
    }
    return defaultMouse;
  }, [mousePosition, defaultMouse]);
  
  // Create pass
  const pass = useMemo(() => {
    return new CosmicStarlightPass({
      starIntensity,
      twinkleStrength,
      layerDensity: adjustedLayerDensity,
      bass: audioReactive?.bass ?? 0,
      mid: audioReactive?.mid ?? 0,
      high: audioReactive?.high ?? 0,
      blessingWaveProgress,
      mouse,
      cameraFOV,
      time: 0,
      disableParallax,
      starCount,
    });
  }, [starIntensity, twinkleStrength, adjustedLayerDensity, blessingWaveProgress, mouse, cameraFOV, disableParallax, starCount]);

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-starlight', (motionState) => {
      // Update audio reactive values
      pass.setAudioReactive(
        motionState.bassMotion,
        motionState.midMotion,
        motionState.highMotion
      );
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-starlight');
    };
  }, [pass]);

  // Update pass each frame
  useFrame((state, delta) => {
    timeRef.current += delta;

    // Update time
    pass.setTime(timeRef.current);

    // Update resolution
    pass.setResolution(size.width, size.height);

    // Update mouse position for parallax
    if (mousePosition) {
      pass.setMouse(mousePosition.x, mousePosition.y);
    } else {
      pass.setMouse(0.5, 0.5);
    }

    // Update twinkle strength (motion-reactive: high → sparkle density, mid → twinkle amplitude)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive twinkle: mid → twinkle amplitude (handled in shader)
    // Motion-reactive sparkle density: high → sparkle density (handled in shader)

    // Update blessing wave progress
    pass.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      pass.setCameraFOV((camera as any).fov);
    } else {
      pass.setCameraFOV(cameraFOV);
    }

    // Update mobile settings
    if (isMobile) {
      pass.setDisableParallax(true);
      pass.setStarCount(starCount);
    }
  });

  return <Effect effect={pass} />;
};

