/**
 * Celestial Gate Component
 * 
 * Phase 2 — Section 32: CELESTIAL GATE ENGINE
 * Celestial Gate Engine (E36)
 * 
 * React component for celestial gate
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialGateEngine } from './celestial-gate-engine';
import { useCelestialGateMotion } from './hooks/use-gate-motion';
import { useCelestialGateUniforms } from './hooks/use-gate-uniforms';

export interface CelestialGateProps {
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

export const CelestialGate: React.FC<CelestialGateProps> = ({
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
  position = [0, 1.3, -3.0],
  scale = 1.3,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const haloSegments = isMobile ? 48 : 80;
  const numSigils = isMobile ? 8 : 16;
  const coreSegments = isMobile ? 32 : 48;
  
  // Create celestial gate engine
  const gateEngine = useMemo(() => {
    return new CelestialGateEngine({
      intensity,
      mouse,
      parallaxStrength,
      haloSegments,
      numSigils,
      coreSegments,
    });
  }, [intensity, parallaxStrength, haloSegments, numSigils, coreSegments]);
  
  // Get motion state
  const motionState = useCelestialGateMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return gateEngine.getMaterial();
  }, [gateEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return gateEngine.getGeometry();
  }, [gateEngine]);
  
  // Update uniforms
  useCelestialGateUniforms(
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
    gateEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    gateEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    gateEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    gateEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    gateEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    gateEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-gate', (motionState) => {
      // Celestial gate state is already synced via useCelestialGateMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-gate');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    gateEngine.setPosition(...position);
    gateEngine.setScale(scale);
  }, [position, scale, gateEngine]);
  
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

