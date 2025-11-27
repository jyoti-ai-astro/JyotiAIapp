/**
 * Cosmic Drift Field Component
 * 
 * Phase 2 — Section 45: COSMIC DRIFT FIELD ENGINE
 * Cosmic Drift Field Engine (E49)
 * 
 * React component for cosmic drift field
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CosmicDriftFieldEngine } from './drift-field-engine';
import { useCosmicDriftFieldMotion } from './hooks/use-drift-field-motion';
import { useCosmicDriftFieldUniforms } from './hooks/use-drift-field-uniforms';

export interface CosmicDriftFieldProps {
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

export const CosmicDriftField: React.FC<CosmicDriftFieldProps> = ({
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
  position = [0, 0.0, -6.5],
  scale = 2.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numParticles = isMobile ? 100 : 205;
  
  // Create cosmic drift field engine
  const driftFieldEngine = useMemo(() => {
    return new CosmicDriftFieldEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles,
    });
  }, [intensity, parallaxStrength, numParticles]);
  
  // Get motion state
  const motionState = useCosmicDriftFieldMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return driftFieldEngine.getMaterial();
  }, [driftFieldEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return driftFieldEngine.getGeometry();
  }, [driftFieldEngine]);
  
  // Update uniforms
  useCosmicDriftFieldUniforms(
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
    driftFieldEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    driftFieldEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    driftFieldEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    driftFieldEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    driftFieldEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    driftFieldEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-drift-field', (motionState) => {
      // Cosmic drift field state is already synced via useCosmicDriftFieldMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('cosmic-drift-field');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    driftFieldEngine.setPosition(...position);
    driftFieldEngine.setScale(scale);
  }, [position, scale, driftFieldEngine]);
  
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

