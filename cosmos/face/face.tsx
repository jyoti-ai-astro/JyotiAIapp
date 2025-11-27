/**
 * Dynamic Avatar Face Component
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * React component for dynamic avatar face
 */

'use client';

import React, { useRef, useMemo, useEffect, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { FaceEngine } from './face-engine';
import { FaceExpressions } from './face-expressions';
import { useFaceSync } from './hooks/use-face-sync';
import { useFaceUniforms } from './hooks/use-face-uniforms';

export interface FaceProps {
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
  
  /** Is guru hovered */
  isGuruHovered?: boolean;
  
  /** Expression name */
  expression?: 'neutral' | 'warm-smile' | 'calm-focus' | 'compassion-mode' | 'blessing-smile';
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Position */
  position?: [number, number, number];
  
  /** Scale */
  scale?: number;
}

export interface FaceRef {
  setExpression: (name: FaceProps['expression']) => void;
  triggerBlessingExpression: () => void;
  setFaceTarget: (u: number, v: number) => void;
  resetExpression: () => void;
}

export const Face = React.forwardRef<FaceRef, FaceProps>(
  (
    {
      intensity = 1.0,
      scroll = 0,
      mouse = { x: 0, y: 0 },
      audioReactive,
      blessingWaveProgress = 0,
      isGuruHovered = false,
      expression,
      parallaxStrength = 1.0,
      position = [0, 0, 0],
      scale = 1.0,
    },
    ref
  ) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();
    
    // Create face engine
    const faceEngine = useMemo(() => {
      return new FaceEngine({
        intensity,
        mouse,
        parallaxStrength,
      });
    }, [intensity, parallaxStrength]);
    
    // Get expressions
    const expressions = useMemo(() => {
      return faceEngine.getExpressions();
    }, [faceEngine]);
    
    // Get face sync state
    const faceState = useFaceSync(expressions, blessingWaveProgress, isGuruHovered);
    
    // Get material from engine
    const material = useMemo(() => {
      return faceEngine.getMaterial();
    }, [faceEngine]);
    
    // Update uniforms
    useFaceUniforms(
      material,
      faceState,
      mouse,
      intensity,
      parallaxStrength
    );
    
    // Get geometry
    const geometry = useMemo(() => {
      const isMobile = size.width < 800;
      const segments = isMobile ? 32 : 64;
      return new THREE.PlaneGeometry(1.0, 1.0, segments, segments);
    }, [size.width]);
    
    // Update engine with face state
    useFrame(() => {
      faceEngine.update(
        faceState.expression,
        faceState.breathPhase,
        faceState.blinkPhase,
        faceState.audioBass,
        faceState.audioMid,
        faceState.audioHigh,
        faceState.scrollProgress,
        faceState.scrollVelocity,
        faceState.scrollDirection,
        faceState.blessingWaveProgress
      );
    });
  
    // Set expression from prop
    useEffect(() => {
      if (expression) {
        faceEngine.setExpression(expression);
      }
    }, [expression, faceEngine]);
    
    // Handle guru hover → calm-focus
    useEffect(() => {
      if (isGuruHovered) {
        faceEngine.setExpression('calm-focus');
      }
    }, [isGuruHovered, faceEngine]);
    
    // Register with motion orchestrator
    useEffect(() => {
      motionOrchestrator.registerEngine('face-engine', (motionState) => {
        // Face state is already synced via useFaceSync
      });
      
      return () => {
        motionOrchestrator.unregisterEngine('face-engine');
      };
    }, []);
    
    // Set position and scale
    useEffect(() => {
      if (meshRef.current) {
        meshRef.current.position.set(...position);
        meshRef.current.scale.setScalar(scale);
      }
      faceEngine.setPosition(...position);
      faceEngine.setScale(scale);
    }, [position, scale, faceEngine]);
    
    // Expose API via ref
    useImperativeHandle(ref, () => ({
      setExpression: (name) => {
        if (name) {
          faceEngine.setExpression(name);
        }
      },
      triggerBlessingExpression: () => {
        faceEngine.triggerBlessingExpression();
      },
      setFaceTarget: (u: number, v: number) => {
        faceEngine.setFaceTarget(u, v);
      },
      resetExpression: () => {
        faceEngine.resetExpression();
      },
    }), [faceEngine]);
    
    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={position}
        scale={scale}
      />
    );
  }
);

Face.displayName = 'Face';

