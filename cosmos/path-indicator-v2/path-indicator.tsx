/**
 * Path Indicator v2 Component
 * 
 * Phase 2 — Section 53: PATH INDICATOR ENGINE v2
 * Path Indicator Engine v2 (E57)
 * 
 * React component for path indicator v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { PathIndicatorEngine } from './path-indicator-engine';
import { usePathIndicatorMotion } from './hooks/use-path-indicator-motion';
import { usePathIndicatorUniforms } from './hooks/use-path-indicator-uniforms';

export interface PathIndicatorV2Props {
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

export const PathIndicatorV2: React.FC<PathIndicatorV2Props> = ({
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
  position = [0, -0.2, -10.0],
  scale = 4.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const numNodes = isMobile ? 20 : 30;
  const numPulses = isMobile ? 3 : 5;
  
  // Create path indicator engine
  const pathEngine = useMemo(() => {
    return new PathIndicatorEngine({
      intensity,
      mouse,
      parallaxStrength,
      numNodes,
      numPulses,
    });
  }, [intensity, parallaxStrength, numNodes, numPulses]);
  
  // Get motion state
  const motionState = usePathIndicatorMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return pathEngine.getMaterial();
  }, [pathEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return pathEngine.getGeometry();
  }, [pathEngine]);
  
  // Update uniforms
  usePathIndicatorUniforms(
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
    
    // Update rotation sync
    pathEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    pathEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('path-indicator-v2', (motionState) => {
      // Path indicator v2 state is already synced via usePathIndicatorMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('path-indicator-v2');
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

