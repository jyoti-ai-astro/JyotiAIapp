/**
 * Celestial Gate v2 Component
 * 
 * Phase 2 — Section 62: CELESTIAL GATE ENGINE v2
 * Celestial Gate Engine v2 (E66)
 * 
 * React component for celestial gate v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialGateEngine } from './celestial-gate-engine';
import { useCelestialGateMotion } from './hooks/use-celestial-gate-motion';
import { useCelestialGateUniforms } from './hooks/use-celestial-gate-uniforms';

export interface CelestialGateV2Props {
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

export const CelestialGateV2: React.FC<CelestialGateV2Props> = ({
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
  position = [0, -1.4, -30.0],
  scale = 9.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numSpiralRibbons = isMobile ? 3 : 5;
  const numStarGlyphs = isMobile ? 72 : 108;
  const numAscensionRings = 3; // Keep same
  const numOrbitalRunners = isMobile ? 6 : 12;
  const numCrossThreads = isMobile ? 24 : 40;
  const numLightShafts = isMobile ? 8 : 14;
  const numStarDust = isMobile ? 120 : 200;
  const numStarfallRays = isMobile ? 12 : 20;
  const numSignatureSymbols = isMobile ? 12 : 20;
  const numEnergyThreads = isMobile ? 20 : 40;
  const numParticles = isMobile ? 200 : 350;
  
  // Create celestial gate engine
  const gateEngine = useMemo(() => {
    return new CelestialGateEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSpiralRibbons,
      numStarGlyphs,
      numAscensionRings,
      numOrbitalRunners,
      numCrossThreads,
      numLightShafts,
      numStarDust,
      numStarfallRays,
      numSignatureSymbols,
      numEnergyThreads,
      numParticles,
    });
  }, [intensity, parallaxStrength, numSpiralRibbons, numStarGlyphs, numAscensionRings, numOrbitalRunners, numCrossThreads, numLightShafts, numStarDust, numStarfallRays, numSignatureSymbols, numEnergyThreads, numParticles]);
  
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
    motionOrchestrator.registerEngine('celestial-gate-v2', (motionState) => {
      // Celestial gate v2 state is already synced via useCelestialGateMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-gate-v2');
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

