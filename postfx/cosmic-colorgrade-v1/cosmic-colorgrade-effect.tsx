/**
 * Cosmic ColorGrade v1 Effect Component
 * 
 * Phase 3 — Section 13: COSMIC COLORGRADE ENGINE v1
 * Cosmic ColorGrade Engine v1 (F13)
 * 
 * React wrapper for CosmicColorGradePass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicColorGradePass } from './cosmic-colorgrade-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicColorGradePass);

export interface CosmicColorGradeEffectProps {
  /** LUT strength (0-1) */
  lutStrength?: number;
  
  /** Temperature (-1 to 1, warm/cool shift) */
  temperature?: number;
  
  /** Tint (-1 to 1, green-magenta shift) */
  tint?: number;
  
  /** Contrast (0.5-2.0) */
  contrast?: number;
  
  /** Gamma (0.5-2.0) */
  gamma?: number;
  
  /** Saturation (0-2.0) */
  saturation?: number;
  
  /** Vibrance (0-2.0) */
  vibrance?: number;
  
  /** Fade (lifted blacks, 0-1) */
  fade?: number;
  
  /** Rolloff (highlight rolloff, 0-1) */
  rolloff?: number;
  
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
  
  /** Mobile fallback: reduced LUT strength, reduced vibrance */
  isMobile?: boolean;
}

export const CosmicColorGradeEffect: React.FC<CosmicColorGradeEffectProps> = ({
  lutStrength = 0.3,
  temperature = 0.0,
  tint = 0.0,
  contrast = 1.0,
  gamma = 1.0,
  saturation = 1.0,
  vibrance = 1.0,
  fade = 0.0,
  rolloff = 0.5,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicColorGradePass | null>(null);
  
  // Mobile fallback: reduced LUT strength, reduced vibrance
  const adjustedLutStrength = isMobile ? lutStrength * 0.7 : lutStrength;
  const adjustedVibrance = isMobile ? vibrance * 0.5 : vibrance;

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-colorgrade', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-colorgrade');
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

    // Update vibrance (motion-reactive: high → vibrance, handled in shader)
    const bass = audioReactive?.bass ?? 0;
    const mid = audioReactive?.mid ?? 0;
    const high = audioReactive?.high ?? 0;

    // Update mobile settings
    if (isMobile) {
      passRef.current.setLutStrength(adjustedLutStrength);
      passRef.current.setVibrance(adjustedVibrance);
    }

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      passRef.current.setCameraFOV((camera as any).fov);
    } else {
      passRef.current.setCameraFOV(cameraFOV);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicColorGradePass | null) => {
        passRef.current = instance;
      }}
      lutStrength={adjustedLutStrength}
      temperature={temperature}
      tint={tint}
      contrast={contrast}
      gamma={gamma}
      saturation={saturation}
      vibrance={adjustedVibrance}
      fade={fade}
      rolloff={rolloff}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
    />
  );
};

