/**
 * Aura Shield Component
 * 
 * Phase 2 — Section 19: AURA SHIELD ENGINE
 * Aura Shield Engine (E23)
 * 
 * React component for aura shield defensive geometry
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AuraShieldEngine } from './aura-shield-engine';
import { useAuraShieldMotion } from './hooks/use-aura-shield-motion';
import { useAuraShieldUniforms } from './hooks/use-aura-shield-uniforms';

export interface AuraShieldProps {
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

export const AuraShield: React.FC<AuraShieldProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  breathPhase = 0,
  breathStrength = 0,
  parallaxStrength = 1.0,
  position = [0, 0, -1.8],
  scale = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Create aura shield engine
  const auraShieldEngine = useMemo(() => {
    return new AuraShieldEngine({
      intensity,
      mouse,
      parallaxStrength,
    });
  }, [intensity, parallaxStrength]);
  
  // Get motion state
  const motionState = useAuraShieldMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return auraShieldEngine.getMaterial();
  }, [auraShieldEngine]);
  
  // Update uniforms
  useAuraShieldUniforms(
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
    const segments = isMobile ? 64 : 128;
    return new THREE.SphereGeometry(1.2, segments, segments);
  }, [size.width]);
  
  // Update engine
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    auraShieldEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    auraShieldEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    auraShieldEngine.setBlessingWave(blessingWaveProgress);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('aura-shield', (motionState) => {
      // Aura shield state is already synced via useAuraShieldMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('aura-shield');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    auraShieldEngine.setPosition(...position);
    auraShieldEngine.setScale(scale);
  }, [position, scale, auraShieldEngine]);
  
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

