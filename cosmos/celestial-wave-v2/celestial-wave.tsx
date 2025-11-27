/**
 * Celestial Wave v2 Component
 * 
 * Phase 2 — Section 51: CELESTIAL WAVE ENGINE v2
 * Celestial Wave Engine v2 (E55)
 * 
 * React component for celestial wave v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialWaveEngine } from './celestial-wave-engine';
import { useCelestialWaveMotion } from './hooks/use-celestial-wave-motion';
import { useCelestialWaveUniforms } from './hooks/use-celestial-wave-uniforms';

export interface CelestialWaveV2Props {
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

export const CelestialWaveV2: React.FC<CelestialWaveV2Props> = ({
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
  position = [0, -0.1, -8.2],
  scale = 3.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numParticles = isMobile ? 120 : 220;
  const numAuraStreams = isMobile ? 60 : 80;
  
  // Create celestial wave engine
  const waveEngine = useMemo(() => {
    return new CelestialWaveEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles,
      numAuraStreams,
    });
  }, [intensity, parallaxStrength, numParticles, numAuraStreams]);
  
  // Get motion state
  const motionState = useCelestialWaveMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return waveEngine.getMaterial();
  }, [waveEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return waveEngine.getGeometry();
  }, [waveEngine]);
  
  // Update uniforms
  useCelestialWaveUniforms(
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
    waveEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    waveEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    waveEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    waveEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    waveEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    waveEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-wave-v2', (motionState) => {
      // Celestial wave v2 state is already synced via useCelestialWaveMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-wave-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    waveEngine.setPosition(...position);
    waveEngine.setScale(scale);
  }, [position, scale, waveEngine]);
  
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

