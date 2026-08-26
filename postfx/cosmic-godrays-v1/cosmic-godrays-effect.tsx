/**
 * Cosmic GodRays v1 Effect Component
 * 
 * Phase 3 — Section 14: COSMIC GODRAYS ENGINE v1
 * Cosmic GodRays Engine v1 (F14)
 * 
 * React wrapper for CosmicGodRaysPass to work with @react-three/postprocessing
 */

'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { wrapEffect } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
const { Vector2, Vector3 } = THREE;



import { CosmicGodRaysPass, type CosmicGodRaysPassConfig } from './cosmic-godrays-pass';

const Effect = wrapEffect(CosmicGodRaysPass) as unknown as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CosmicGodRaysPassConfig> & React.RefAttributes<CosmicGodRaysPass>
>;
import { motionOrchestrator } from '../../cosmos/motion/orchestrator';

export interface CosmicGodRaysEffectProps {
  /** Sun position (0-1) */
  sunPos?: { x: number; y: number };
  
  /** Light direction */
  lightDir?: { x: number; y: number; z: number };
  
  /** Beam intensity */
  intensity?: number;
  
  /** Scattering strength */
  scatteringStrength?: number;
  
  /** Step count for ray-marching */
  stepCount?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
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
  
  /** Depth texture (from R3F) */
  depthBuffer?: THREE.Texture | null;
  
  /** Mouse position for parallax (0-1) */
  mouse?: { x: number; y: number };
  
  /** Mobile fallback: reduce steps to 12, reduce scattering strength */
  isMobile?: boolean;
}

export const CosmicGodRaysEffect: React.FC<CosmicGodRaysEffectProps> = ({
  sunPos = { x: 0.5, y: 0.5 },
  lightDir = { x: 0.0, y: -1.0, z: 0.0 },
  intensity = 0.5,
  scatteringStrength = 0.3,
  stepCount = 24.0,
  parallaxStrength = 0.1,
  audioReactive,
  blessingWaveProgress = 0,
  cameraFOV = 75.0,
  depthBuffer = null,
  mouse = { x: 0.5, y: 0.5 },
  isMobile = false,
}) => {
  const { size, camera } = useThree();
  const timeRef = useRef<number>(0);
  const passRef = useRef<CosmicGodRaysPass | null>(null);
  
  // Mobile fallback: reduce steps to 12, reduce scattering strength
  const adjustedStepCount = isMobile ? 12.0 : stepCount;
  const adjustedScatteringStrength = isMobile ? scatteringStrength * 0.7 : scatteringStrength;
  
  // Convert to Vector2/Vector3
  const sunPosVec = useMemo(() => new Vector2(sunPos.x, sunPos.y), [sunPos.x, sunPos.y]);
  const lightDirVec = useMemo(() => new Vector3(lightDir.x, lightDir.y, lightDir.z), [lightDir.x, lightDir.y, lightDir.z]);
  const mouseVec = useMemo(() => new Vector2(mouse.x, mouse.y), [mouse.x, mouse.y]);
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-godrays', (motionState) => {
      // Update audio reactive values
      passRef.current?.setAudioReactive(
          motionState.bassMotion,
          motionState.midMotion,
          motionState.highMotion
        );
    });

    return () => {
      motionOrchestrator.unregisterEngine('cosmic-godrays');
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

    // Update depth texture
    pass.setDepthTexture(depthBuffer);

    // Update mouse position
    pass.setMouse(mouse.x, mouse.y);

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
      pass.setStepCount(adjustedStepCount);
      pass.setScatteringStrength(adjustedScatteringStrength);
    }
  });

  return (
    <Effect
      ref={(instance: CosmicGodRaysPass | null) => {
        passRef.current = instance;
      }}
      sunPos={sunPosVec}
      lightDir={lightDirVec}
      intensity={intensity}
      scatteringStrength={adjustedScatteringStrength}
      stepCount={adjustedStepCount}
      parallaxStrength={parallaxStrength}
      bass={audioReactive?.bass ?? 0}
      mid={audioReactive?.mid ?? 0}
      high={audioReactive?.high ?? 0}
      blessingWaveProgress={blessingWaveProgress}
      cameraFOV={cameraFOV}
      depthTexture={depthBuffer}
      time={0}
      mouse={mouseVec}
    />
  );
};
