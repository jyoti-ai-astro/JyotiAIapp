/**
 * Cosmic Fracture Component
 * 
 * Phase 2 — Section 50: COSMIC FRACTURE ENGINE
 * Cosmic Fracture Engine (E54)
 * 
 * React component for cosmic fracture
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CosmicFractureEngine } from './cosmic-fracture-engine';
import { useCosmicFractureMotion } from './hooks/use-cosmic-fracture-motion';
import { useCosmicFractureUniforms } from './hooks/use-cosmic-fracture-uniforms';

export interface CosmicFractureProps {
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

export const CosmicFracture: React.FC<CosmicFractureProps> = ({
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
  position = [0, 0.1, -7.9],
  scale = 3.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numCrystals = isMobile ? 150 : 260;
  
  // Create cosmic fracture engine
  const fractureEngine = useMemo(() => {
    return new CosmicFractureEngine({
      intensity,
      mouse,
      parallaxStrength,
      numCrystals,
    });
  }, [intensity, parallaxStrength, numCrystals]);
  
  // Get motion state
  const motionState = useCosmicFractureMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return fractureEngine.getMaterial();
  }, [fractureEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return fractureEngine.getGeometry();
  }, [fractureEngine]);
  
  // Update uniforms
  useCosmicFractureUniforms(
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
    fractureEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    fractureEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    fractureEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    fractureEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    fractureEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    fractureEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-fracture', (motionState) => {
      // Cosmic fracture state is already synced via useCosmicFractureMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('cosmic-fracture');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    fractureEngine.setPosition(...position);
    fractureEngine.setScale(scale);
  }, [position, scale, fractureEngine]);
  
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

