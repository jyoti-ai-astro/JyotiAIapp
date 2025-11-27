/**
 * Astral Bloom Component
 * 
 * Phase 2 — Section 39: ASTRAL BLOOM ENGINE
 * Astral Bloom Engine (E43)
 * 
 * React component for astral bloom
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralBloomEngine } from './astral-bloom-engine';
import { useAstralBloomMotion } from './hooks/use-bloom-motion';
import { useAstralBloomUniforms } from './hooks/use-bloom-uniforms';

export interface AstralBloomProps {
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

export const AstralBloom: React.FC<AstralBloomProps> = ({
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
  position = [0, 0.0, -5.4],
  scale = 1.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const discSegments = isMobile ? 40 : 56;
  const numParticles = isMobile ? 60 : 130;
  
  // Create astral bloom engine
  const bloomEngine = useMemo(() => {
    return new AstralBloomEngine({
      intensity,
      mouse,
      parallaxStrength,
      discSegments,
      numParticles,
    });
  }, [intensity, parallaxStrength, discSegments, numParticles]);
  
  // Get motion state
  const motionState = useAstralBloomMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return bloomEngine.getMaterial();
  }, [bloomEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return bloomEngine.getGeometry();
  }, [bloomEngine]);
  
  // Update uniforms
  useAstralBloomUniforms(
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
    bloomEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    bloomEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    bloomEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    bloomEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    bloomEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    bloomEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('astral-bloom', (motionState) => {
      // Astral bloom state is already synced via useAstralBloomMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-bloom');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    bloomEngine.setPosition(...position);
    bloomEngine.setScale(scale);
  }, [position, scale, bloomEngine]);
  
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

