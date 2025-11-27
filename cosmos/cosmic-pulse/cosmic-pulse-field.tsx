/**
 * Cosmic Pulse Field Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Cosmic Pulse Field Engine (E8)
 * 
 * Creates a pulse field with 3 layers:
 * - Layer 1: Radial Pulse Rings (slow, wide pulses)
 * - Layer 2: Center Core Pulse (fast, golden pulse mechanics)
 * - Layer 3: Shockwave Ripple Layer (large ripples on bass peaks)
 * 
 * Features:
 * - Bass-reactive shockwaves
 * - Mid-reactive radial diffusion
 * - High-reactive shimmer noise
 * - Scroll-driven amplitude boost
 * - Mouse-driven parallax warp
 * - Bloom mask integration
 * - Smooth blending with Nebula, Aura, and Chakra layers
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { pulseVertexShader } from './shaders/pulse-vertex';
import { pulseFragmentShader } from './shaders/pulse-fragment';
import { usePulseUniforms } from './hooks/use-pulse-uniforms';
import { usePulseAudio } from './hooks/use-pulse-audio';
import { usePulseScroll } from './hooks/use-pulse-scroll';

export interface CosmicPulseFieldProps {
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
}

// Create pulse field shader material
function createPulseMaterial(layerType: number): THREE.ShaderMaterial {
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
      uLayerType: { value: layerType },
    },
    vertexShader: pulseVertexShader,
    fragmentShader: pulseFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Individual Pulse Layer Component
const PulseLayer: React.FC<{
  layerType: number;
  material: THREE.ShaderMaterial;
  props: CosmicPulseFieldProps;
}> = ({ layerType, material, props }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = usePulseAudio({ audioReactive: props.audioReactive });
  const normalizedScroll = usePulseScroll({ scroll: props.scroll });
  
  // Create geometry (circular plane)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce segments
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    
    // Create circular plane for pulse field
    // Different sizes per layer
    let radius = 6.0;
    if (layerType < 0.5) {
      radius = 6.0;  // Radial Pulse Rings - largest
    } else if (layerType < 1.5) {
      radius = 3.0;  // Center Core - smaller
    } else {
      radius = 8.0;  // Shockwave - largest for ripples
    }
    
    return new THREE.CircleGeometry(radius, segments);
  }, [layerType, size.width]);
  
  // Update uniforms using hook
  usePulseUniforms(material, {
    mouse: props.mouse,
    scroll: normalizedScroll,
    intensity: props.intensity,
    parallaxStrength: props.parallaxStrength,
    layerType,
    audioReactive: {
      bass: audioValues.bass,
      mid: audioValues.mid,
      high: audioValues.high,
    },
  });
  
  // Layer-specific rotation
  useFrame(() => {
    if (meshRef.current) {
      // Different rotation speeds per layer
      if (layerType < 0.5) {
        // Radial Pulse Rings: Very slow
        meshRef.current.rotation.z += 0.00003;
      } else if (layerType < 1.5) {
        // Center Core: Medium speed
        meshRef.current.rotation.z += 0.0001;
      } else {
        // Shockwave: Slow (ripples are radial)
        meshRef.current.rotation.z += 0.00005;
      }
    }
  });
  
  // Layer-specific Z position
  let zPosition = -3.2;
  if (layerType < 0.5) {
    zPosition = -3.2;  // Radial Pulse Rings
  } else if (layerType < 1.5) {
    zPosition = -3.0;  // Center Core
  } else {
    zPosition = -2.8;  // Shockwave
  }
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, zPosition]}
      rotation={[0, 0, 0]}
    />
  );
};

// Main Cosmic Pulse Field Component
export const CosmicPulseField: React.FC<CosmicPulseFieldProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
}) => {
  // Create materials for each layer
  const radialPulseMaterial = useMemo(() => createPulseMaterial(0), []);
  const centerCoreMaterial = useMemo(() => createPulseMaterial(1), []);
  const shockwaveMaterial = useMemo(() => createPulseMaterial(2), []);
  
  const props = useMemo(() => ({
    intensity,
    scroll,
    mouse,
    audioReactive,
    parallaxStrength,
  }), [intensity, scroll, mouse, audioReactive, parallaxStrength]);
  
  return (
    <group>
      {/* Layer 1: Radial Pulse Rings (Slow, Wide Pulses) */}
      <PulseLayer
        layerType={0}
        material={radialPulseMaterial}
        props={props}
      />
      
      {/* Layer 2: Center Core Pulse (Fast, Golden Pulse) */}
      <PulseLayer
        layerType={1}
        material={centerCoreMaterial}
        props={props}
      />
      
      {/* Layer 3: Shockwave Ripple Layer (Large Ripples on Bass Peaks) */}
      <PulseLayer
        layerType={2}
        material={shockwaveMaterial}
        props={props}
      />
    </group>
  );
};

