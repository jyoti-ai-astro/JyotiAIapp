/**
 * Energy Particle Field (Layer B)
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Kundalini sparks, golden dust, chakra energy bursts
 * 20,000 particles (desktop) / 8,000 (mobile)
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createParticleMaterial, particleNoiseFunctions } from './particle-system';

export interface EnergyParticlesProps {
  /** Number of particles */
  count?: number;
  
  /** Mouse position */
  mouse?: THREE.Vector2;
  
  /** Scroll position */
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

// Energy particle vertex shader (upward drift, noise hover)
const energyVertexShader = `
attribute float aSize;
attribute float aTwinkleSpeed;
attribute float aTwinkleOffset;
attribute vec3 aColor;

uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uIntensity;
uniform float uBass;
uniform float uMid;
uniform float uHigh;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

${particleNoiseFunctions}

void main() {
  vec3 pos = position;
  
  // Upward drift (slow)
  pos.y += uTime * 0.02;
  
  // Noise-driven hover
  float n = fbm(pos * 0.2 + uTime * 0.1);
  pos += normal * n * 0.3;
  
  // Pulse on bass frequencies
  float bassPulse = sin(uTime * 2.0 + n * 10.0) * uBass * 0.5;
  pos += normal * bassPulse;
  
  // Parallax
  pos.xy += uMouse.xy * 0.001;
  
  // Scale
  float finalSize = aSize * (1.0 + uBass * 0.3);
  
  // Twinkle
  vTwinkle = sin(uTime * aTwinkleSpeed + aTwinkleOffset) * 0.5 + 0.5;
  vTwinkle *= (1.0 + uHigh * 0.4);
  
  vColor = aColor;
  vDistance = length(pos);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = finalSize * (300.0 / -mvPosition.z) * uIntensity;
}
`;

// Energy particle fragment shader (color shift purple → gold)
const energyFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBass;
uniform float uHigh;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

void main() {
  // Color shift from purple → gold
  vec3 purple = vec3(0.75, 0.55, 1.0);  // Mystic purple
  vec3 gold = vec3(1.0, 0.78, 0.37);    // Sacred gold
  
  float colorShift = vTwinkle * 0.5 + 0.5;
  vec3 color = mix(purple, gold, colorShift);
  
  // Blend with vertex color
  color = mix(color, vColor, 0.4);
  
  // Additive glow
  float glow = smoothstep(0.9, 1.0, vTwinkle);
  color += gold * glow * 0.5;
  
  // Audio-reactive brightness
  color *= (1.0 + uBass * 0.4);
  
  // Distance fog fade
  float fade = 1.0 - smoothstep(0.0, 80.0, vDistance);
  
  vec3 finalColor = color * uIntensity * fade;
  float alpha = vTwinkle * fade * uIntensity * (1.0 + uHigh * 0.3);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Create energy particle material
function createEnergyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uIntensity: { value: 1.0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
    },
    vertexShader: energyVertexShader,
    fragmentShader: energyFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
}

// Generate energy particle positions
function generateEnergyPositions(count: number): {
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
    
    // Random distribution in mid-range
    positions[i3] = (Math.random() - 0.5) * 100;
    positions[i3 + 1] = (Math.random() - 0.5) * 60 - 20;  // Slightly lower
    positions[i3 + 2] = (Math.random() - 0.5) * 100;
    
    // Color: purple to gold gradient
    const colorMix = Math.random();
    const color = new THREE.Color(0.75, 0.55, 1.0);  // Purple
    color.lerp(new THREE.Color(1.0, 0.78, 0.37), colorMix);  // Gold
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    sizes[i] = 0.7 + Math.random() * 0.6;
    twinkleSpeeds[i] = 0.4 + Math.random() * 0.4;  // Medium frequency
    twinkleOffsets[i] = Math.random() * Math.PI * 2;
  }
  
  return { positions, colors, sizes, twinkleSpeeds, twinkleOffsets };
}

export const EnergyParticles: React.FC<EnergyParticlesProps> = ({
  count = 20000,
  mouse = new THREE.Vector2(0, 0),
  scroll = 0,
  intensity = 1.0,
  audioReactive,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate positions
  const { positions, colors, sizes, twinkleSpeeds, twinkleOffsets } = useMemo(
    () => generateEnergyPositions(count),
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
  const material = useMemo(() => createEnergyMaterial(), []);
  
  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    materialRef.current.uniforms.uScroll.value = scroll;
    materialRef.current.uniforms.uIntensity.value = intensity;
    
    if (audioReactive) {
      materialRef.current.uniforms.uBass.value = audioReactive.bass || 0;
      materialRef.current.uniforms.uMid.value = audioReactive.mid || 0;
      materialRef.current.uniforms.uHigh.value = audioReactive.high || 0;
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={materialRef} />
    </points>
  );
};
