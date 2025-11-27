/**
 * Aurora Veil Component
 * 
 * Phase 2 — Section 44: AURORA VEIL ENGINE
 * Aurora Veil Engine (E48)
 * 
 * React component for aurora veil
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AuroraVeilEngine } from './aurora-veil-engine';
import { useAuroraVeilMotion } from './hooks/use-aurora-motion';
import { useAuroraVeilUniforms } from './hooks/use-aurora-uniforms';

export interface AuroraVeilProps {
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

export const AuroraVeil: React.FC<AuroraVeilProps> = ({
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
  position = [0, 0.4, -6.2],
  scale = 2.3,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numDustParticles = isMobile ? 80 : 160;
  
  // Create aurora veil engine
  const auroraEngine = useMemo(() => {
    return new AuroraVeilEngine({
      intensity,
      mouse,
      parallaxStrength,
      numDustParticles,
    });
  }, [intensity, parallaxStrength, numDustParticles]);
  
  // Get motion state
  const motionState = useAuroraVeilMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return auroraEngine.getMaterial();
  }, [auroraEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return auroraEngine.getGeometry();
  }, [auroraEngine]);
  
  // Update uniforms
  useAuroraVeilUniforms(
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
    auroraEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    auroraEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    auroraEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    auroraEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    auroraEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    auroraEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('aurora-veil', (motionState) => {
      // Aurora veil state is already synced via useAuroraVeilMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('aurora-veil');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    auroraEngine.setPosition(...position);
    auroraEngine.setScale(scale);
  }, [position, scale, auroraEngine]);
  
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

