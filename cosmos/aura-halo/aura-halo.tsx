/**
 * Aura Halo Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Aura Halo Engine (E7)
 * 
 * Renders a divine golden-blue halo around the Guru Avatar zone with:
 * - Radial expansion waves
 * - Soft multi-layer glow
 * - Bloom mask layer
 * - Audio-reactive shimmer
 * - Scroll-driven height lift
 * - Parallax wobble
 * 
 * 3 distinct layers:
 * - Base Halo (soft glow)
 * - Inner Pulse Ring (strong golden pulse)
 * - Divine Aura Veil (thin shimmering energy sheet)
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { auraHaloVertexShader } from './shaders/aura-halo-vertex';
import { auraHaloFragmentShader } from './shaders/aura-halo-fragment';
import { useAuraHaloUniforms } from './hooks/use-aura-halo-uniforms';
import { useAuraHaloAudio } from './hooks/use-aura-halo-audio';
import { useAuraHaloScroll } from './hooks/use-aura-halo-scroll';

export interface AuraHaloProps {
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

// Create aura halo shader material
function createAuraHaloMaterial(layerType: number): THREE.ShaderMaterial {
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
    vertexShader: auraHaloVertexShader,
    fragmentShader: auraHaloFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Individual Aura Layer Component
const AuraLayer: React.FC<{
  layerType: number;
  material: THREE.ShaderMaterial;
  props: AuraHaloProps;
}> = ({ layerType, material, props }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useAuraHaloAudio({ audioReactive: props.audioReactive });
  const normalizedScroll = useAuraHaloScroll({ scroll: props.scroll });
  
  // Create geometry (circular plane)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce segments
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    
    // Create circular plane for halo
    return new THREE.CircleGeometry(5.0, segments);
  }, [size.width]);
  
  // Update uniforms using hook
  useAuraHaloUniforms(material, {
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
  
  // Slow rotation for visual interest
  useFrame(() => {
    if (meshRef.current) {
      // Different rotation speeds per layer
      if (layerType < 0.5) {
        // Base Halo: Very slow
        meshRef.current.rotation.z += 0.00005;
      } else if (layerType < 1.5) {
        // Inner Pulse: Medium speed
        meshRef.current.rotation.z += 0.0001;
      } else {
        // Divine Veil: Faster shimmer
        meshRef.current.rotation.z += 0.00015;
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, -4.0]}
      rotation={[0, 0, 0]}
    />
  );
};

// Main Aura Halo Component
export const AuraHalo: React.FC<AuraHaloProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
}) => {
  // Create materials for each layer
  const baseHaloMaterial = useMemo(() => createAuraHaloMaterial(0), []);
  const innerPulseMaterial = useMemo(() => createAuraHaloMaterial(1), []);
  const divineVeilMaterial = useMemo(() => createAuraHaloMaterial(2), []);
  
  const props = useMemo(() => ({
    intensity,
    scroll,
    mouse,
    audioReactive,
    parallaxStrength,
  }), [intensity, scroll, mouse, audioReactive, parallaxStrength]);
  
  return (
    <group>
      {/* Layer 1: Base Halo (Soft Glow) */}
      <AuraLayer
        layerType={0}
        material={baseHaloMaterial}
        props={props}
      />
      
      {/* Layer 2: Inner Pulse Ring (Strong Golden Pulse) */}
      <AuraLayer
        layerType={1}
        material={innerPulseMaterial}
        props={props}
      />
      
      {/* Layer 3: Divine Aura Veil (Thin Shimmering Energy Sheet) */}
      <AuraLayer
        layerType={2}
        material={divineVeilMaterial}
        props={props}
      />
    </group>
  );
};

