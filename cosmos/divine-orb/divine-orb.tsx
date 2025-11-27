/**
 * Divine Orb Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Orb of Divine Consciousness Engine (E10)
 * 
 * Creates a divine orb with 5 internal layers:
 * - Layer 1: Core Light Sphere (soft radial glow)
 * - Layer 2: Energy Swirl Layer (sinusoidal distortion bands)
 * - Layer 3: Mandala Emission Layer (rotating mandala lines)
 * - Layer 4: Refraction Layer (glass-like distortion)
 * - Layer 5: Divine Spark Layer (sparkles using FBM noise)
 * 
 * Features:
 * - Scroll-driven elevation (orb rises when scrolling)
 * - Bass-driven radius expansion
 * - Mid-driven distortion turbulence
 * - High-driven shimmer sparkles
 * - Parallax distortion from mouse
 * - Full spherical refraction effect
 * - Separate bloom mask for high-energy sparkle points
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { orbVertexShader } from './shaders/orb-vertex';
import { orbFragmentShader } from './shaders/orb-fragment';
import { useOrbUniforms } from './hooks/use-orb-uniforms';
import { useOrbAudio } from './hooks/use-orb-audio';
import { useOrbScroll } from './hooks/use-orb-scroll';

export interface DivineOrbProps {
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
  
  /** Orb position */
  position?: [number, number, number];
}

// Create orb shader material
function createOrbMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1.0 },
      uParallaxStrength: { value: 1.0 },
    },
    vertexShader: orbVertexShader,
    fragmentShader: orbFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Main Divine Orb Component
export const DivineOrb: React.FC<DivineOrbProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
  position = [0, 0, -1.5],
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useOrbAudio({ audioReactive });
  const normalizedScroll = useOrbScroll({ scroll });
  
  // Create material
  const material = useMemo(() => createOrbMaterial(), []);
  
  // Create geometry (sphere)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce segments
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    
    // Create sphere geometry for orb
    return new THREE.SphereGeometry(1.0, segments, segments);
  }, [size.width]);
  
  // Update uniforms using hook
  useOrbUniforms(material, {
    mouse,
    scroll: normalizedScroll,
    intensity,
    parallaxStrength,
    audioReactive: {
      bass: audioValues.bass,
      mid: audioValues.mid,
      high: audioValues.high,
    },
  });
  
  // Slow rotation for visual interest
  useFrame(() => {
    if (meshRef.current) {
      // Slow rotation on Y axis
      meshRef.current.rotation.y += 0.001;
      // Very slow rotation on X axis
      meshRef.current.rotation.x += 0.0005;
    }
  });
  
  // Calculate position with scroll-driven elevation
  const orbPosition = useMemo(() => {
    return [
      position[0],
      position[1] + normalizedScroll * 2.0,  // Scroll-driven elevation
      position[2],
    ] as [number, number, number];
  }, [position, normalizedScroll]);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={orbPosition}
      rotation={[0, 0, 0]}
      scale={[1, 1, 1]}
    />
  );
};

