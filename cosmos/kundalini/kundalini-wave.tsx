/**
 * Kundalini Energy Wave Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Main R3F component for the Kundalini wave mesh
 * - 400×400 grid PlaneBufferGeometry
 * - ShaderMaterial with full uniform system
 * - Parallax, breath, and wave displacement
 * - Mobile fallbacks and performance optimizations
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKundaliniUniforms } from './hooks/use-kundalini-uniforms';
import { useKundaliniAudio } from './hooks/use-kundalini-audio';
import { useKundaliniScroll } from './hooks/use-kundalini-scroll';

// Import shaders
import { kundaliniVertexShader } from './shaders/kundalini-vertex';
import { kundaliniFragmentShader } from './shaders/kundalini-fragment';

export interface KundaliniWaveProps {
  /** Mouse position for parallax */
  mouse?: { x: number; y: number };
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

// Create Kundalini shader material
function createKundaliniMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1.0 },
      uChakraPulse: { value: 0 },
    },
    vertexShader: kundaliniVertexShader,
    fragmentShader: kundaliniFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export const KundaliniWave: React.FC<KundaliniWaveProps> = ({
  mouse = { x: 0, y: 0 },
  scroll = 0,
  intensity = 1.0,
  audioReactive,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useKundaliniAudio({ audioReactive });
  const normalizedScroll = useKundaliniScroll({ scroll });
  
  // Create geometry (400×400 grid)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce grid resolution
    const isMobile = size.width < 800;
    const segments = isMobile ? 200 : 400;
    
    return new THREE.PlaneGeometry(20, 20, segments, segments);
  }, [size.width]);
  
  // Create material
  const material = useMemo(() => createKundaliniMaterial(), []);
  
  // Update uniforms using hook
  useKundaliniUniforms(material, {
    mouse,
    scroll: normalizedScroll,
    intensity,
    audioReactive: {
      bass: audioValues.bass,
      mid: audioValues.mid,
      high: audioValues.high,
    },
  });
  
  // Orbital rotation
  useFrame(() => {
    if (meshRef.current) {
      // Slow orbital rotation
      meshRef.current.rotation.z += 0.0001;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, -3]}
      rotation={[0, 0, 0]}
    />
  );
};

