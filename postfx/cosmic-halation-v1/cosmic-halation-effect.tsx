/**
 * Cosmic Halation v1 Effect Component
 * 
 * Phase 3 — Section 8: COSMIC HALATION ENGINE v1
 * Cosmic Halation Engine v1 (F8)
 * 
 * React wrapper for CosmicHalationPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { CosmicHalationPass, type CosmicHalationPassConfig } from './cosmic-halation-pass';

const Effect = wrapEffect(CosmicHalationPass) as unknown as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CosmicHalationPassConfig> & React.RefAttributes<CosmicHalationPass>
>;
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

export interface CosmicHalationEffectProps {
  /** Halation intensity */
  intensity?: number;
  
  /** Halation intensity multiplier */
  halationIntensity?: number;
  
  /** Diffusion radius */
  radius?: number;
  
  /** Tint strength */
  tintStrength?: number;
  
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
  
  /** Mobile fallback: reduce diffusion radius */
  isMobile?: boolean;
}

export const CosmicHalationEffect: React.FC<CosmicHalationEffectProps> = ({
  intensity = 1.0,
  halationIntensity = 0.2,
  radius = 0.3,
  tintStrength = 0.15,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicHalationPass | null>(null);
  
  // Mobile fallback: reduce diffusion radius
  const adjustedRadius = isMobile ? radius * 0.5 : radius;
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-halation', (motionState) => {
      // Update audio reactive values
      passRef.current?.setAudioReactive(
        motionState.bassMotion,
        motionState.midMotion,
        motionState.highMotion
      );
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-halation');
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

    // Update halation intensity (motion-reactive: bass → halo width, high → tint strength)
    const bass = audioReactive?.bass ?? 0;
    const high = audioReactive?.high ?? 0;
    
    // Motion-reactive halo width: bass → wider halation
    const reactiveRadius = adjustedRadius * (1.0 + bass * 0.3);
    pass.setRadius(reactiveRadius);

    // Motion-reactive tint strength: high → tint strength
    const reactiveTintStrength = tintStrength * (1.0 + high * 0.15);
    pass.setTintStrength(reactiveTintStrength);

    // Update blessing wave progress
    pass.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if ('fov' in camera && typeof camera.fov === 'number') {
      pass.setCameraFOV(camera.fov);
    } else {
      pass.setCameraFOV(cameraFOV);
    }

    // Update radius for mobile
    if (isMobile) {
      pass.setRadius(adjustedRadius);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicHalationPass | null) => {
        passRef.current = instance;
      }}
      intensity={intensity}
      halationIntensity={halationIntensity}
      radius={adjustedRadius}
      tintStrength={tintStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
    />
  );
};
