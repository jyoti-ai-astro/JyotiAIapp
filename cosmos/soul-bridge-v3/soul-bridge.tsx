/**
 * Soul Bridge v3 Component
 * 
 * Phase 2 — Section 58: SOUL BRIDGE ENGINE v3
 * Soul Bridge Engine v3 (E62)
 * 
 * React component for soul bridge v3
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { SoulBridgeEngine } from './soul-bridge-engine';
import { useSoulBridgeMotion } from './hooks/use-soul-bridge-motion';
import { useSoulBridgeUniforms } from './hooks/use-soul-bridge-uniforms';

export interface SoulBridgeV3Props {
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

export const SoulBridgeV3: React.FC<SoulBridgeV3Props> = ({
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
  position = [0, -0.4, -18.0],
  scale = 7.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numSoulLights = isMobile ? 60 : 90;
  const numSpiralRunners = isMobile ? 8 : 12;
  const numAstralThreads = isMobile ? 12 : 24;
  const numSoulWaves = isMobile ? 6 : 10;
  const numBridgeGlyphs = isMobile ? 48 : 64;
  const numEnergyParticles = isMobile ? 200 : 350;
  const numLightBeams = isMobile ? 6 : 12;
  
  // Create soul bridge engine
  const bridgeEngine = useMemo(() => {
    return new SoulBridgeEngine({
      intensity,
      mouse,
      parallaxStrength,
      numSoulLights,
      numSpiralRunners,
      numAstralThreads,
      numSoulWaves,
      numBridgeGlyphs,
      numEnergyParticles,
      numLightBeams,
    });
  }, [intensity, parallaxStrength, numSoulLights, numSpiralRunners, numAstralThreads, numSoulWaves, numBridgeGlyphs, numEnergyParticles, numLightBeams]);
  
  // Get motion state
  const motionState = useSoulBridgeMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return bridgeEngine.getMaterial();
  }, [bridgeEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return bridgeEngine.getGeometry();
  }, [bridgeEngine]);
  
  // Update uniforms
  useSoulBridgeUniforms(
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
    bridgeEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    bridgeEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    bridgeEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    bridgeEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    bridgeEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    bridgeEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('soul-bridge-v3', (motionState) => {
      // Soul bridge v3 state is already synced via useSoulBridgeMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('soul-bridge-v3');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    bridgeEngine.setPosition(...position);
    bridgeEngine.setScale(scale);
  }, [position, scale, bridgeEngine]);
  
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

