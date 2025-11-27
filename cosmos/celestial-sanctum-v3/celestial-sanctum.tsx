/**
 * Celestial Sanctum v3 Component
 * 
 * Phase 2 — Section 64: CELESTIAL SANCTUM ENGINE v3
 * Celestial Sanctum Engine v3 (E68)
 * 
 * React component for celestial sanctum v3
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialSanctumEngine } from './celestial-sanctum-engine';
import { useCelestialSanctumMotion } from './hooks/use-celestial-sanctum-motion';
import { useCelestialSanctumUniforms } from './hooks/use-celestial-sanctum-uniforms';

export interface CelestialSanctumV3Props {
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

export const CelestialSanctumV3: React.FC<CelestialSanctumV3Props> = ({
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
  position = [0, -1.9, -36.4],
  scale = 12.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback: 6 pillars, 60 runes, 150 particles, 8 beams (desktop full counts)
  const isMobile = size.width < 800;
  const numSanctumPillars = isMobile ? 6 : 12;
  const numRunes = isMobile ? 60 : 120;
  const numObelisks = isMobile ? 6 : 10;
  const numCrossBeams = isMobile ? 8 : 40;
  const numOrbitalRings = isMobile ? 2 : 4;
  const numLightShafts = isMobile ? 8 : 12;
  const numSpiralMatrix = isMobile ? 9 : 18;
  const numParticles = isMobile ? 150 : 400;
  const numWaveRings = isMobile ? 6 : 12;
  const numEtherThreads = isMobile ? 20 : 45;
  const numLightTowers = isMobile ? 4 : 8;
  const numSanctumRays = isMobile ? 12 : 24;
  
  // Create celestial sanctum engine
  const sanctumEngine = useMemo(() => {
    return new CelestialSanctumEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSanctumPillars,
      numRunes,
      numObelisks,
      numCrossBeams,
      numOrbitalRings,
      numLightShafts,
      numSpiralMatrix,
      numParticles,
      numWaveRings,
      numEtherThreads,
      numLightTowers,
      numSanctumRays,
    });
  }, [intensity, parallaxStrength, numSanctumPillars, numRunes, numObelisks, numCrossBeams, numOrbitalRings, numLightShafts, numSpiralMatrix, numParticles, numWaveRings, numEtherThreads, numLightTowers, numSanctumRays]);
  
  // Get motion state
  const motionState = useCelestialSanctumMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return sanctumEngine.getMaterial();
  }, [sanctumEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return sanctumEngine.getGeometry();
  }, [sanctumEngine]);
  
  // Update uniforms
  useCelestialSanctumUniforms(
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
    sanctumEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    sanctumEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    sanctumEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    sanctumEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    sanctumEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    sanctumEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-sanctum-v3', (motionState) => {
      // Celestial sanctum v3 state is already synced via useCelestialSanctumMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-sanctum-v3');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    sanctumEngine.setPosition(...position);
    sanctumEngine.setScale(scale);
  }, [position, scale, sanctumEngine]);
  
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

