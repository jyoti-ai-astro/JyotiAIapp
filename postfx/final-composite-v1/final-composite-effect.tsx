/**
 * Final Composite v1 Effect Component
 * 
 * Phase 3 — Section 15: FINAL COMPOSITE ENGINE v1
 * Final Composite Engine v1 (F15)
 * 
 * React wrapper for FinalCompositePass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { FinalCompositePass, type FinalCompositePassConfig } from './final-composite-pass';

const Effect = wrapEffect(FinalCompositePass) as unknown as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<FinalCompositePassConfig> & React.RefAttributes<FinalCompositePass>
>;
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

export interface FinalCompositeEffectProps {
  /** Intensity multiplier */
  intensity?: number;
  
  /** Exposure compensation */
  exposure?: number;
  
  /** Gate fade (fade-in/out driven by globalProgress) */
  globalFade?: number;
  
  /** Vibrance */
  vibrance?: number;
  
  /** Highlight repair strength */
  highlightRepair?: number;
  
  /** Dither strength */
  ditherStrength?: number;
  
  /** Lift (shadows) */
  lift?: number;
  
  /** Gamma (midtones) */
  gamma?: number;
  
  /** Gain (highlights) */
  gain?: number;
  
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
  
  /** Mobile fallback: reduce vibrance + reduce highlight repair strength */
  isMobile?: boolean;
}

export const FinalCompositeEffect: React.FC<FinalCompositeEffectProps> = ({
  intensity = 1.0,
  exposure = 1.0,
  globalFade = 1.0,
  vibrance = 1.0,
  highlightRepair = 0.5,
  ditherStrength = 0.5,
  lift = 0.0,
  gamma = 1.0,
  gain = 1.0,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<FinalCompositePass | null>(null);
  
  // Mobile fallback: reduce vibrance + reduce highlight repair strength
  const adjustedVibrance = isMobile ? vibrance * 0.8 : vibrance;
  const adjustedHighlightRepair = isMobile ? highlightRepair * 0.7 : highlightRepair;
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('final-composite', (motionState) => {
      // Update audio reactive values
      passRef.current?.setAudioReactive(
        motionState.bassMotion,
        motionState.midMotion,
        motionState.highMotion
      );
    });

    return () => {
      motionOrchestrator.unregisterEngine('final-composite');
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

    // Update fade
    pass.setFade(globalFade);

    // Update blessing wave progress
    pass.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if ('fov' in camera && typeof camera.fov === 'number') {
      pass.setCameraFOV(camera.fov);
    } else {
      pass.setCameraFOV(cameraFOV);
    }

    // Update mobile settings
    if (isMobile) {
      pass.setVibrance(adjustedVibrance);
      pass.setHighlightRepair(adjustedHighlightRepair);
    }
  });

  return (
    <Effect
      ref={(instance: FinalCompositePass | null) => {
        passRef.current = instance;
      }}
      intensity={intensity}
      exposure={exposure}
      fade={globalFade}
      vibrance={adjustedVibrance}
      highlightRepair={adjustedHighlightRepair}
      ditherStrength={ditherStrength}
      lift={lift}
      gamma={gamma}
      gain={gain}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
    />
  );
};
