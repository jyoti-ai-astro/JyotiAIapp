/**
 * Timeline Stream Component
 * 
 * Phase 2 — Section 23: COSMIC TIMELINE STREAM ENGINE
 * Timeline Stream Engine (E27)
 * 
 * React component for cosmic timeline stream
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { TimelineStreamEngine } from './timeline-stream-engine';
import { useTimelineMotion } from './hooks/use-timeline-motion';
import { useTimelineUniforms } from './hooks/use-timeline-uniforms';

export interface TimelineStreamProps {
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
  
  /** Number of particles (mobile fallback: 100) */
  numParticles?: number;
  
  /** Number of future lines */
  numLines?: number;
}

export const TimelineStream: React.FC<TimelineStreamProps> = ({
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
  position = [0, 0.8, -2.0],
  scale = 1.0,
  numParticles,
  numLines = 8,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback for particles
  const isMobile = size.width < 800;
  const finalNumParticles = numParticles || (isMobile ? 100 : 150);
  
  // Create timeline stream engine
  const timelineEngine = useMemo(() => {
    return new TimelineStreamEngine({
      intensity,
      mouse,
      parallaxStrength,
      numParticles: finalNumParticles,
      numLines,
    });
  }, [intensity, parallaxStrength, finalNumParticles, numLines]);
  
  // Get motion state
  const motionState = useTimelineMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return timelineEngine.getMaterial();
  }, [timelineEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return timelineEngine.getGeometry();
  }, [timelineEngine]);
  
  // Update uniforms
  useTimelineUniforms(
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
    timelineEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    timelineEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    timelineEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    timelineEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    timelineEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    timelineEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('timeline-stream', (motionState) => {
      // Timeline stream state is already synced via useTimelineMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('timeline-stream');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    timelineEngine.setPosition(...position);
    timelineEngine.setScale(scale);
  }, [position, scale, timelineEngine]);
  
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

