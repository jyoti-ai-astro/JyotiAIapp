/**
 * Ascension Lattice v2 Component
 * 
 * Phase 2 — Section 61: ASCENSION LATTICE ENGINE v2
 * Ascension Lattice Engine v2 (E65)
 * 
 * React component for ascension lattice v2
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { AscensionLatticeEngine } from './ascension-lattice-engine';
import { useAscensionLatticeMotion } from './hooks/use-ascension-lattice-motion';
import { useAscensionLatticeUniforms } from './hooks/use-ascension-lattice-uniforms';

export interface AscensionLatticeV2Props {
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

export const AscensionLatticeV2: React.FC<AscensionLatticeV2Props> = ({
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
  position = [0, -1.0, -27.0],
  scale = 10.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Mobile fallback reduction
  const isMobile = size.width < 800;
  const numDiamondCells = isMobile ? 32 : 64; // 8×8 → 4×4
  const numHexRings = isMobile ? 3 : 5;
  const numRiserColumns = isMobile ? 12 : 20;
  const numCrossBeams = isMobile ? 24 : 40;
  const numInterlaceThreads = isMobile ? 30 : 50;
  const numOrbitalRings = isMobile ? 2 : 4;
  const numTripleSpirals = 3; // Keep same
  const numWaveRings = isMobile ? 6 : 12;
  const numPrismNodes = isMobile ? 60 : 120;
  const numLightShafts = isMobile ? 8 : 14;
  const numGlyphs = isMobile ? 64 : 96;
  const numLightRays = isMobile ? 16 : 24;
  const numDustParticles = isMobile ? 300 : 450;
  
  // Create ascension lattice engine
  const latticeEngine = useMemo(() => {
    return new AscensionLatticeEngine({
      intensity,
      mouse,
      parallaxStrength,
      numDiamondCells,
      numHexRings,
      numRiserColumns,
      numCrossBeams,
      numInterlaceThreads,
      numOrbitalRings,
      numTripleSpirals,
      numWaveRings,
      numPrismNodes,
      numLightShafts,
      numGlyphs,
      numLightRays,
      numDustParticles,
    });
  }, [intensity, parallaxStrength, numDiamondCells, numHexRings, numRiserColumns, numCrossBeams, numInterlaceThreads, numOrbitalRings, numTripleSpirals, numWaveRings, numPrismNodes, numLightShafts, numGlyphs, numLightRays, numDustParticles]);
  
  // Get motion state
  const motionState = useAscensionLatticeMotion();
  
  // Get material from engine
  const material = useMemo(() => {
    return latticeEngine.getMaterial();
  }, [latticeEngine]);
  
  // Get geometry from engine
  const geometry = useMemo(() => {
    return latticeEngine.getGeometry();
  }, [latticeEngine]);
  
  // Update uniforms
  useAscensionLatticeUniforms(
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
    latticeEngine.update(
      motionState.time,
      motionState.scrollProgress,
      motionState.bassMotion,
      motionState.midMotion,
      motionState.highMotion,
      deltaTime
    );
    
    // Update breath data
    latticeEngine.setBreath(breathPhase, breathStrength);
    
    // Update blessing wave
    latticeEngine.setBlessingWave(blessingWaveProgress);
    
    // Update scroll
    latticeEngine.setScroll(motionState.scrollProgress);
    
    // Update rotation sync
    latticeEngine.setRotationSync(rotationSync);
    
    // Update camera FOV
    latticeEngine.setCameraFOV(cameraFOV);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('ascension-lattice-v2', (motionState) => {
      // Ascension lattice v2 state is already synced via useAscensionLatticeMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('ascension-lattice-v2');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
    latticeEngine.setPosition(...position);
    latticeEngine.setScale(scale);
  }, [position, scale, latticeEngine]);
  
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

