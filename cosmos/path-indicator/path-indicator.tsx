/**
 * Path Indicator Component
 * 
 * Phase 2 — Section 20: DIVINE PATH INDICATOR ENGINE
 * Path Indicator Engine (E24)
 * 
 * React component for divine path indicator
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { PathIndicatorEngine } from './path-indicator-engine';
import { usePathMotion } from './hooks/use-path-motion';
import { usePathUniforms } from './hooks/use-path-uniforms';

export interface PathIndicatorProps {
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
  
  /** Path rotation (mandala-alignment from Projection E17) */
  pathRotation?: number;
  
  /** Position */
  position?: [number, number, number];
  
  /** Scale */
  scale?: number;
  
  /** Number of beads */
  numBeads?: number;
}

export const PathIndicator: React.FC<PathIndicatorProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  breathPhase = 0,
  breathStrength = 0,
  parallaxStrength = 1.0,
  pathRotation = 0,
  position = [0, -1.0, -1.8],
  scale = 1.0,
  numBeads = 20,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Create path indicator engine
  const pathEngine = useMemo(() => {
    return new PathIndicatorEngine({
      intensity,
      mouse,
      parallaxStrength,
      numBeads,
    });
  }, [intensity, parallaxStrength, numBeads]);
  
  // Get motion state
  const motionState = usePathMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return pathEngine.getMaterial();
  }, [pathEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return pathEngine.getMesh().geometry;
  }, [pathEngine]);
  
  // Update uniforms
  usePathUniforms(
    material,
    motionState,
    breathPhase,
    breathStrength,
    blessingWaveProgress,
    mouse,
    intensity,
    parallaxStrength,
    pathRotation
  );
  
  // Update engine
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    pathEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    pathEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    pathEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    pathEngine.setScroll(motionState.scrollProgress);
    
    // Update path rotation (mandala-alignment)
    pathEngine.setPathRotation(pathRotation);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('path-indicator', (motionState) => {
      // Path indicator state is already synced via usePathMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('path-indicator');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    pathEngine.setPosition(...position);
    pathEngine.setScale(scale);
  }, [position, scale, pathEngine]);
  
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

