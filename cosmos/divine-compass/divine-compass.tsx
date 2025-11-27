/**
 * Divine Compass Component
 * 
 * Phase 2 — Section 27: DIVINE COMPASS ENGINE
 * Divine Compass Engine (E31)
 * 
 * React component for divine compass
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { DivineCompassEngine } from './divine-compass-engine';
import { useCompassMotion } from './hooks/use-compass-motion';
import { useCompassUniforms } from './hooks/use-compass-uniforms';

export interface DivineCompassProps {
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

export const DivineCompass: React.FC<DivineCompassProps> = ({
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
  position = [0, 1.6, -2.4],
  scale = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numStarPoints = isMobile ? 6 : 12;
  const includeGlyphs = !isMobile; // Mobile: arrow only, no direction glyph labels
  
  // Create divine compass engine
  const compassEngine = useMemo(() => {
    return new DivineCompassEngine({
      intensity,
      mouse,
      parallaxStrength,
      numStarPoints,
      includeGlyphs,
    });
  }, [intensity, parallaxStrength, numStarPoints, includeGlyphs]);
  
  // Get motion state
  const motionState = useCompassMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return compassEngine.getMaterial();
  }, [compassEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return compassEngine.getGeometry();
  }, [compassEngine]);
  
  // Update uniforms
  useCompassUniforms(
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
    compassEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    compassEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    compassEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    compassEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    compassEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    compassEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('divine-compass', (motionState) => {
      // Divine compass state is already synced via useCompassMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('divine-compass');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    compassEngine.setPosition(...position);
    compassEngine.setScale(scale);
  }, [position, scale, compassEngine]);
  
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

