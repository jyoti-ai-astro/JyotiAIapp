/**
 * Dharma Wheel Component
 * 
 * Phase 2 — Section 24: DHARMA WHEEL ENGINE
 * Dharma Wheel Engine (E28)
 * 
 * React component for dharma wheel
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { DharmaWheelEngine } from './dharma-wheel-engine';
import { useDharmaWheelMotion } from './hooks/use-dharma-wheel-motion';
import { useDharmaWheelUniforms } from './hooks/use-dharma-wheel-uniforms';

export interface DharmaWheelProps {
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
  
  /** Number of spokes (mobile fallback: 8) */
  numSpokes?: number;
}

export const DharmaWheel: React.FC<DharmaWheelProps> = ({
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
  position = [0, 1.4, -1.8],
  scale = 1.0,
  numSpokes,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback for spokes
  const isMobile = size.width < 800;
  const finalNumSpokes = numSpokes || (isMobile ? 8 : 12);
  
  // Create dharma wheel engine
  const dharmaEngine = useMemo(() => {
    return new DharmaWheelEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSpokes: finalNumSpokes,
    });
  }, [intensity, parallaxStrength, finalNumSpokes]);
  
  // Get motion state
  const motionState = useDharmaWheelMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return dharmaEngine.getMaterial();
  }, [dharmaEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return dharmaEngine.getGeometry();
  }, [dharmaEngine]);
  
  // Update uniforms
  useDharmaWheelUniforms(
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
    dharmaEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    dharmaEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    dharmaEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    dharmaEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    dharmaEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    dharmaEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('dharma-wheel', (motionState) => {
      // Dharma wheel state is already synced via useDharmaWheelMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('dharma-wheel');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    dharmaEngine.setPosition(...position);
    dharmaEngine.setScale(scale);
  }, [position, scale, dharmaEngine]);
  
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

