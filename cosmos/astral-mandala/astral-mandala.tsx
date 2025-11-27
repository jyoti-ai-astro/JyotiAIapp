/**
 * Astral Mandala Component
 * 
 * Phase 2 — Section 34: ASTRAL MANDALA ENGINE
 * Astral Mandala Engine (E38)
 * 
 * React component for astral mandala
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AstralMandalaEngine } from './astral-mandala-engine';
import { useAstralMandalaMotion } from './hooks/use-mandala-motion';
import { useAstralMandalaUniforms } from './hooks/use-mandala-uniforms';

export interface AstralMandalaProps {
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

export const AstralMandala: React.FC<AstralMandalaProps> = ({
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
  position = [0, 0.7, -3.6],
  scale = 1.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numRings = isMobile ? 3 : 4;
  const numGlyphs = isMobile ? 12 : 18;
  
  // Create astral mandala engine
  const mandalaEngine = useMemo(() => {
    return new AstralMandalaEngine({
      intensity,
      mouse,
      parallaxStrength,
      numRings,
      numGlyphs,
    });
  }, [intensity, parallaxStrength, numRings, numGlyphs]);
  
  // Get motion state
  const motionState = useAstralMandalaMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return mandalaEngine.getMaterial();
  }, [mandalaEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return mandalaEngine.getGeometry();
  }, [mandalaEngine]);
  
  // Update uniforms
  useAstralMandalaUniforms(
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
    mandalaEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    mandalaEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    mandalaEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    mandalaEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    mandalaEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    mandalaEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('astral-mandala', (motionState) => {
      // Astral mandala state is already synced via useAstralMandalaMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('astral-mandala');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    mandalaEngine.setPosition(...position);
    mandalaEngine.setScale(scale);
  }, [position, scale, mandalaEngine]);
  
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

