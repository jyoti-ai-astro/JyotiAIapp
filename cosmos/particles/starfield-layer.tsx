/**
 * Stellar Starfield Layer (Layer A)
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Base layer with spiral, spherical, and random distributions
 * 50,000 particles (desktop) / 20,000 (mobile)
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createParticleMaterial } from './particle-system';

export interface StarfieldLayerProps {
  /** Number of particles */
  count?: number;
  
  /** Distribution type */
  distribution?: 'spiral' | 'spherical' | 'random';
  
  /** Mouse position */
  mouse?: THREE.Vector2;
  
  /** Scroll position */
  scroll?: number;
  
  /** Intensity */
  intensity?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Gravity strength */
  gravityStrength?: number;
  
  /** Audio reactive */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

// Generate spiral distribution
function generateSpiralPositions(count: number): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  twinkleSpeeds: Float32Array;
  twinkleOffsets: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinkleOffsets = new Float32Array(count);
  
  const a = 0.4;
  const b = 0.22;
  const maxRadius = 50;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2 * 5;
    const radius = Math.min(a * Math.exp(b * theta), maxRadius);
    const angle = theta + (Math.floor(Math.random() * 4) * Math.PI * 2) / 4;
    
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = Math.sin(angle) * radius;
    
    // Color based on radius
    const normalizedRadius = radius / maxRadius;
    const color = new THREE.Color(1.0, 0.95, 0.88);
    if (normalizedRadius > 0.3) {
      color.lerp(new THREE.Color(0.75, 0.55, 1.0), (normalizedRadius - 0.3) / 0.7);
    }
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    sizes[i] = 0.5 + Math.random() * 0.5;
    twinkleSpeeds[i] = 0.1 + Math.random() * 0.2;  // Low frequency
    twinkleOffsets[i] = Math.random() * Math.PI * 2;
  }
  
  return { positions, colors, sizes, twinkleSpeeds, twinkleOffsets };
}

// Generate spherical distribution
function generateSphericalPositions(count: number, minRadius: number, maxRadius: number): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  twinkleSpeeds: Float32Array;
  twinkleOffsets: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinkleOffsets = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Spherical coordinates
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Color based on distance
    const normalizedRadius = (radius - minRadius) / (maxRadius - minRadius);
    const color = new THREE.Color(1.0, 0.95, 0.88);
    color.lerp(new THREE.Color(0.75, 0.55, 1.0), normalizedRadius);
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    sizes[i] = 0.5 + Math.random() * 0.3;
    twinkleSpeeds[i] = 0.1 + Math.random() * 0.3;
    twinkleOffsets[i] = Math.random() * Math.PI * 2;
  }
  
  return { positions, colors, sizes, twinkleSpeeds, twinkleOffsets };
}

// Generate random distribution
function generateRandomPositions(count: number, radius: number): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  twinkleSpeeds: Float32Array;
  twinkleOffsets: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinkleOffsets = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    positions[i3] = (Math.random() - 0.5) * radius * 2;
    positions[i3 + 1] = (Math.random() - 0.5) * radius * 2;
    positions[i3 + 2] = (Math.random() - 0.5) * radius * 2;
    
    const color = new THREE.Color(1.0, 0.95, 0.88);
    color.lerp(new THREE.Color(0.75, 0.55, 1.0), Math.random());
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    sizes[i] = 0.3 + Math.random() * 0.4;
    twinkleSpeeds[i] = 0.1 + Math.random() * 0.3;
    twinkleOffsets[i] = Math.random() * Math.PI * 2;
  }
  
  return { positions, colors, sizes, twinkleSpeeds, twinkleOffsets };
}

export const StarfieldLayer: React.FC<StarfieldLayerProps> = ({
  count = 50000,
  distribution = 'spiral',
  mouse = new THREE.Vector2(0, 0),
  scroll = 0,
  intensity = 1.0,
  parallaxStrength = 1.0,
  gravityStrength = 0.6,
  audioReactive,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate positions based on distribution type
  const { positions, colors, sizes, twinkleSpeeds, twinkleOffsets } = useMemo(() => {
    switch (distribution) {
      case 'spiral':
        return generateSpiralPositions(count);
      case 'spherical':
        return generateSphericalPositions(count, 150, 300);
      case 'random':
        return generateRandomPositions(count, 200);
      default:
        return generateSpiralPositions(count);
    }
  }, [count, distribution]);
  
  // Create geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
    geom.setAttribute('aTwinkleOffset', new THREE.BufferAttribute(twinkleOffsets, 1));
    return geom;
  }, [positions, colors, sizes, twinkleSpeeds, twinkleOffsets]);
  
  // Create material
  const material = useMemo(() => createParticleMaterial(), []);
  
  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    materialRef.current.uniforms.uScroll.value = scroll;
    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uParallaxStrength.value = parallaxStrength;
    materialRef.current.uniforms.uGravityStrength.value = gravityStrength;
    materialRef.current.uniforms.uCursorPos.value.set(mouse.x * 10, mouse.y * 10);
    
    if (audioReactive) {
      materialRef.current.uniforms.uBass.value = audioReactive.bass || 0;
      materialRef.current.uniforms.uMid.value = audioReactive.mid || 0;
      materialRef.current.uniforms.uHigh.value = audioReactive.high || 0;
    }
    
    // Auto orbit
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={materialRef} />
    </points>
  );
};

