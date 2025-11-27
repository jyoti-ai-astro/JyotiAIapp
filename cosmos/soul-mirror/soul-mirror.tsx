/**
 * Soul Mirror Component
 * 
 * Phase 2 — Section 26: SOUL MIRROR ENGINE
 * Soul Mirror Engine (E30)
 * 
 * React component for soul mirror
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { SoulMirrorEngine } from './soul-mirror-engine';
import { useSoulMirrorMotion } from './hooks/use-soul-mirror-motion';
import { useSoulMirrorUniforms } from './hooks/use-soul-mirror-uniforms';

export interface SoulMirrorProps {
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
  
  /** Number of echo rings (mobile fallback: 2) */
  numEchoRings?: number;
  
  /** Number of glyphs (mobile fallback: 6) */
  numGlyphs?: number;
}

export const SoulMirror: React.FC<SoulMirrorProps> = ({
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
  position = [0, 1.2, -2.2],
  scale = 1.2,
  numEchoRings,
  numGlyphs,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback
  const isMobile = size.width < 800;
  const finalNumEchoRings = numEchoRings || (isMobile ? 2 : 4);
  const finalNumGlyphs = numGlyphs || (isMobile ? 6 : 9);
  
  // Create soul mirror engine
  const soulEngine = useMemo(() => {
    return new SoulMirrorEngine({
      intensity,
      mouse,
      parallaxStrength,
      numEchoRings: finalNumEchoRings,
      numGlyphs: finalNumGlyphs,
    });
  }, [intensity, parallaxStrength, finalNumEchoRings, finalNumGlyphs]);
  
  // Get motion state
  const motionState = useSoulMirrorMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return soulEngine.getMaterial();
  }, [soulEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return soulEngine.getGeometry();
  }, [soulEngine]);
  
  // Update uniforms
  useSoulMirrorUniforms(
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
    soulEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    soulEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    soulEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    soulEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    soulEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    soulEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('soul-mirror', (motionState) => {
      // Soul mirror state is already synced via useSoulMirrorMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('soul-mirror');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    soulEngine.setPosition(...position);
    soulEngine.setScale(scale);
  }, [position, scale, soulEngine]);
  
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

