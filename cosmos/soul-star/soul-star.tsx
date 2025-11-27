/**
 * Soul Star Component
 * 
 * Phase 2 — Section 31: SOUL STAR ENGINE
 * Soul Star Engine (E35)
 * 
 * React component for soul star
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { SoulStarEngine } from './soul-star-engine';
import { useSoulStarMotion } from './hooks/use-star-motion';
import { useSoulStarUniforms } from './hooks/use-star-uniforms';

export interface SoulStarProps {
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

export const SoulStar: React.FC<SoulStarProps> = ({
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
  position = [0, 1.0, -2.8],
  scale = 1.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numStarPoints = isMobile ? 6 : 8;
  const numSpikes = isMobile ? 8 : 15;
  const numParticles = isMobile ? 40 : 70;
  
  // Create soul star engine
  const starEngine = useMemo(() => {
    return new SoulStarEngine({
      intensity,
      mouse,
      parallaxStrength,
      numStarPoints,
      numSpikes,
      numParticles,
    });
  }, [intensity, parallaxStrength, numStarPoints, numSpikes, numParticles]);
  
  // Get motion state
  const motionState = useSoulStarMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return starEngine.getMaterial();
  }, [starEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return starEngine.getGeometry();
  }, [starEngine]);
  
  // Update uniforms
  useSoulStarUniforms(
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
    starEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    starEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    starEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    starEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    starEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    starEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('soul-star', (motionState) => {
      // Soul star state is already synced via useSoulStarMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('soul-star');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    starEngine.setPosition(...position);
    starEngine.setScale(scale);
  }, [position, scale, starEngine]);
  
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

