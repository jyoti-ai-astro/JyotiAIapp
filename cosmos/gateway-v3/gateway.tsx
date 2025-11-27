/**
 * Gateway v3 Component
 * 
 * Phase 2 — Section 56: GATEWAY ENGINE v3
 * Gateway Engine v3 (E60)
 * 
 * React component for gateway v3
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { GatewayEngine } from './gateway-engine';
import { useGatewayMotion } from './hooks/use-gateway-motion';
import { useGatewayUniforms } from './hooks/use-gateway-uniforms';

export interface GatewayV3Props {
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

export const GatewayV3: React.FC<GatewayV3Props> = ({
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
  position = [0, -0.2, -13.4],
  scale = 5.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numGlyphs = isMobile ? 48 : 72;
  const numSpiralThreads = isMobile ? 6 : 12;
  const numRays = isMobile ? 20 : 40;
  const numParticles = isMobile ? 200 : 320;
  
  // Create gateway engine
  const gatewayEngine = useMemo(() => {
    return new GatewayEngine({
      intensity,
      mouse,
      parallaxStrength,
      numGlyphs,
      numSpiralThreads,
      numRays,
      numParticles,
    });
  }, [intensity, parallaxStrength, numGlyphs, numSpiralThreads, numRays, numParticles]);
  
  // Get motion state
  const motionState = useGatewayMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return gatewayEngine.getMaterial();
  }, [gatewayEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return gatewayEngine.getGeometry();
  }, [gatewayEngine]);
  
  // Update uniforms
  useGatewayUniforms(
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
    gatewayEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    gatewayEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    gatewayEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    gatewayEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    gatewayEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    gatewayEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('gateway-v3', (motionState) => {
      // Gateway v3 state is already synced via useGatewayMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('gateway-v3');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    gatewayEngine.setPosition(...position);
    gatewayEngine.setScale(scale);
  }, [position, scale, gatewayEngine]);
  
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

