/**
 * Celestial Horizon v2 Component
 * 
 * Phase 2 — Section 52: CELESTIAL HORIZON ENGINE v2
 * Celestial Horizon Engine v2 (E56)
 * 
 * React component for celestial horizon v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialHorizonEngine } from './celestial-horizon-engine';
import { useCelestialHorizonMotion } from './hooks/use-celestial-horizon-motion';
import { useCelestialHorizonUniforms } from './hooks/use-celestial-horizon-uniforms';

export interface CelestialHorizonV2Props {
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

export const CelestialHorizonV2: React.FC<CelestialHorizonV2Props> = ({
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
  position = [0, -1.2, -9.0],
  scale = 3.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numParticles = isMobile ? 120 : 185;
  
  // Create celestial horizon engine
  const horizonEngine = useMemo(() => {
    return new CelestialHorizonEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles,
    });
  }, [intensity, parallaxStrength, numParticles]);
  
  // Get motion state
  const motionState = useCelestialHorizonMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return horizonEngine.getMaterial();
  }, [horizonEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return horizonEngine.getGeometry();
  }, [horizonEngine]);
  
  // Update uniforms
  useCelestialHorizonUniforms(
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
    horizonEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    horizonEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    horizonEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    horizonEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    horizonEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    horizonEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-horizon-v2', (motionState) => {
      // Celestial horizon v2 state is already synced via useCelestialHorizonMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-horizon-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    horizonEngine.setPosition(...position);
    horizonEngine.setScale(scale);
  }, [position, scale, horizonEngine]);
  
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

