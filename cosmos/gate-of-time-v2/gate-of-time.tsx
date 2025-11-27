/**
 * Gate of Time v2 Component
 * 
 * Phase 2 — Section 57: GATE OF TIME ENGINE v2
 * Gate of Time Engine v2 (E61)
 * 
 * React component for gate of time v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { GateOfTimeEngine } from './gate-of-time-engine';
import { useGateOfTimeMotion } from './hooks/use-gate-of-time-motion';
import { useGateOfTimeUniforms } from './hooks/use-gate-of-time-uniforms';

export interface GateOfTimeV2Props {
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

export const GateOfTimeV2: React.FC<GateOfTimeV2Props> = ({
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
  position = [0, -0.3, -15.2],
  scale = 6.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numGlyphs = isMobile ? 60 : 100;
  const numTimeStreams = isMobile ? 8 : 16;
  const numRippleWaves = isMobile ? 8 : 12;
  const numTemporalThreads = isMobile ? 6 : 12;
  const numParticles = isMobile ? 300 : 450;
  
  // Create gate of time engine
  const gateEngine = useMemo(() => {
    return new GateOfTimeEngine({
      intensity,
      mouse,
      parallaxStrength,
      numGlyphs,
      numTimeStreams,
      numRippleWaves,
      numTemporalThreads,
      numParticles,
    });
  }, [intensity, parallaxStrength, numGlyphs, numTimeStreams, numRippleWaves, numTemporalThreads, numParticles]);
  
  // Get motion state
  const motionState = useGateOfTimeMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return gateEngine.getMaterial();
  }, [gateEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return gateEngine.getGeometry();
  }, [gateEngine]);
  
  // Update uniforms
  useGateOfTimeUniforms(
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
    gateEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    gateEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    gateEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    gateEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    gateEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    gateEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('gate-of-time-v2', (motionState) => {
      // Gate of time v2 state is already synced via useGateOfTimeMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('gate-of-time-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    gateEngine.setPosition(...position);
    gateEngine.setScale(scale);
  }, [position, scale, gateEngine]);
  
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

