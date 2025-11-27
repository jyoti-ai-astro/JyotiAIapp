/**
 * Celestial Ribbon Component
 * 
 * Phase 2 — Section 38: CELESTIAL RIBBON ENGINE
 * Celestial Ribbon Engine (E42)
 * 
 * React component for celestial ribbon
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CelestialRibbonEngine } from './celestial-ribbon-engine';
import { useCelestialRibbonMotion } from './hooks/use-ribbon-motion';
import { useCelestialRibbonUniforms } from './hooks/use-ribbon-uniforms';

export interface CelestialRibbonProps {
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

export const CelestialRibbon: React.FC<CelestialRibbonProps> = ({
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
  position = [0, 0.0, -5.0],
  scale = 1.7,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numRibbons = isMobile ? 3 : 4;
  const numParticles = isMobile ? 30 : 60;
  const pointsPerRibbon = isMobile ? 20 : 24;
  
  // Create celestial ribbon engine
  const ribbonEngine = useMemo(() => {
    return new CelestialRibbonEngine({
      intensity,
      mouse,
      parallaxStrength,
      numRibbons,
      numParticles,
      pointsPerRibbon,
    });
  }, [intensity, parallaxStrength, numRibbons, numParticles, pointsPerRibbon]);
  
  // Get motion state
  const motionState = useCelestialRibbonMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return ribbonEngine.getMaterial();
  }, [ribbonEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return ribbonEngine.getGeometry();
  }, [ribbonEngine]);
  
  // Update uniforms
  useCelestialRibbonUniforms(
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
    ribbonEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    ribbonEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    ribbonEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    ribbonEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    ribbonEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    ribbonEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('celestial-ribbon', (motionState) => {
      // Celestial ribbon state is already synced via useCelestialRibbonMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('celestial-ribbon');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    ribbonEngine.setPosition(...position);
    ribbonEngine.setScale(scale);
  }, [position, scale, ribbonEngine]);
  
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

