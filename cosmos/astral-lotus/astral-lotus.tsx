/**
 * Astral Lotus Component
 * 
 * Phase 2 — Section 33: ASTRAL LOTUS ENGINE
 * Astral Lotus Engine (E37)
 * 
 * React component for astral lotus
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralLotusEngine } from './astral-lotus-engine';
import { useAstralLotusMotion } from './hooks/use-lotus-motion';
import { useAstralLotusUniforms } from './hooks/use-lotus-uniforms';

export interface AstralLotusProps {
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

export const AstralLotus: React.FC<AstralLotusProps> = ({
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
  position = [0, 0.9, -3.3],
  scale = 1.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numOuterPetals = isMobile ? 10 : 18;
  const numInnerPetals = isMobile ? 6 : 9;
  
  // Create astral lotus engine
  const lotusEngine = useMemo(() => {
    return new AstralLotusEngine({
      intensity,
      mouse,
      parallaxStrength,
      numOuterPetals,
      numInnerPetals,
    });
  }, [intensity, parallaxStrength, numOuterPetals, numInnerPetals]);
  
  // Get motion state
  const motionState = useAstralLotusMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return lotusEngine.getMaterial();
  }, [lotusEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return lotusEngine.getGeometry();
  }, [lotusEngine]);
  
  // Update uniforms
  useAstralLotusUniforms(
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
    lotusEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    lotusEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    lotusEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    lotusEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    lotusEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    lotusEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('astral-lotus', (motionState) => {
      // Astral lotus state is already synced via useAstralLotusMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-lotus');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    lotusEngine.setPosition(...position);
    lotusEngine.setScale(scale);
  }, [position, scale, lotusEngine]);
  
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

