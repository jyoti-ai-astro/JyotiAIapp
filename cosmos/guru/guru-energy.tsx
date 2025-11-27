/**
 * Guru Energy Component
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Complete React component for Guru Avatar Energy
 */

'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { Face, FaceRef } from '../face/face';
import { useGuruBreath } from './hooks/use-guru-breath';
import { useGuruEye } from './hooks/use-guru-eye';
import { useGuruGlow } from './hooks/use-guru-glow';
import { useGuruSync, GuruState } from './hooks/use-guru-sync';
import { useGuruUniforms } from './hooks/use-guru-uniforms';
import { GuruEngine } from './guru-engine';

export interface GuruEnergyProps {
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
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Position */
  position?: [number, number, number];
  
  /** Scale */
  scale?: number;
  
  /** On blessing wave callback */
  onBlessingWave?: () => void;
  
  /** On hover callback */
  onHover?: (hovered: boolean) => void;
  
  /** Blessing wave progress (0-1) */
  blessingWaveProgress?: number;
  
  /** On breath update callback */
  onBreathUpdate?: (phase: number, strength: number) => void;
}

export const GuruEnergy: React.FC<GuruEnergyProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
  position = [0, 0, -1.8],
  scale = 1.0,
  blessingWaveProgress = 0,
  onBlessingWave,
  onHover,
  onBreathUpdate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const faceRef = useRef<FaceRef>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { size } = useThree();
  
  // Use audio data or default to zero
  const audioData = audioReactive || { bass: 0, mid: 0, high: 0 };
  
  // Use hooks
  const breathState = useGuruBreath();
  const eyeState = useGuruEye(isHovered, audioData.high || 0);
  const glowState = useGuruGlow(
    audioData.bass || 0,
    audioData.mid || 0,
    audioData.high || 0
  );
  const guruState = useGuruSync(breathState, eyeState, glowState);
  
  // Notify parent of breath updates
  useEffect(() => {
    if (onBreathUpdate) {
      onBreathUpdate(breathState.breathProgress, breathState.breathStrength);
    }
  }, [breathState.breathProgress, breathState.breathStrength, onBreathUpdate]);
  
  // Create guru engine
  const guruEngine = useMemo(() => {
    return new GuruEngine({
      intensity,
      mouse,
      scroll,
      parallaxStrength,
    });
  }, [intensity, parallaxStrength]);
  
  // Set blessing wave callback
  useEffect(() => {
    if (onBlessingWave) {
      guruEngine.setBlessingWaveCallback(onBlessingWave);
    }
  }, [guruEngine, onBlessingWave]);
  
  // Get mesh and material
  const geometry = useMemo(() => {
    const isMobile = size.width < 800;
    const segments = isMobile ? 16 : 32;
    return new THREE.SphereGeometry(1.0, segments, segments);
  }, [size.width]);
  
  const material = useMemo(() => {
    return guruEngine.getMaterial();
  }, [guruEngine]);
  
  // Update uniforms
  useGuruUniforms(
    material,
    guruState,
    mouse,
    scroll,
    intensity,
    parallaxStrength
  );
  
  // Update engine with guru state
  useFrame(() => {
    guruEngine.update(guruState);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('guru-energy', (motionState) => {
      // Guru state is already synced via useGuruSync
      // This registration ensures guru is part of the orchestration
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('guru-energy');
    };
  }, []);
  
  // Handle interactions
  const handlePointerEnter = () => {
    setIsHovered(true);
    guruEngine.onHover(true);
    if (onHover) {
      onHover(true);
    }
    // Set face expression to calm-focus on hover
    if (faceRef.current) {
      faceRef.current.setExpression('calm-focus');
    }
  };
  
  const handlePointerLeave = () => {
    setIsHovered(false);
    guruEngine.onHover(false);
    if (onHover) {
      onHover(false);
    }
    // Reset face expression
    if (faceRef.current) {
      faceRef.current.resetExpression();
    }
  };
  
  const handleClick = () => {
    guruEngine.onClick();
    // Trigger blessing expression on click
    if (faceRef.current) {
      faceRef.current.triggerBlessingExpression();
    }
  };
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
    }
  }, [position, scale]);
  
  return (
    <group position={position} scale={scale}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        name="guru-energy"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      />
      
      {/* Dynamic Avatar Face (E21 - inside GuruEnergy) */}
      <Face
        ref={faceRef}
        intensity={intensity}
        scroll={scroll}
        mouse={mouse}
        audioReactive={audioReactive}
        blessingWaveProgress={blessingWaveProgress}
        isGuruHovered={isHovered}
        parallaxStrength={parallaxStrength}
        position={[0, 0, 0.1]} // Slightly in front of guru mesh
        scale={0.8} // Slightly smaller than guru mesh
      />
    </group>
  );
};

