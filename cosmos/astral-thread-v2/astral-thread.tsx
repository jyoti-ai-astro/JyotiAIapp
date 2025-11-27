/**
 * Astral Thread v2 Component
 * 
 * Phase 2 — Section 54: ASTRAL THREAD ENGINE v2
 * Astral Thread Engine v2 (E58)
 * 
 * React component for astral thread v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralThreadEngine } from './astral-thread-engine';
import { useAstralThreadMotion } from './hooks/use-astral-thread-motion';
import { useAstralThreadUniforms } from './hooks/use-astral-thread-uniforms';

export interface AstralThreadV2Props {
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

export const AstralThreadV2: React.FC<AstralThreadV2Props> = ({
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
  position = [0, 0.1, -6.4],
  scale = 2.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallbacks
  const isMobile = size.width < 800;
  const numBeams = isMobile ? 6 : 12;
  const numLattice = isMobile ? 28 : 40;
  const numPackets = isMobile ? 10 : 20;
  const numStrands = isMobile ? 40 : 60;
  const numDust = isMobile ? 140 : 220;
  
  // Create astral thread engine
  const threadEngine = useMemo(() => {
    return new AstralThreadEngine({
      intensity,
      mouse,
      parallaxStrength,
      numBeams,
      numLattice,
      numPackets,
      numStrands,
      numDust,
    });
  }, [intensity, parallaxStrength, numBeams, numLattice, numPackets, numStrands, numDust]);
  
  // Get motion state
  const motionState = useAstralThreadMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return threadEngine.getMaterial();
  }, [threadEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return threadEngine.getGeometry();
  }, [threadEngine]);
  
  // Update uniforms
  useAstralThreadUniforms(
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
    threadEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    threadEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    threadEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    threadEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    threadEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    threadEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('astral-thread-v2', (motionState) => {
      // Astral thread v2 state is already synced via useAstralThreadMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-thread-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    threadEngine.setPosition(...position);
    threadEngine.setScale(scale);
  }, [position, scale, threadEngine]);
  
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

