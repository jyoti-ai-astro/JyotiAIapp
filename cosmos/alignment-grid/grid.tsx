/**
 * Alignment Grid Component
 * 
 * Phase 2 — Section 22: COSMIC ALIGNMENT GRID ENGINE
 * Alignment Grid Engine (E26)
 * 
 * React component for cosmic alignment grid
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AlignmentGridEngine } from './grid-engine';
import { useGridMotion } from './hooks/use-grid-motion';
import { useGridUniforms } from './hooks/use-grid-uniforms';

export interface AlignmentGridProps {
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
  
  /** Grid rotation (from Projection E17) */
  gridRotation?: number;
  
  /** Camera FOV (from CameraController E18) */
  cameraFOV?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Position */
  position?: [number, number, number];
  
  /** Scale */
  scale?: number;
}

export const AlignmentGrid: React.FC<AlignmentGridProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  breathPhase = 0,
  breathStrength = 0,
  gridRotation = 0,
  cameraFOV = 75.0,
  parallaxStrength = 1.0,
  position = [0, 0, -5],
  scale = 3.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback for subdivisions
  const isMobile = size.width < 800;
  const segments = isMobile ? 64 : 128;
  
  // Create alignment grid engine
  const gridEngine = useMemo(() => {
    return new AlignmentGridEngine({
      intensity,
      mouse,
      parallaxStrength,
      subdivisions: segments,
    });
  }, [intensity, parallaxStrength, segments]);
  
  // Get motion state
  const motionState = useGridMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return gridEngine.getMaterial();
  }, [gridEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return gridEngine.getGeometry();
  }, [gridEngine]);
  
  // Update uniforms
  useGridUniforms(
    material,
    motionState,
    breathPhase,
    breathStrength,
    blessingWaveProgress,
    mouse,
    intensity,
    parallaxStrength,
    gridRotation,
    cameraFOV
  );
  
  // Update engine
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    gridEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    gridEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    gridEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    gridEngine.setScroll(motionState.scrollProgress);
    
    // Update grid rotation
    gridEngine.setGridRotation(gridRotation);
    
    // Update camera FOV
    gridEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('alignment-grid', (motionState) => {
      // Grid state is already synced via useGridMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('alignment-grid');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.x = -Math.PI / 2; // Face upward
    }
    gridEngine.setPosition(...position);
    gridEngine.setScale(scale);
  }, [position, scale, gridEngine]);
  
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

