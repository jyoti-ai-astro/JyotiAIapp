/**
 * Astral Trail Component
 * 
 * Phase 2 — Section 28: ASTRAL TRAIL ENGINE
 * Astral Trail Engine (E32)
 * 
 * React component for astral trail
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralTrailEngine } from './astral-trail-engine';
import { useAstralTrailMotion } from './hooks/use-trail-motion';
import { useAstralTrailUniforms } from './hooks/use-trail-uniforms';

export interface AstralTrailProps {
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

export const AstralTrail: React.FC<AstralTrailProps> = ({
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
  position = [0, 0.5, -2.0],
  scale = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numParticles = isMobile ? 60 : 100;
  const numRibbonPoints = isMobile ? 24 : 32;
  
  // Create astral trail engine
  const trailEngine = useMemo(() => {
    return new AstralTrailEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles,
      numRibbonPoints,
      numEchoLines: 6,
    });
  }, [intensity, parallaxStrength, numParticles, numRibbonPoints]);
  
  // Get motion state
  const motionState = useAstralTrailMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return trailEngine.getMaterial();
  }, [trailEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return trailEngine.getGeometry();
  }, [trailEngine]);
  
  // Update uniforms
  useAstralTrailUniforms(
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
    trailEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    trailEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    trailEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    trailEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    trailEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    trailEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('astral-trail', (motionState) => {
      // Astral trail state is already synced via useAstralTrailMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-trail');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    trailEngine.setPosition(...position);
    trailEngine.setScale(scale);
  }, [position, scale, trailEngine]);
  
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

