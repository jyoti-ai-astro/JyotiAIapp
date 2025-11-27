/**
 * Celestial Temple v2 Component
 * 
 * Phase 2 — Section 63: CELESTIAL TEMPLE ENGINE v2
 * Celestial Temple Engine v2 (E67)
 * 
 * React component for celestial temple v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialTempleEngine } from './celestial-temple-engine';
import { useCelestialTempleMotion } from './hooks/use-celestial-temple-motion';
import { useCelestialTempleUniforms } from './hooks/use-celestial-temple-uniforms';

export interface CelestialTempleV2Props {
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

export const CelestialTempleV2: React.FC<CelestialTempleV2Props> = ({
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
  position = [0, -1.6, -33.2],
  scale = 11.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction (6 pillars, 60 glyphs, 12 columns, 150 particles)
  const isMobile = size.width < 800;
  const numGatePillars = isMobile ? 6 : 12;
  const numGlyphs = isMobile ? 60 : 120;
  const numAscensionColumns = isMobile ? 6 : 10;
  const numCrossBridges = isMobile ? 20 : 40;
  const numOrbitalRunners = isMobile ? 2 : 4;
  const numLightShafts = isMobile ? 8 : 12;
  const numEnergySpirals = isMobile ? 8 : 16;
  const numParticles = isMobile ? 150 : 400;
  const numAscensionRays = isMobile ? 12 : 20;
  const numSignatureSymbols = isMobile ? 12 : 20;
  const numStairRunners = isMobile ? 6 : 12;
  
  // Create celestial temple engine
  const templeEngine = useMemo(() => {
    return new CelestialTempleEngine({
      intensity,
      mouse,
      parallaxStrength,
      numGatePillars,
      numGlyphs,
      numAscensionColumns,
      numCrossBridges,
      numOrbitalRunners,
      numLightShafts,
      numEnergySpirals,
      numParticles,
      numAscensionRays,
      numSignatureSymbols,
      numStairRunners,
    });
  }, [intensity, parallaxStrength, numGatePillars, numGlyphs, numAscensionColumns, numCrossBridges, numOrbitalRunners, numLightShafts, numEnergySpirals, numParticles, numAscensionRays, numSignatureSymbols, numStairRunners]);
  
  // Get motion state
  const motionState = useCelestialTempleMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return templeEngine.getMaterial();
  }, [templeEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return templeEngine.getGeometry();
  }, [templeEngine]);
  
  // Update uniforms
  useCelestialTempleUniforms(
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
    templeEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    templeEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    templeEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    templeEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    templeEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    templeEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-temple-v2', (motionState) => {
      // Celestial temple v2 state is already synced via useCelestialTempleMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-temple-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    templeEngine.setPosition(...position);
    templeEngine.setScale(scale);
  }, [position, scale, templeEngine]);
  
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

