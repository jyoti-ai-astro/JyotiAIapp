/**
 * Cosmic Depth v1 Effect Component
 * 
 * Phase 3 — Section 2: COSMIC DEPTH ENGINE v1
 * Cosmic Depth Engine v1 (F2)
 * 
 * React wrapper for CosmicDepthPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicDepthPass } from './cosmic-depth-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicDepthPass);

export interface CosmicDepthEffectProps {
  /** Focus distance */
  focusDistance?: number;
  
  /** Aperture (controls blur amount) */
  aperture?: number;
  
  /** Blur intensity multiplier */
  blurIntensity?: number;
  
  /** Near blur strength (foreground) */
  nearBlur?: number;
  
  /** Far blur strength (background) */
  farBlur?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** Camera FOV */
  cameraFOV?: number;
  
  /** Camera near plane */
  cameraNear?: number;
  
  /** Camera far plane */
  cameraFar?: number;
  
  /** Depth texture (from R3F) */
  depth?: THREE.Texture | null;
  
  /** Mobile fallback: reduce kernel size */
  isMobile?: boolean;
}

export const CosmicDepthEffect: React.FC<CosmicDepthEffectProps> = ({
  focusDistance = 5.0,
  aperture = 0.1,
  blurIntensity = 1.0,
  nearBlur = 1.0,
  farBlur = 1.0,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  cameraNear = 0.1,
  cameraFar = 1000.0,
  depth = null,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicDepthPass | null>(null);
  
  // Mobile fallback: reduce kernel size
  const kernelSize = isMobile ? 5 : 9;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-depth', (motionState) => {
      // Update audio reactive values
      if (passRef.current) {
        passRef.current.setAudioReactive(
          motionState.bassMotion,
          motionState.midMotion,
          motionState.highMotion
        );
      }
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-depth');
    };
  }, []);

  // Update pass each frame
  useFrame((state, delta) => {
    if (!passRef.current) return;
    
    timeRef.current += delta;

    // Update time
    passRef.current.setTime(timeRef.current);

    // Update resolution
    passRef.current.setResolution(size.width, size.height);

    // Update blur intensity (motion-reactive: bass, mid, high)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive blur intensity
    const reactiveBlurIntensity = blurIntensity * (1.0 + bass * 0.1 + mid * 0.08 + high * 0.05);
    passRef.current.setBlurIntensity(reactiveBlurIntensity);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera parameters
    const near = cameraNear;
    const far = cameraFar;
    const fov = cameraFOV;
    if (camera && 'near' in camera && 'far' in camera && 'fov' in camera) {
      passRef.current.setCameraParams(
        (camera as any).near || near,
        (camera as any).far || far,
        (camera as any).fov || fov
      );
    } else {
      passRef.current.setCameraParams(near, far, fov);
    }

    // Update kernel size for mobile
    if (isMobile) {
      passRef.current.setKernelSize(5);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicDepthPass | null) => {
        passRef.current = instance;
      }}
      focusDistance={focusDistance}
      aperture={aperture}
      blurIntensity={blurIntensity}
      nearBlur={nearBlur}
      farBlur={farBlur}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraNear={cameraNear}
      cameraFar={cameraFar}
      fov={cameraFOV}
      time={0}
      kernelSize={kernelSize}
    />
  );
};

