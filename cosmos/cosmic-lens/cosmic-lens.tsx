/**
 * Cosmic Lens Component
 * 
 * Phase 2 — Section 49: COSMIC LENS ENGINE
 * Cosmic Lens Engine (E53)
 * 
 * React component for cosmic lens
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CosmicLensEngine } from './cosmic-lens-engine';
import { useCosmicLensMotion } from './hooks/use-cosmic-lens-motion';
import { useCosmicLensUniforms } from './hooks/use-cosmic-lens-uniforms';

export interface CosmicLensProps {
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

export const CosmicLens: React.FC<CosmicLensProps> = ({
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
  position = [0, 0.2, -7.5],
  scale = 3.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numPhotons = isMobile ? 150 : 260;
  
  // Create cosmic lens engine
  const lensEngine = useMemo(() => {
    return new CosmicLensEngine({
      intensity,
      mouse,
      parallaxStrength,
      numPhotons,
    });
  }, [intensity, parallaxStrength, numPhotons]);
  
  // Get motion state
  const motionState = useCosmicLensMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return lensEngine.getMaterial();
  }, [lensEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return lensEngine.getGeometry();
  }, [lensEngine]);
  
  // Update uniforms
  useCosmicLensUniforms(
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
    lensEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    lensEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    lensEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    lensEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    lensEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    lensEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('cosmic-lens', (motionState) => {
      // Cosmic lens state is already synced via useCosmicLensMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('cosmic-lens');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    lensEngine.setPosition(...position);
    lensEngine.setScale(scale);
  }, [position, scale, lensEngine]);
  
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

