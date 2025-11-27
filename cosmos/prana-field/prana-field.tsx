/**
 * Prana Field Component
 * 
 * Phase 2 — Section 18: PRANA FIELD ENGINE
 * Prana Field Engine (E22)
 * 
 * React component for prana field aura
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { PranaEngine } from './prana-engine';
import { usePranaMotion } from './hooks/use-prana-motion';
import { usePranaUniforms } from './hooks/use-prana-uniforms';

export interface PranaFieldProps {
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
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Position */
  position?: [number, number, number];
  
  /** Scale */
  scale?: number;
}

export const PranaField: React.FC<PranaFieldProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  breathPhase = 0,
  breathStrength = 0,
  parallaxStrength = 1.0,
  position = [0, 0, -1.8],
  scale = 1.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Create prana engine
  const pranaEngine = useMemo(() => {
    return new PranaEngine({
      intensity,
      mouse,
      parallaxStrength,
    });
  }, [intensity, parallaxStrength]);
  
  // Get motion state
  const motionState = usePranaMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return pranaEngine.getMaterial();
  }, [pranaEngine]);
  
  // Update uniforms
  usePranaUniforms(
    material,
    motionState,
    breathPhase,
    breathStrength,
    blessingWaveProgress,
    mouse,
    intensity,
    parallaxStrength
  );
  
  // Get geometry
  const geometry = useMemo(() => {
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    return new THREE.PlaneGeometry(4.0, 4.0, segments, segments);
  }, [size.width]);
  
  // Update engine
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    pranaEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      blessingWaveProgress,
      deltaTime
    );
    
    // Update breath data
    pranaEngine.setBreathPhase(breathPhase);
    pranaEngine.setBreathStrength(breathStrength);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('prana-field', (motionState) => {
      // Prana state is already synced via usePranaMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('prana-field');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.x = -Math.PI / 2; // Face upward
    }
    pranaEngine.setPosition(...position);
    pranaEngine.setScale(scale);
  }, [position, scale, pranaEngine]);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      scale={scale}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
};

