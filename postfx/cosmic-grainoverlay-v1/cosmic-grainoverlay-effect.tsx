/**
 * Cosmic GrainOverlay v1 Effect Component
 * 
 * Phase 3 — Section 9: COSMIC GRAINOVERLAY ENGINE v1
 * Cosmic GrainOverlay Engine v1 (F9)
 * 
 * React wrapper for CosmicGrainOverlayPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { CosmicGrainOverlayPass, type CosmicGrainOverlayPassConfig } from './cosmic-grainoverlay-pass';

const Effect = wrapEffect(CosmicGrainOverlayPass) as unknown as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CosmicGrainOverlayPassConfig> & React.RefAttributes<CosmicGrainOverlayPass>
>;
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

export interface CosmicGrainOverlayEffectProps {
  /** Overlay intensity */
  intensity?: number;
  
  /** Ultra-fine grain intensity */
  overlayIntensity?: number;
  
  /** Cosmic dust density */
  dustDensity?: number;
  
  /** Shimmer strength */
  shimmerStrength?: number;
  
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
  
  /** Mobile fallback: disable chroma noise, reduce dust count by 50% */
  isMobile?: boolean;
}

export const CosmicGrainOverlayEffect: React.FC<CosmicGrainOverlayEffectProps> = ({
  intensity = 1.0,
  overlayIntensity = 0.08,
  dustDensity = 0.5,
  shimmerStrength = 0.1,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicGrainOverlayPass | null>(null);
  
  // Mobile fallback: disable chroma noise, reduce dust count by 50%
  const adjustedDustDensity = isMobile ? dustDensity * 0.5 : dustDensity;
  const dustCount = adjustedDustDensity * 50.0;
  const disableChroma = isMobile;
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-grainoverlay', (motionState) => {
      // Update audio reactive values
      passRef.current?.setAudioReactive(
        motionState.bassMotion,
        motionState.midMotion,
        motionState.highMotion
      );
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-grainoverlay');
    };
  }, []);

  // Update pass each frame
  useFrame((state, delta) => {
    const pass = passRef.current;
    if (!pass) return;

    timeRef.current += delta;

    // Update time
    pass.setTime(timeRef.current);

    // Update resolution
    pass.setResolution(size.width, size.height);

    // Update shimmer strength (motion-reactive: high → spark density)
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive shimmer: high → spark density
    const reactiveShimmerStrength = shimmerStrength * (1.0 + high * 0.2);
    pass.setShimmerStrength(reactiveShimmerStrength);

    // Motion-reactive dust density: mid → drift speed (already handled in shader)
    // Update dust count for mobile
    if (isMobile) {
      pass.setDustCount(adjustedDustDensity * 50.0);
      pass.setDisableChroma(true);
    }

    // Update blessing wave progress
    pass.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if ('fov' in camera && typeof camera.fov === 'number') {
      pass.setCameraFOV(camera.fov);
    } else {
      pass.setCameraFOV(cameraFOV);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicGrainOverlayPass | null) => {
        passRef.current = instance;
      }}
      intensity={intensity}
      overlayIntensity={overlayIntensity}
      dustDensity={adjustedDustDensity}
      shimmerStrength={shimmerStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
      disableChroma={disableChroma}
      dustCount={dustCount}
    />
  );
};
