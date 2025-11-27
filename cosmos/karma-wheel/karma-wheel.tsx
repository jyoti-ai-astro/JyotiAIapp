/**
 * Karma Wheel Component
 * 
 * Phase 2 — Section 36: KARMA WHEEL ENGINE
 * Karma Wheel Engine (E40)
 * 
 * React component for karma wheel
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { KarmaWheelEngine } from './karma-wheel-engine';
import { useKarmaWheelMotion } from './hooks/use-karma-motion';
import { useKarmaWheelUniforms } from './hooks/use-karma-uniforms';

export interface KarmaWheelProps {
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

export const KarmaWheel: React.FC<KarmaWheelProps> = ({
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
  position = [0, 0.0, -4.2],
  scale = 1.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const ringSegments = isMobile ? 28 : 40;
  const numGlyphs = isMobile ? 10 : 16;
  
  // Create karma wheel engine
  const wheelEngine = useMemo(() => {
    return new KarmaWheelEngine({
      intensity,
      mouse,
      parallaxStrength,
      ringSegments,
      numGlyphs,
    });
  }, [intensity, parallaxStrength, ringSegments, numGlyphs]);
  
  // Get motion state
  const motionState = useKarmaWheelMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return wheelEngine.getMaterial();
  }, [wheelEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return wheelEngine.getGeometry();
  }, [wheelEngine]);
  
  // Update uniforms
  useKarmaWheelUniforms(
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
    wheelEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    wheelEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    wheelEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    wheelEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    wheelEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    wheelEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('karma-wheel', (motionState) => {
      // Karma wheel state is already synced via useKarmaWheelMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('karma-wheel');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    wheelEngine.setPosition(...position);
    wheelEngine.setScale(scale);
  }, [position, scale, wheelEngine]);
  
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

