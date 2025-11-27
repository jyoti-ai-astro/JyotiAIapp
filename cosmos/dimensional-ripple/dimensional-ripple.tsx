/**
 * Dimensional Ripple Component
 * 
 * Phase 2 — Section 43: DIMENSIONAL RIPPLE ENGINE
 * Dimensional Ripple Engine (E47)
 * 
 * React component for dimensional ripple
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { DimensionalRippleEngine } from './dimensional-ripple-engine';
import { useDimensionalRippleMotion } from './hooks/use-ripple-motion';
import { useDimensionalRippleUniforms } from './hooks/use-ripple-uniforms';

export interface DimensionalRippleProps {
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

export const DimensionalRipple: React.FC<DimensionalRippleProps> = ({
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
  position = [0, -0.6, -6.8],
  scale = 2.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numParticles = isMobile ? 70 : 140;
  
  // Create dimensional ripple engine
  const rippleEngine = useMemo(() => {
    return new DimensionalRippleEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles,
    });
  }, [intensity, parallaxStrength, numParticles]);
  
  // Get motion state
  const motionState = useDimensionalRippleMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return rippleEngine.getMaterial();
  }, [rippleEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return rippleEngine.getGeometry();
  }, [rippleEngine]);
  
  // Update uniforms
  useDimensionalRippleUniforms(
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
    rippleEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    rippleEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    rippleEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    rippleEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    rippleEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    rippleEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('dimensional-ripple', (motionState) => {
      // Dimensional ripple state is already synced via useDimensionalRippleMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('dimensional-ripple');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    rippleEngine.setPosition(...position);
    rippleEngine.setScale(scale);
  }, [position, scale, rippleEngine]);
  
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

