/**
 * Celestial Crest v2 Component
 * 
 * Phase 2 — Section 66: CELESTIAL CREST ENGINE v2
 * Celestial Crest Engine v2 (E70)
 * 
 * React component for celestial crest v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialCrestEngine } from './celestial-crest-engine';
import { useCelestialCrestMotion } from './hooks/use-celestial-crest-motion';
import { useCelestialCrestUniforms } from './hooks/use-celestial-crest-uniforms';

export interface CelestialCrestV2Props {
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

export const CelestialCrestV2: React.FC<CelestialCrestV2Props> = ({
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
  position = [0, -2.4, -42.6],
  scale = 14.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback: reduce glyphs, particles, spires, runners, threads
  const isMobile = size.width < 800;
  const numRunes = isMobile ? 70 : 140;
  const numGlyphs = isMobile ? 70 : 140;
  const numRunners = isMobile ? 8 : 16;
  const numLightShafts = isMobile ? 8 : 16;
  const numSpiralMatrix = isMobile ? 11 : 22;
  const numParticles = isMobile ? 150 : 500;
  const numWaveRings = isMobile ? 8 : 16;
  const numEnergyThreads = isMobile ? 28 : 55;
  const numCrestSpires = isMobile ? 7 : 14;
  const numCrestRays = isMobile ? 14 : 28;
  
  // Create celestial crest engine
  const crestEngine = useMemo(() => {
    return new CelestialCrestEngine({
      intensity,
      mouse,
      parallaxStrength,
      numTwinPillars: 2,
      numRunes,
      numGlyphs,
      numRunners,
      numLightShafts,
      numSpiralMatrix,
      numParticles,
      numWaveRings,
      numEnergyThreads,
      numCrestSpires,
      numCrestRays,
    });
  }, [intensity, parallaxStrength, numRunes, numGlyphs, numRunners, numLightShafts, numSpiralMatrix, numParticles, numWaveRings, numEnergyThreads, numCrestSpires, numCrestRays]);
  
  // Get motion state
  const motionState = useCelestialCrestMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return crestEngine.getMaterial();
  }, [crestEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return crestEngine.getGeometry();
  }, [crestEngine]);
  
  // Update uniforms
  useCelestialCrestUniforms(
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
    crestEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    crestEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    crestEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    crestEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    crestEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    crestEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-crest-v2', (motionState) => {
      // Celestial crest v2 state is already synced via useCelestialCrestMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-crest-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    crestEngine.setPosition(...position);
    crestEngine.setScale(scale);
  }, [position, scale, crestEngine]);
  
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

