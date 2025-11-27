/**
 * Astral Veil Component
 * 
 * Phase 2 — Section 29: ASTRAL VEIL ENGINE
 * Astral Veil Engine (E33)
 * 
 * React component for astral veil
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralVeilEngine } from './astral-veil-engine';
import { useAstralVeilMotion } from './hooks/use-veil-motion';
import { useAstralVeilUniforms } from './hooks/use-veil-uniforms';

export interface AstralVeilProps {
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

export const AstralVeil: React.FC<AstralVeilProps> = ({
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
  position = [0, 0.6, -2.2],
  scale = 1.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const frontVeilSegments = isMobile ? 32 : 48;
  const rearVeilSegments = isMobile ? 24 : 32;
  const numMistParticles = isMobile ? 80 : 120;
  
  // Create astral veil engine
  const veilEngine = useMemo(() => {
    return new AstralVeilEngine({
      intensity,
      mouse,
      parallaxStrength,
      frontVeilSegments,
      rearVeilSegments,
      numMistParticles,
    });
  }, [intensity, parallaxStrength, frontVeilSegments, rearVeilSegments, numMistParticles]);
  
  // Get motion state
  const motionState = useAstralVeilMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return veilEngine.getMaterial();
  }, [veilEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return veilEngine.getGeometry();
  }, [veilEngine]);
  
  // Update uniforms
  useAstralVeilUniforms(
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
    veilEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    veilEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    veilEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    veilEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    veilEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    veilEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('astral-veil', (motionState) => {
      // Astral veil state is already synced via useAstralVeilMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-veil');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    veilEngine.setPosition(...position);
    veilEngine.setScale(scale);
  }, [position, scale, veilEngine]);
  
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

