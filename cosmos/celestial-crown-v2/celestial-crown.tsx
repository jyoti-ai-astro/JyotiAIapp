/**
 * Celestial Crown v2 Component
 * 
 * Phase 2 — Section 65: CELESTIAL CROWN ENGINE v2
 * Celestial Crown Engine v2 (E69)
 * 
 * React component for celestial crown v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialCrownEngine } from './celestial-crown-engine';
import { useCelestialCrownMotion } from './hooks/use-celestial-crown-motion';
import { useCelestialCrownUniforms } from './hooks/use-celestial-crown-uniforms';

export interface CelestialCrownV2Props {
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

export const CelestialCrownV2: React.FC<CelestialCrownV2Props> = ({
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
  position = [0, -2.2, -39.8],
  scale = 13.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback: reduce glyphs, particles, threads, runners
  const isMobile = size.width < 800;
  const numSigils = isMobile ? 65 : 130;
  const numGlyphs = isMobile ? 65 : 130;
  const numRunners = isMobile ? 7 : 14;
  const numLightShafts = isMobile ? 7 : 14;
  const numSpiralMatrix = isMobile ? 10 : 20;
  const numParticles = isMobile ? 150 : 450;
  const numWaveRings = isMobile ? 7 : 14;
  const numEnergyThreads = isMobile ? 25 : 50;
  const numCrownSpires = isMobile ? 6 : 12;
  const numRunes = isMobile ? 65 : 130;
  const numCrownRays = isMobile ? 13 : 26;
  
  // Create celestial crown engine
  const crownEngine = useMemo(() => {
    return new CelestialCrownEngine({
      intensity,
      mouse,
      parallaxStrength,
      numTwinPillars: 2,
      numSigils,
      numGlyphs,
      numRunners,
      numLightShafts,
      numSpiralMatrix,
      numParticles,
      numWaveRings,
      numEnergyThreads,
      numCrownSpires,
      numRunes,
      numCrownRays,
    });
  }, [intensity, parallaxStrength, numSigils, numGlyphs, numRunners, numLightShafts, numSpiralMatrix, numParticles, numWaveRings, numEnergyThreads, numCrownSpires, numRunes, numCrownRays]);
  
  // Get motion state
  const motionState = useCelestialCrownMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return crownEngine.getMaterial();
  }, [crownEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return crownEngine.getGeometry();
  }, [crownEngine]);
  
  // Update uniforms
  useCelestialCrownUniforms(
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
    crownEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    crownEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    crownEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    crownEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    crownEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    crownEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-crown-v2', (motionState) => {
      // Celestial crown v2 state is already synced via useCelestialCrownMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-crown-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    crownEngine.setPosition(...position);
    crownEngine.setScale(scale);
  }, [position, scale, crownEngine]);
  
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

