/**
 * Sacred Geometry Projection Component
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Sacred Geometry Projection Engine (E17)
 * 
 * React component for sacred geometry projection
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { useProjectionUniforms, ProjectionState } from './hooks/use-projection-uniforms';
import { useProjectionMotion } from './hooks/use-projection-motion';
import { ProjectionEngine } from './projection-engine';

export interface ProjectionProps {
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
  
  /** On rotation update callback (for Path Indicator mandala-alignment) */
  onRotationUpdate?: (rotation: number) => void;
}

export const Projection: React.FC<ProjectionProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
  position = [0, -0.5, -1.9],
  scale = 1.0,
  onRotationUpdate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Create projection engine
  const projectionEngine = useMemo(() => {
    return new ProjectionEngine({
      intensity,
      mouse,
      scroll,
      parallaxStrength,
    });
  }, [intensity, parallaxStrength]);
  
  // Get material from engine
  const material = useMemo(() => {
    return projectionEngine.getMaterial();
  }, [projectionEngine]);
  
  // Get projection state from uniforms hook
  const projectionState = useProjectionUniforms(
    material,
    mouse,
    scroll,
    intensity,
    parallaxStrength
  );
  
  // Integrate with motion orchestrator
  const motionState = useProjectionMotion((motionState) => {
    // Motion state is already synced via useProjectionUniforms
  });
  
  // Notify parent of rotation update (for Path Indicator mandala-alignment)
  useEffect(() => {
    if (onRotationUpdate) {
      // Path rotation is scroll-driven: uScroll * 2π (from projection shader)
      const rotation = motionState.scrollProgress * Math.PI * 2;
      onRotationUpdate(rotation);
    }
  }, [motionState.scrollProgress, onRotationUpdate]);
  
  // Get geometry
  const geometry = useMemo(() => {
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    return new THREE.PlaneGeometry(4.0, 4.0, segments, segments);
  }, [size.width]);
  
  // Update engine with projection state
  useFrame(() => {
    projectionEngine.update(projectionState);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('projection-engine', (motionState) => {
      // Projection state is already synced via useProjectionUniforms
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('projection-engine');
    };
  }, []);
  
  // Set position and scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.x = -Math.PI / 2; // Face upward
    }
    projectionEngine.setPosition(...position);
    projectionEngine.setScale(scale);
  }, [position, scale, projectionEngine]);
  
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

