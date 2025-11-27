/**
 * Cosmic Orbit Component
 * 
 * Phase 2 — Section 37: COSMIC ORBIT ENGINE
 * Cosmic Orbit Engine (E41)
 * 
 * React component for cosmic orbit
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CosmicOrbitEngine } from './cosmic-orbit-engine';
import { useCosmicOrbitMotion } from './hooks/use-orbit-motion';
import { useCosmicOrbitUniforms } from './hooks/use-orbit-uniforms';

export interface CosmicOrbitProps {
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

export const CosmicOrbit: React.FC<CosmicOrbitProps> = ({
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
  position = [0, 0.0, -4.6],
  scale = 1.6,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numRings = isMobile ? 2 : 3;
  const numSatellites = isMobile ? 6 : 9;
  
  // Create cosmic orbit engine
  const orbitEngine = useMemo(() => {
    return new CosmicOrbitEngine({
      intensity,
      mouse,
      parallaxStrength,
      numRings,
      numSatellites,
    });
  }, [intensity, parallaxStrength, numRings, numSatellites]);
  
  // Get motion state
  const motionState = useCosmicOrbitMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return orbitEngine.getMaterial();
  }, [orbitEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return orbitEngine.getGeometry();
  }, [orbitEngine]);
  
  // Update uniforms
  useCosmicOrbitUniforms(
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
    orbitEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    orbitEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    orbitEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    orbitEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    orbitEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    orbitEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-orbit', (motionState) => {
      // Cosmic orbit state is already synced via useCosmicOrbitMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('cosmic-orbit');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    orbitEngine.setPosition(...position);
    orbitEngine.setScale(scale);
  }, [position, scale, orbitEngine]);
  
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

