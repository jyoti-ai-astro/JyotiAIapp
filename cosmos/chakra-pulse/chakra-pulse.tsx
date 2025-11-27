/**
 * Chakra Pulse Component
 * 
 * Phase 2 — Section 35: CHAKRA PULSE ENGINE
 * Chakra Pulse Engine (E39)
 * 
 * React component for chakra pulse
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { ChakraPulseEngine } from './chakra-pulse-engine';
import { useChakraPulseMotion } from './hooks/use-chakra-motion';
import { useChakraPulseUniforms } from './hooks/use-chakra-uniforms';

export interface ChakraPulseProps {
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

export const ChakraPulse: React.FC<ChakraPulseProps> = ({
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
  position = [0, 0.0, -3.9],
  scale = 1.4,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback: same 7 chakras but lower particle counts (handled in engine)
  const isMobile = size.width < 800;
  
  // Create chakra pulse engine
  const pulseEngine = useMemo(() => {
    return new ChakraPulseEngine({
      intensity,
      mouse,
      parallaxStrength,
    });
  }, [intensity, parallaxStrength]);
  
  // Get motion state
  const motionState = useChakraPulseMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return pulseEngine.getMaterial();
  }, [pulseEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return pulseEngine.getGeometry();
  }, [pulseEngine]);
  
  // Update uniforms
  useChakraPulseUniforms(
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
    pulseEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    pulseEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    pulseEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    pulseEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    pulseEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    pulseEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('chakra-pulse', (motionState) => {
      // Chakra pulse state is already synced via useChakraPulseMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('chakra-pulse');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    pulseEngine.setPosition(...position);
    pulseEngine.setScale(scale);
  }, [position, scale, pulseEngine]);
  
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

