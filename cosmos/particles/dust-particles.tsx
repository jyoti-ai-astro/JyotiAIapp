/**
 * Quantum Dust Layer (Layer C)
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Ultra-tiny particles: speckles, mist dust, cosmic haze points
 * 5,000 particles (desktop) / 2,500 (mobile - 50% fallback)
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleNoiseFunctions } from './particle-system';

export interface DustParticlesProps {
  /** Number of particles */
  count?: number;
  
  /** Mouse position */
  mouse?: THREE.Vector2;
  
  /** Scroll position (intensity based on scroll depth) */
  scroll?: number;
  
  /** Intensity */
  intensity?: number;
  
  /** Audio reactive */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

// Dust particle vertex shader (very slow drift, random jitter)
const dustVertexShader = `
attribute float aSize;
attribute float aTwinkleSpeed;
attribute float aTwinkleOffset;
attribute vec3 aColor;

uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uIntensity;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

${particleNoiseFunctions}

void main() {
  vec3 pos = position;
  
  // Very slow drift
  pos += normal * fbm(pos * 0.05 + uTime * 0.02) * 0.1;
  
  // Random jitter
  float jitterX = sin(uTime * 4.0 + pos.x * 0.1) * 0.02;
  float jitterY = cos(uTime * 3.0 + pos.y * 0.1) * 0.02;
  pos.xy += vec2(jitterX, jitterY);
  
  // Scroll intensity affects position
  pos.z += uScroll * 0.05;
  
  // Tiny size
  float finalSize = aSize * 0.3;  // Ultra-tiny
  
  // Subtle twinkle
  vTwinkle = sin(uTime * aTwinkleSpeed + aTwinkleOffset) * 0.3 + 0.7;
  
  vColor = aColor;
  vDistance = length(pos);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = finalSize * (300.0 / -mvPosition.z) * uIntensity;
}
`;

// Dust particle fragment shader (speckle noise, flicker, low alpha fog)
const dustFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

${particleNoiseFunctions}

void main() {
  // Speckle noise
  float speckle = noise(vec3(gl_FragCoord.xy * 0.1, uTime * 0.1));
  speckle = smoothstep(0.3, 0.7, speckle);
  
  // Flicker noise
  float flicker = sin(uTime * 10.0 + gl_FragCoord.x * 0.1) * 0.1 + 0.9;
  
  // Color (haze-like)
  vec3 color = vColor * 0.8;
  color *= speckle * flicker;
  
  // Low alpha fog
  float fogAlpha = 1.0 - smoothstep(0.0, 50.0, vDistance);
  fogAlpha *= 0.15;  // Very low alpha
  
  // Scroll intensity affects alpha
  fogAlpha *= (0.5 + uScroll * 0.5);
  
  float alpha = vTwinkle * fogAlpha * uIntensity;
  
  gl_FragColor = vec4(color, alpha);
}
`;

// Create dust material
function createDustMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uIntensity: { value: 1.0 },
    },
    vertexShader: dustVertexShader,
    fragmentShader: dustFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
}

// Generate dust positions
function generateDustPositions(count: number): {
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
    
    // Random scatter in foreground
    positions[i3] = (Math.random() - 0.5) * 80;
    positions[i3 + 1] = (Math.random() - 0.5) * 80;
    positions[i3 + 2] = (Math.random() - 0.5) * 40;
    
    // Haze color (very subtle)
    const color = new THREE.Color(0.9, 0.85, 1.0);
    color.multiplyScalar(0.6);
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    sizes[i] = 0.2 + Math.random() * 0.2;  // Ultra-tiny
    twinkleSpeeds[i] = 0.2 + Math.random() * 0.3;
    twinkleOffsets[i] = Math.random() * Math.PI * 2;
  }
  
  return { positions, colors, sizes, twinkleSpeeds, twinkleOffsets };
}

export const DustParticles: React.FC<DustParticlesProps> = ({
  count = 5000,
  mouse = new THREE.Vector2(0, 0),
  scroll = 0,
  intensity = 1.0,
  audioReactive,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate positions
  const { positions, colors, sizes, twinkleSpeeds, twinkleOffsets } = useMemo(
    () => generateDustPositions(count),
    [count]
  );
  
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
  const material = useMemo(() => createDustMaterial(), []);
  
  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    materialRef.current.uniforms.uScroll.value = scroll;
    materialRef.current.uniforms.uIntensity.value = intensity;
  });
  
  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={materialRef} />
    </points>
  );
};

