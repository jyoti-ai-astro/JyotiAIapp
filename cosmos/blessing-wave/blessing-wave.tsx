/**
 * Blessing Wave Component
 * 
 * Phase 2 — Section 13: ACCESSIBILITY & MOTION SAFETY LAYER v1.0
 * Blessing Wave Engine (E16)
 * 
 * React component for blessing wave effect
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { useBlessingWaveTrigger } from './hooks/use-blessing-trigger';
import { useBlessingUniforms, BlessingState } from './hooks/use-blessing-uniforms';
import { BlessingEngine } from './blessing-engine';

export interface BlessingWaveProps {
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
  
  /** Wave trigger setter (receives trigger function from parent) */
  waveTrigger?: (triggerFn: () => void) => void;
  
  /** On wave progress change (for bloom intensity) */
  onWaveProgressChange?: (progress: number) => void;
}

export const BlessingWave: React.FC<BlessingWaveProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
  position = [0, 0, -1.7],
  waveTrigger,
  onWaveProgressChange,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use blessing wave trigger
  const { triggerWave, triggerState } = useBlessingWaveTrigger();
  
  // Create blessing engine
  const blessingEngine = useMemo(() => {
    return new BlessingEngine({
      intensity,
      mouse,
      scroll,
      parallaxStrength,
    });
  }, [intensity, parallaxStrength]);
  
  // Get material from engine
  const material = useMemo(() => {
    return blessingEngine.getMaterial();
  }, [blessingEngine]);
  
  // Update blessing state with material
  const updatedBlessingState = useBlessingUniforms(
    material,
    triggerState,
    mouse,
    scroll,
    intensity,
    parallaxStrength
  );
  
  // Get geometry
  const geometry = useMemo(() => {
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    return new THREE.RingGeometry(0.1, 1.0, segments, 1);
  }, [size.width]);
  
  // Internal trigger function that combines triggerWave and engine.waveStart()
  const internalTrigger = useMemo(() => {
    return () => {
      triggerWave();
      blessingEngine.waveStart();
    };
  }, [triggerWave, blessingEngine]);
  
  // Expose trigger function to parent via waveTrigger prop
  useEffect(() => {
    if (waveTrigger) {
      waveTrigger(internalTrigger);
    }
  }, [waveTrigger, internalTrigger]);
  
  // Update engine with blessing state
  useFrame(() => {
    blessingEngine.update(updatedBlessingState);
    
    // Notify parent of wave progress (for bloom intensity)
    if (onWaveProgressChange) {
      onWaveProgressChange(updatedBlessingState.waveProgress);
    }
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('blessing-wave', (motionState) => {
      // Blessing state is already synced via useBlessingUniforms
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('blessing-wave');
    };
  }, []);
  
  // Set position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
    }
    blessingEngine.setPosition(...position);
  }, [position, blessingEngine]);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      visible={triggerState.waveActive}
    />
  );
};

