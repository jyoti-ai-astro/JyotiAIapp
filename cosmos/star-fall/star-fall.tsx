/**
 * StarFall Component
 * 
 * Phase 2 — Section 40: STARFALL ENGINE
 * StarFall Engine (E44)
 * 
 * React component for starfall
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { StarFallEngine } from './star-fall-engine';
import { useStarFallMotion } from './hooks/use-starfall-motion';
import { useStarFallUniforms } from './hooks/use-starfall-uniforms';

export interface StarFallProps {
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

export const StarFall: React.FC<StarFallProps> = ({
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
  position = [0, 0.0, -5.8],
  scale = 1.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numStreaks = isMobile ? 30 : 60;
  const numSparks = isMobile ? 60 : 115;
  const numGlows = isMobile ? 6 : 15;
  
  // Create starfall engine
  const starfallEngine = useMemo(() => {
    return new StarFallEngine({
      intensity,
      mouse,
      parallaxStrength,
      numStreaks,
      numSparks,
      numGlows,
    });
  }, [intensity, parallaxStrength, numStreaks, numSparks, numGlows]);
  
  // Get motion state
  const motionState = useStarFallMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return starfallEngine.getMaterial();
  }, [starfallEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return starfallEngine.getGeometry();
  }, [starfallEngine]);
  
  // Update uniforms
  useStarFallUniforms(
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
    starfallEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    starfallEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    starfallEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    starfallEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    starfallEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    starfallEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('star-fall', (motionState) => {
      // Starfall state is already synced via useStarFallMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('star-fall');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    starfallEngine.setPosition(...position);
    starfallEngine.setScale(scale);
  }, [position, scale, starfallEngine]);
  
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

