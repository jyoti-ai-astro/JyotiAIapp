/**
 * Solar Arc Component
 * 
 * Phase 2 — Section 47: SOLAR ARC FIELD ENGINE
 * Solar Arc Engine (E51)
 * 
 * React component for solar arc
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { SolarArcEngine } from './solar-arc-engine';
import { useSolarArcMotion } from './hooks/use-solar-arc-motion';
import { useSolarArcUniforms } from './hooks/use-solar-arc-uniforms';

export interface SolarArcProps {
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

export const SolarArc: React.FC<SolarArcProps> = ({
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
  position = [0, 0.0, -6.9],
  scale = 2.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numSparks = isMobile ? 100 : 180;
  
  // Create solar arc engine
  const arcEngine = useMemo(() => {
    return new SolarArcEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSparks,
    });
  }, [intensity, parallaxStrength, numSparks]);
  
  // Get motion state
  const motionState = useSolarArcMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return arcEngine.getMaterial();
  }, [arcEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return arcEngine.getGeometry();
  }, [arcEngine]);
  
  // Update uniforms
  useSolarArcUniforms(
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
    arcEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    arcEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    arcEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    arcEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    arcEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    arcEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('solar-arc', (motionState) => {
      // Solar arc state is already synced via useSolarArcMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('solar-arc');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    arcEngine.setPosition(...position);
    arcEngine.setScale(scale);
  }, [position, scale, arcEngine]);
  
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

