/**
 * Divine Throne v3 Component
 * 
 * Phase 2 — Section 60: DIVINE THRONE ENGINE v3
 * Divine Throne Engine v3 (E64)
 * 
 * React component for divine throne v3
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { DivineThroneEngine } from './divine-throne-engine';
import { useDivineThroneMotion } from './hooks/use-divine-throne-motion';
import { useDivineThroneUniforms } from './hooks/use-divine-throne-uniforms';

export interface DivineThroneV3Props {
  /** Intensity multiplier */
  intensity?: number;
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Mouse position for parallax */
  mouse?: { x: number; y: number };
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** Breath phase (0-1) from GuruEnergy */
  breathPhase?: number;
  
  /** Breath strength (0-1) from GuruEnergy */
  breathStrength?: number;
  
  /** Rotation sync (from Projection E17) */
  rotationSync?: number;
  
  /** Camera FOV (from CameraController E18) */
  cameraFOV?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Position */
  position?: [number, number, number];
  
  /** Scale */
  scale?: number;
}

export const DivineThroneV3: React.FC<DivineThroneV3Props> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  breathPhase = 0,
  breathStrength = 0,
  rotationSync = 0,
  cameraFOV = 75.0,
  parallaxStrength = 1.0,
  position = [0, -0.8, -24.4],
  scale = 8.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numThronePillars = isMobile ? 4 : 8;
  const numGoldenInsignias = isMobile ? 72 : 96;
  const numDivineSpires = isMobile ? 6 : 12;
  const numOrbitalRings = isMobile ? 2 : 4;
  const numKarmicThreads = isMobile ? 20 : 40;
  const numLightPillars = isMobile ? 6 : 10;
  const numCrownDust = isMobile ? 200 : 350;
  const numAscensionRays = isMobile ? 12 : 20;
  
  // Create divine throne engine
  const throneEngine = useMemo(() => {
    return new DivineThroneEngine({
      intensity,
      mouse,
      parallaxStrength,
      numThronePillars,
      numGoldenInsignias,
      numDivineSpires,
      numOrbitalRings,
      numKarmicThreads,
      numLightPillars,
      numCrownDust,
      numAscensionRays,
    });
  }, [intensity, parallaxStrength, numThronePillars, numGoldenInsignias, numDivineSpires, numOrbitalRings, numKarmicThreads, numLightPillars, numCrownDust, numAscensionRays]);
  
  // Get motion state
  const motionState = useDivineThroneMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return throneEngine.getMaterial();
  }, [throneEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return throneEngine.getGeometry();
  }, [throneEngine]);
  
  // Update uniforms
  useDivineThroneUniforms(
    material,
    motionState,
    breathPhase,
    breathStrength,
    blessingWaveProgress,
    mouse,
    intensity,
    parallaxStrength,
    rotationSync,
    cameraFOV
  );
  
  // Update engine
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    throneEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    throneEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    throneEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    throneEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    throneEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    throneEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('divine-throne-v3', (motionState) => {
      // Divine throne v3 state is already synced via useDivineThroneMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('divine-throne-v3');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    throneEngine.setPosition(...position);
    throneEngine.setScale(scale);
  }, [position, scale, throneEngine]);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      scale={scale}
    />
  );
};

