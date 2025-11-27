/**
 * Stellar Wind Component
 * 
 * Phase 2 — Section 46: STELLAR WIND SHEAR ENGINE
 * Stellar Wind Engine (E50)
 * 
 * React component for stellar wind
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { StellarWindEngine } from './stellar-wind-engine';
import { useStellarWindMotion } from './hooks/use-stellar-wind-motion';
import { useStellarWindUniforms } from './hooks/use-stellar-wind-uniforms';

export interface StellarWindProps {
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

export const StellarWind: React.FC<StellarWindProps> = ({
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
  position = [0, 0.2, -6.7],
  scale = 2.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numParticles = isMobile ? 110 : 210;
  
  // Create stellar wind engine
  const windEngine = useMemo(() => {
    return new StellarWindEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles,
    });
  }, [intensity, parallaxStrength, numParticles]);
  
  // Get motion state
  const motionState = useStellarWindMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return windEngine.getMaterial();
  }, [windEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return windEngine.getGeometry();
  }, [windEngine]);
  
  // Update uniforms
  useStellarWindUniforms(
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
    windEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    windEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    windEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    windEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    windEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    windEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('stellar-wind', (motionState) => {
      // Stellar wind state is already synced via useStellarWindMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('stellar-wind');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    windEngine.setPosition(...position);
    windEngine.setScale(scale);
  }, [position, scale, windEngine]);
  
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

