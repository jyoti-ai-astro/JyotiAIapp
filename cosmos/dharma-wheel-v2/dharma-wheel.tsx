/**
 * Dharma Wheel v2 Component
 * 
 * Phase 2 — Section 55: DHARMA WHEEL ENGINE v2
 * Dharma Wheel Engine v2 (E59)
 * 
 * React component for dharma wheel v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { DharmaWheelEngine } from './dharma-wheel-engine';
import { useDharmaWheelMotion } from './hooks/use-dharma-wheel-motion';
import { useDharmaWheelUniforms } from './hooks/use-dharma-wheel-uniforms';

export interface DharmaWheelV2Props {
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

export const DharmaWheelV2: React.FC<DharmaWheelV2Props> = ({
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
  position = [0, -0.1, -12.0],
  scale = 4.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numSpokes = isMobile ? 6 : 16;
  const numGlyphs = isMobile ? 32 : 48;
  const numDust = isMobile ? 180 : 260;
  
  // Create dharma wheel engine
  const wheelEngine = useMemo(() => {
    return new DharmaWheelEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSpokes,
      numGlyphs,
      numDust,
    });
  }, [intensity, parallaxStrength, numSpokes, numGlyphs, numDust]);
  
  // Get motion state
  const motionState = useDharmaWheelMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return wheelEngine.getMaterial();
  }, [wheelEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return wheelEngine.getGeometry();
  }, [wheelEngine]);
  
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
    wheelEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    wheelEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    wheelEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    wheelEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    wheelEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    wheelEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('dharma-wheel-v2', (motionState) => {
      // Dharma wheel v2 state is already synced via useDharmaWheelMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('dharma-wheel-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    wheelEngine.setPosition(...position);
    wheelEngine.setScale(scale);
  }, [position, scale, wheelEngine]);
  
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

