/**
 * Cosmic UI Raymarch Overlay Component
 * 
 * Phase 2 — Section 15: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Cosmic UI Raymarch Overlay Engine (E19)
 * 
 * Screen-space raymarched UI overlay
 */

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator } from '../motion/orchestrator';
import { CameraState } from '../camera/camera-engine';
import { uiRaymarchVertexShader } from './shaders/ui-raymarch-vertex';
import { uiRaymarchFragmentShader } from './shaders/ui-raymarch-fragment';
import { useUIRaymarchMotion, UIRaymarchMotionState } from './hooks/use-ui-raymarch-motion';
import { useUIRaymarchUniforms } from './hooks/use-ui-raymarch-uniforms';

export interface UIRaymarchProps {
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
  
  /** Camera state (from E18) */
  cameraState?: CameraState;
  
  /** Intensity multiplier */
  intensity?: number;
}

export const UIRaymarch: React.FC<UIRaymarchProps> = ({
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  blessingWaveProgress = 0,
  isGuruHovered = false,
  cameraState,
  intensity = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uScroll: { value: scroll },
        uBass: { value: audioReactive?.bass || 0 },
        uMid: { value: audioReactive?.mid || 0 },
        uHigh: { value: audioReactive?.high || 0 },
        uBlessingWaveProgress: { value: blessingWaveProgress },
        uGuruHover: { value: isGuruHovered ? 1.0 : 0.0 },
        uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
        uCameraFOV: { value: cameraState?.fov || 50.0 },
      },
      vertexShader: uiRaymarchVertexShader,
      fragmentShader: uiRaymarchFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [intensity]);
  
  // Get motion state
  const motionState = useUIRaymarchMotion(cameraState);
  
  // Update uniforms
  useUIRaymarchUniforms(
    material,
    motionState,
    mouse,
    blessingWaveProgress,
    isGuruHovered,
    intensity
  );
  
  // Create fullscreen quad geometry
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(2, 2, 1, 1);
  }, []);
  
  // Position mesh to cover screen (in front of camera)
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Position at camera near plane
    meshRef.current.position.set(0, 0, -0.1);
    meshRef.current.scale.set(1, 1, 1);
  });
  
  // Register with motion orchestrator
  useEffect(() => {
    motionOrchestrator.registerEngine('ui-raymarch', (motionState) => {
      // Motion state is already synced via useUIRaymarchMotion
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('ui-raymarch');
    };
  }, []);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, -0.1]}
      renderOrder={9999} // Render on top
    />
  );
};

