/**
 * Memory Stream Component
 * 
 * Phase 2 — Section 21: COSMIC MEMORY STREAM ENGINE
 * Memory Stream Engine (E25)
 * 
 * React component for cosmic memory stream
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { MemoryStreamEngine } from './memory-stream-engine';
import { useMemoryStreamMotion } from './hooks/use-memory-stream-motion';
import { useMemoryStreamUniforms } from './hooks/use-memory-stream-uniforms';

export interface MemoryStreamProps {
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
  
  /** Number of particles (mobile fallback: 150) */
  numParticles?: number;
  
  /** Number of ribbons */
  numRibbons?: number;
  
  /** Number of glyphs */
  numGlyphs?: number;
}

export const MemoryStream: React.FC<MemoryStreamProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  breathPhase = 0,
  breathStrength = 0,
  parallaxStrength = 1.0,
  position = [0, 1.2, -1.8],
  scale = 1.0,
  numParticles,
  numRibbons = 4,
  numGlyphs = 8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback for particles
  const isMobile = size.width < 800;
  const finalNumParticles = numParticles || (isMobile ? 150 : 250);
  
  // Create memory stream engine
  const memoryEngine = useMemo(() => {
    return new MemoryStreamEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles: finalNumParticles,
      numRibbons,
      numGlyphs,
    });
  }, [intensity, parallaxStrength, finalNumParticles, numRibbons, numGlyphs]);
  
  // Get motion state
  const motionState = useMemoryStreamMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return memoryEngine.getMaterial();
  }, [memoryEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return memoryEngine.getGeometry();
  }, [memoryEngine]);
  
  // Update uniforms
  useMemoryStreamUniforms(
    material,
    motionState,
    breathPhase,
    breathStrength,
    blessingWaveProgress,
    mouse,
    intensity,
    parallaxStrength
  );
  
  // Update engine
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    memoryEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    memoryEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    memoryEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    memoryEngine.setScroll(motionState.scrollProgress);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('memory-stream', (motionState) => {
      // Memory stream state is already synced via useMemoryStreamMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('memory-stream');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    memoryEngine.setPosition(...position);
    memoryEngine.setScale(scale);
  }, [position, scale, memoryEngine]);
  
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

