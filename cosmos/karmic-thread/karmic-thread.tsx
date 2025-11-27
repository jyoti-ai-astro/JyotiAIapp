/**
 * Karmic Thread Component
 * 
 * Phase 2 — Section 25: COSMIC KARMIC THREAD ENGINE
 * Karmic Thread Engine (E29)
 * 
 * React component for cosmic karmic thread
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { KarmicThreadEngine } from './karmic-thread-engine';
import { useKarmicThreadMotion } from './hooks/use-karmic-thread-motion';
import { useKarmicThreadUniforms } from './hooks/use-karmic-thread-uniforms';

export interface KarmicThreadProps {
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
  
  /** Number of parallel threads (mobile fallback: 3) */
  numThreads?: number;
  
  /** Number of glyphs (mobile fallback: 5) */
  numGlyphs?: number;
}

export const KarmicThread: React.FC<KarmicThreadProps> = ({
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
  position = [0, 1.8, -2.0],
  scale = 1.0,
  numThreads,
  numGlyphs,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const finalNumThreads = numThreads || (isMobile ? 3 : 5);
  const finalNumGlyphs = numGlyphs || (isMobile ? 5 : 8);
  
  // Create karmic thread engine
  const karmicEngine = useMemo(() => {
    return new KarmicThreadEngine({
      intensity,
      mouse,
      parallaxStrength,
      numThreads: finalNumThreads,
      numGlyphs: finalNumGlyphs,
    });
  }, [intensity, parallaxStrength, finalNumThreads, finalNumGlyphs]);
  
  // Get motion state
  const motionState = useKarmicThreadMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return karmicEngine.getMaterial();
  }, [karmicEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return karmicEngine.getGeometry();
  }, [karmicEngine]);
  
  // Update uniforms
  useKarmicThreadUniforms(
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
    karmicEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    karmicEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    karmicEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    karmicEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    karmicEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    karmicEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('karmic-thread', (motionState) => {
      // Karmic thread state is already synced via useKarmicThreadMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('karmic-thread');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    karmicEngine.setPosition(...position);
    karmicEngine.setScale(scale);
  }, [position, scale, karmicEngine]);
  
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

