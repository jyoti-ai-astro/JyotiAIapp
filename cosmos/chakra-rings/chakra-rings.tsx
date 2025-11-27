/**
 * Chakra Glow Rings Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Chakra Glow Rings Engine (E6)
 * 
 * 7 independent glow rings representing the chakras:
 * - Root (Red)
 * - Sacral (Orange)
 * - Solar (Yellow)
 * - Heart (Green)
 * - Throat (Blue)
 * - Third Eye (Indigo)
 * - Crown (Violet)
 * 
 * Each ring supports:
 * - Pulse animation
 * - Glow + bloom mask
 * - Scroll-reactive intensity
 * - Bass-driven expansion
 * - ChakraPulse oscillator
 * - Parallax motion
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { chakraVertexShader } from './shaders/chakra-vertex';
import { chakraFragmentShader } from './shaders/chakra-fragment';
import { useChakraUniforms } from './hooks/use-chakra-uniforms';
import { useChakraAudio } from './hooks/use-chakra-audio';
import { useChakraScroll } from './hooks/use-chakra-scroll';

export interface ChakraRingsProps {
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

// Chakra definitions
interface ChakraDefinition {
  name: string;
  color: THREE.Color;
  yPosition: number;  // Vertical position (-2.5 to 2.4)
  radius: number;     // Ring radius
}

const CHAKRAS: ChakraDefinition[] = [
  {
    name: 'Root',
    color: new THREE.Color(1.0, 0.42, 0.42),  // #FF6A6A - Red
    yPosition: -2.5,
    radius: 3.0,
  },
  {
    name: 'Sacral',
    color: new THREE.Color(1.0, 0.60, 0.40),  // #FF9966 - Orange
    yPosition: -1.6,
    radius: 3.2,
  },
  {
    name: 'Solar',
    color: new THREE.Color(1.0, 0.85, 0.40),  // #FFD966 - Yellow
    yPosition: -0.8,
    radius: 3.4,
  },
  {
    name: 'Heart',
    color: new THREE.Color(0.60, 1.0, 0.80),  // #99FFCC - Green
    yPosition: 0.0,
    radius: 3.6,
  },
  {
    name: 'Throat',
    color: new THREE.Color(0.40, 0.80, 1.0),  // #66CCFF - Blue
    yPosition: 0.8,
    radius: 3.8,
  },
  {
    name: 'Third Eye',
    color: new THREE.Color(0.60, 0.40, 1.0),  // #9966FF - Indigo
    yPosition: 1.6,
    radius: 4.0,
  },
  {
    name: 'Crown',
    color: new THREE.Color(1.0, 0.60, 1.0),   // #FF99FF - Violet
    yPosition: 2.4,
    radius: 4.2,
  },
];

// Create chakra ring material
function createChakraMaterial(chakraColor: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1.0 },
      uChakraPulse: { value: 0 },
      uParallaxStrength: { value: 1.0 },
      uRingRadius: { value: 3.0 },
      uRingY: { value: 0.0 },
      uChakraColor: { value: chakraColor },
    },
    vertexShader: chakraVertexShader,
    fragmentShader: chakraFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Individual Chakra Ring Component
const ChakraRing: React.FC<{
  chakra: ChakraDefinition;
  material: THREE.ShaderMaterial;
  props: ChakraRingsProps;
}> = ({ chakra, material, props }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useChakraAudio({ audioReactive: props.audioReactive });
  const normalizedScroll = useChakraScroll({ scroll: props.scroll });
  
  // Create geometry (plane that gets converted to ring in shader)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce segments
    const isMobile = size.width < 800;
    const widthSegments = isMobile ? 32 : 64;
    const heightSegments = isMobile ? 8 : 16;
    
    // Create plane geometry (will be converted to ring in vertex shader)
    return new THREE.PlaneGeometry(1.0, 0.3, widthSegments, heightSegments);
  }, [size.width]);
  
  // Update uniforms using hook
  useChakraUniforms(material, {
    mouse: props.mouse,
    scroll: normalizedScroll,
    intensity: props.intensity,
    parallaxStrength: props.parallaxStrength,
    audioReactive: {
      bass: audioValues.bass,
      mid: audioValues.mid,
      high: audioValues.high,
    },
  });
  
  // Update ring-specific uniforms
  useFrame(() => {
    if (material && material.uniforms) {
      material.uniforms.uRingRadius.value = chakra.radius;
      material.uniforms.uRingY.value = chakra.yPosition;
      material.uniforms.uChakraColor.value = chakra.color;
    }
    
    // Slow rotation for visual interest
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0002;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, chakra.yPosition, -3.5]}
      rotation={[Math.PI / 2, 0, 0]}  // Rotate to horizontal plane
    />
  );
};

// Main Chakra Rings Component
export const ChakraRings: React.FC<ChakraRingsProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
}) => {
  // Create materials for each chakra
  const materials = useMemo(() => {
    return CHAKRAS.map((chakra) => createChakraMaterial(chakra.color));
  }, []);
  
  const props = useMemo(() => ({
    intensity,
    scroll,
    mouse,
    audioReactive,
    parallaxStrength,
  }), [intensity, scroll, mouse, audioReactive, parallaxStrength]);
  
  return (
    <group>
      {CHAKRAS.map((chakra, index) => (
        <ChakraRing
          key={chakra.name}
          chakra={chakra}
          material={materials[index]}
          props={props}
        />
      ))}
    </group>
  );
};

