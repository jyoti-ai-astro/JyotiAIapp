/**
 * Light Shafts Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Light Shafts Engine (E11)
 * 
 * Creates celestial light shafts with 3 distinct types:
 * - Type A: Solar God-Rays (broad, slow-moving shafts)
 * - Type B: Divine Light Beams (long, thin beams from top)
 * - Type C: Cross-Directional Aura Shafts (X-shaped beams)
 * 
 * Features:
 * - Volumetric light banding (noise-based)
 * - Audio-reactive glow (bass expands, high sparkles)
 * - Scroll-reactive angle shift
 * - Parallax motion driven by mouse
 * - Depth fade (beams fade into distance)
 * - Bloom mask
 * - Color ramp: Gold → White → Violet
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { shaftsVertexShader } from './shaders/shafts-vertex';
import { shaftsFragmentShader } from './shaders/shafts-fragment';
import { useShaftsUniforms } from './hooks/use-shafts-uniforms';
import { useShaftsAudio } from './hooks/use-shafts-audio';
import { useShaftsScroll } from './hooks/use-shafts-scroll';

export interface LightShaftsProps {
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

// Create light shafts shader material
function createShaftsMaterial(shaftType: number): THREE.ShaderMaterial {
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
      uShaftType: { value: shaftType },
    },
    vertexShader: shaftsVertexShader,
    fragmentShader: shaftsFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Individual Shaft Type Component
const ShaftType: React.FC<{
  shaftType: number;
  material: THREE.ShaderMaterial;
  props: LightShaftsProps;
}> = ({ shaftType, material, props }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useShaftsAudio({ audioReactive: props.audioReactive });
  const normalizedScroll = useShaftsScroll({ scroll: props.scroll });
  
  // Create geometry (plane for light shafts)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce segments
    const isMobile = size.width < 800;
    const segments = isMobile ? 32 : 64;
    
    // Create plane geometry for light shafts
    // Different sizes per type
    let width = 20.0;
    let height = 20.0;
    
    if (shaftType < 0.5) {
      // Solar God-Rays - largest
      width = 20.0;
      height = 20.0;
    } else if (shaftType < 1.5) {
      // Divine Beams - tall and narrow
      width = 4.0;
      height = 25.0;
    } else {
      // Cross-Directional - large X
      width = 20.0;
      height = 20.0;
    }
    
    return new THREE.PlaneGeometry(width, height, segments, segments);
  }, [shaftType, size.width]);
  
  // Update uniforms using hook
  useShaftsUniforms(material, {
    mouse: props.mouse,
    scroll: normalizedScroll,
    intensity: props.intensity,
    parallaxStrength: props.parallaxStrength,
    shaftType,
    audioReactive: {
      bass: audioValues.bass,
      mid: audioValues.mid,
      high: audioValues.high,
    },
  });
  
  // Layer-specific rotation
  useFrame(() => {
    if (meshRef.current) {
      // Very slow rotation for visual interest
      if (shaftType < 0.5) {
        // Solar God-Rays: Slow rotation
        meshRef.current.rotation.z += 0.0001;
      } else if (shaftType < 1.5) {
        // Divine Beams: Minimal rotation
        meshRef.current.rotation.z += 0.00005;
      } else {
        // Cross-Directional: Slow rotation
        meshRef.current.rotation.z += 0.00008;
      }
    }
  });
  
  // Layer-specific Z position
  let zPosition = -1.0;
  if (shaftType < 0.5) {
    zPosition = -1.0;  // Solar God-Rays
  } else if (shaftType < 1.5) {
    zPosition = -0.8;  // Divine Beams
  } else {
    zPosition = -0.6;  // Cross-Directional
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

// Main Light Shafts Component
export const LightShafts: React.FC<LightShaftsProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
}) => {
  // Create materials for each shaft type
  const solarGodRaysMaterial = useMemo(() => createShaftsMaterial(0), []);
  const divineBeamsMaterial = useMemo(() => createShaftsMaterial(1), []);
  const crossDirectionalMaterial = useMemo(() => createShaftsMaterial(2), []);
  
  const props = useMemo(() => ({
    intensity,
    scroll,
    mouse,
    audioReactive,
    parallaxStrength,
  }), [intensity, scroll, mouse, audioReactive, parallaxStrength]);
  
  return (
    <group>
      {/* Type A: Solar God-Rays (Broad, Slow-Moving) */}
      <ShaftType
        shaftType={0}
        material={solarGodRaysMaterial}
        props={props}
      />
      
      {/* Type B: Divine Light Beams (Long, Thin from Top) */}
      <ShaftType
        shaftType={1}
        material={divineBeamsMaterial}
        props={props}
      />
      
      {/* Type C: Cross-Directional Aura Shafts (X-shaped) */}
      <ShaftType
        shaftType={2}
        material={crossDirectionalMaterial}
        props={props}
      />
    </group>
  );
};

