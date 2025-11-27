/**
 * Quantum Halo Component
 * 
 * Phase 2 — Section 48: QUANTUM HALO ENGINE
 * Quantum Halo Engine (E52)
 * 
 * React component for quantum halo
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { QuantumHaloEngine } from './quantum-halo-engine';
import { useQuantumHaloMotion } from './hooks/use-quantum-halo-motion';
import { useQuantumHaloUniforms } from './hooks/use-quantum-halo-uniforms';

export interface QuantumHaloProps {
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

export const QuantumHalo: React.FC<QuantumHaloProps> = ({
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
  position = [0, 0.0, -7.2],
  scale = 2.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numSparks = isMobile ? 150 : 260;
  
  // Create quantum halo engine
  const haloEngine = useMemo(() => {
    return new QuantumHaloEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSparks,
    });
  }, [intensity, parallaxStrength, numSparks]);
  
  // Get motion state
  const motionState = useQuantumHaloMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return haloEngine.getMaterial();
  }, [haloEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return haloEngine.getGeometry();
  }, [haloEngine]);
  
  // Update uniforms
  useQuantumHaloUniforms(
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
    haloEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    haloEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    haloEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    haloEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    haloEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    haloEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('quantum-halo', (motionState) => {
      // Quantum halo state is already synced via useQuantumHaloMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('quantum-halo');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    haloEngine.setPosition(...position);
    haloEngine.setScale(scale);
  }, [position, scale, haloEngine]);
  
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

