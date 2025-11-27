/**
 * Cosmic MotionBlur v1 Effect Component
 * 
 * Phase 3 — Section 12: COSMIC MOTIONBLUR ENGINE v1
 * Cosmic MotionBlur Engine v1 (F12)
 * 
 * React wrapper for CosmicMotionBlurPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector2 } from 'three';
import { CosmicMotionBlurPass } from './cosmic-motionblur-pass';
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

const Effect = wrapEffect(CosmicMotionBlurPass);

export interface CosmicMotionBlurEffectProps {
  /** Blur strength */
  blurStrength?: number;
  
  /** Radial strength */
  radialStrength?: number;
  
  /** Velocity factor */
  velocityFactor?: number;
  
  /** Sample count */
  sampleCount?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Scroll velocity (x, y) */
  scrollVelocity?: { x: number; y: number };
  
  /** Mouse velocity (x, y) */
  mouseVelocity?: { x: number; y: number };
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** Camera FOV */
  cameraFOV?: number;
  
  /** Mobile fallback: reduce kernel samples by 50%, disable depth-aware blur */
  isMobile?: boolean;
}

export const CosmicMotionBlurEffect: React.FC<CosmicMotionBlurEffectProps> = ({
  blurStrength = 0.5,
  radialStrength = 0.3,
  velocityFactor = 1.0,
  sampleCount = 16.0,
  audioReactive,
  scrollVelocity = { x: 0, y: 0 },
  mouseVelocity = { x: 0, y: 0 },
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicMotionBlurPass | null>(null);
  
  // Mobile fallback: reduce kernel samples by 50%, disable depth-aware blur
  const adjustedSampleCount = isMobile ? sampleCount / 2.0 : sampleCount;
  const disableDepthAware = isMobile;
  
  // Convert velocities to Vector2
  const scrollVel = useMemo(() => new Vector2(scrollVelocity.x, scrollVelocity.y), [scrollVelocity.x, scrollVelocity.y]);
  const mouseVel = useMemo(() => new Vector2(mouseVelocity.x, mouseVelocity.y), [mouseVelocity.x, mouseVelocity.y]);

  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-motionblur', (motionState) => {
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
      motionOrchestrator.unregisterEngine('cosmic-motionblur');
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

    // Update scroll velocity
    passRef.current.setScrollVelocity(scrollVelocity.x, scrollVelocity.y);

    // Update mouse velocity
    passRef.current.setMouseVelocity(mouseVelocity.x, mouseVelocity.y);

    // Update blessing wave progress
    passRef.current.setBlessingWaveProgress(blessingWaveProgress);

    // Update camera FOV
    if (camera && 'fov' in camera) {
      passRef.current.setCameraFOV((camera as any).fov);
    } else {
      passRef.current.setCameraFOV(cameraFOV);
    }

    // Update mobile settings
    if (isMobile) {
      passRef.current.setSampleCount(adjustedSampleCount);
      passRef.current.setDisableDepthAware(true);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicMotionBlurPass | null) => {
        passRef.current = instance;
      }}
      blurStrength={blurStrength}
      radialStrength={radialStrength}
      velocityFactor={velocityFactor}
      sampleCount={adjustedSampleCount}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      scrollVelocity={scrollVel}
      mouseVelocity={mouseVel}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      time={0}
      disableDepthAware={disableDepthAware}
    />
  );
};

