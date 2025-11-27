/**
 * Astral Gate v3 Component
 * 
 * Phase 2 — Section 59: ASTRAL GATE ENGINE v3
 * Astral Gate Engine v3 (E63)
 * 
 * React component for astral gate v3
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralGateEngine } from './astral-gate-engine';
import { useAstralGateMotion } from './hooks/use-astral-gate-motion';
import { useAstralGateUniforms } from './hooks/use-astral-gate-uniforms';

export interface AstralGateV3Props {
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

export const AstralGateV3: React.FC<AstralGateV3Props> = ({
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
  position = [0, -0.6, -21.2],
  scale = 7.8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numHaloGlyphs = isMobile ? 72 : 96;
  const numAscensionPillars = isMobile ? 6 : 12;
  const numEnergyRunners = isMobile ? 6 : 12;
  const numCrossSoulThreads = isMobile ? 24 : 40;
  const numAstralWaves = isMobile ? 4 : 8;
  const numAscensionStairs = isMobile ? 20 : 30;
  const numLightBeams = isMobile ? 6 : 10;
  const numAstralDust = isMobile ? 200 : 300;
  
  // Create astral gate engine
  const gateEngine = useMemo(() => {
    return new AstralGateEngine({
      intensity,
      mouse,
      parallaxStrength,
      numHaloGlyphs,
      numAscensionPillars,
      numEnergyRunners,
      numCrossSoulThreads,
      numAstralWaves,
      numAscensionStairs,
      numLightBeams,
      numAstralDust,
    });
  }, [intensity, parallaxStrength, numHaloGlyphs, numAscensionPillars, numEnergyRunners, numCrossSoulThreads, numAstralWaves, numAscensionStairs, numLightBeams, numAstralDust]);
  
  // Get motion state
  const motionState = useAstralGateMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return gateEngine.getMaterial();
  }, [gateEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return gateEngine.getGeometry();
  }, [gateEngine]);
  
  // Update uniforms
  useAstralGateUniforms(
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
    motionOrchestrator.registerEngine('astral-gate-v3', (motionState) => {
      // Astral gate v3 state is already synced via useAstralGateMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-gate-v3');
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

