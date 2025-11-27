/**
 * Energy Ribbons Component
 * 
 * Phase 2 — Section 5 Extension: ENERGY RIBBON ENGINE (E5)
 * 
 * Dual serpentine ribbons representing:
 * - Ida & Pingala (twin serpentine currents)
 * - Rising Kundalini paths
 * - Energy flow through the cosmic field
 * 
 * Positioned between Nebula and Kundalini Wave layers
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ribbonVertexShader } from './shaders/ribbon-vertex';
import { ribbonFragmentShader } from './shaders/ribbon-fragment';
import { useRibbonUniforms } from './hooks/use-ribbon-uniforms';
import { useRibbonAudio } from './hooks/use-ribbon-audio';
import { useRibbonScroll } from './hooks/use-ribbon-scroll';

export interface EnergyRibbonsProps {
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

// Create ribbon shader material
function createRibbonMaterial(): THREE.ShaderMaterial {
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
    vertexShader: ribbonVertexShader,
    fragmentShader: ribbonFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export const EnergyRibbons: React.FC<EnergyRibbonsProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
}) => {
  const leftRibbonRef = useRef<THREE.Mesh>(null);
  const rightRibbonRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useRibbonAudio({ audioReactive });
  const normalizedScroll = useRibbonScroll({ scroll });
  
  // Create geometry (high resolution for smooth ribbons)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce resolution
    const isMobile = size.width < 800;
    const widthSegments = isMobile ? 50 : 200;
    const heightSegments = isMobile ? 100 : 200;
    
    // Ribbon dimensions: 1.2 width × 12 height
    return new THREE.PlaneGeometry(1.2, 12, widthSegments, heightSegments);
  }, [size.width]);
  
  // Create materials for left and right ribbons
  const leftMaterial = useMemo(() => createRibbonMaterial(), []);
  const rightMaterial = useMemo(() => createRibbonMaterial(), []);
  
  // Update uniforms using hook
  useRibbonUniforms(leftMaterial, {
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
  
  useRibbonUniforms(rightMaterial, {
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
  
  // Animation: slight phase offset for dual serpent effect
  useFrame(() => {
    if (leftRibbonRef.current) {
      // Left ribbon (Ida - moon/silver)
      leftRibbonRef.current.rotation.z += 0.0001;
    }
    
    if (rightRibbonRef.current) {
      // Right ribbon (Pingala - sun/gold)
      rightRibbonRef.current.rotation.z -= 0.0001;
    }
  });
  
  return (
    <group>
      {/* Left Ribbon (Ida - Pink-Violet) */}
      <mesh
        ref={leftRibbonRef}
        geometry={geometry}
        material={leftMaterial}
        position={[-2.5, 0, -4]}
        rotation={[0, 0, 0.1]}
      />
      
      {/* Right Ribbon (Pingala - Gold) */}
      <mesh
        ref={rightRibbonRef}
        geometry={geometry}
        material={rightMaterial}
        position={[2.5, 0, -4]}
        rotation={[0, 0, -0.1]}
      />
    </group>
  );
};

