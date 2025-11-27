/**
 * Orbital Particles (Layer D)
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Planetary/Chakra rings with circular orbits
 * 3 rings × 1,200 particles each = 3,600 particles
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleNoiseFunctions } from './particle-system';

export interface OrbitalParticlesProps {
  /** Number of rings */
  ringCount?: number;
  
  /** Particles per ring */
  particlesPerRing?: number;
  
  /** Mouse position */
  mouse?: THREE.Vector2;
  
  /** Scroll position */
  scroll?: number;
  
  /** Intensity */
  intensity?: number;
  
  /** Orbit speed multiplier */
  orbitSpeed?: number;
  
  /** Audio reactive */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

// Orbital particle vertex shader (circular orbits with noise offsets)
const orbitalVertexShader = `
attribute float aSize;
attribute float aAngle;
attribute float aRadius;
attribute float aOrbitSpeed;
attribute vec3 aColor;

uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uIntensity;
uniform float uOrbitSpeed;
uniform float uBass;
uniform float uMid;
uniform float uHigh;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

${particleNoiseFunctions}

void main() {
  // Base angle with orbit speed
  float angle = aAngle + uTime * aOrbitSpeed * uOrbitSpeed;
  
  // Noise offset for organic feel
  float noiseOffset = fbm(vec3(angle, aRadius, uTime * 0.1)) * 0.1;
  angle += noiseOffset;
  
  // Circular orbit
  float x = cos(angle) * aRadius;
  float z = sin(angle) * aRadius;
  float y = 0.0;
  
  // Scroll affects orbit
  y += uScroll * 2.0;
  
  // Mouse interaction (orbit reacts to scroll/mouse)
  float mouseInfluence = (uMouse.x + uMouse.y) * 0.01;
  angle += mouseInfluence;
  x = cos(angle) * aRadius;
  z = sin(angle) * aRadius;
  
  // Audio-reactive: mid affects orbit radius
  float radiusMod = 1.0 + uMid * 0.1;
  x *= radiusMod;
  z *= radiusMod;
  
  vec3 pos = vec3(x, y, z);
  
  // Scale
  float finalSize = aSize * (1.0 + uBass * 0.2);
  
  // Twinkle
  vTwinkle = sin(uTime * 2.0 + angle * 5.0) * 0.5 + 0.5;
  vTwinkle *= (1.0 + uHigh * 0.3);
  
  vColor = aColor;
  vDistance = length(pos);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = finalSize * (300.0 / -mvPosition.z) * uIntensity;
}
`;

// Orbital particle fragment shader (chakra colors)
const orbitalFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBass;
uniform float uHigh;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

void main() {
  vec3 color = vColor;
  
  // Glow effect
  float glow = smoothstep(0.8, 1.0, vTwinkle);
  color += vColor * glow * 0.5;
  
  // Audio-reactive brightness
  color *= (1.0 + uBass * 0.3);
  
  // Distance fade
  float fade = 1.0 - smoothstep(0.0, 60.0, vDistance);
  
  vec3 finalColor = color * uIntensity * fade;
  float alpha = vTwinkle * fade * uIntensity * (1.0 + uHigh * 0.2);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Create orbital material
function createOrbitalMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uIntensity: { value: 1.0 },
      uOrbitSpeed: { value: 1.0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
    },
    vertexShader: orbitalVertexShader,
    fragmentShader: orbitalFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
}

// Chakra colors
const chakraColors = [
  new THREE.Color(1.0, 0.42, 0.42),    // Root - Red
  new THREE.Color(1.0, 0.60, 0.40),    // Sacral - Orange
  new THREE.Color(1.0, 0.85, 0.40),   // Solar - Yellow
  new THREE.Color(0.60, 1.0, 0.80),   // Heart - Green
  new THREE.Color(0.40, 0.80, 1.0),   // Throat - Blue
  new THREE.Color(0.60, 0.40, 1.0),   // Third Eye - Indigo
  new THREE.Color(1.0, 0.60, 1.0),    // Crown - Violet
];

// Generate orbital positions
function generateOrbitalPositions(
  ringCount: number,
  particlesPerRing: number
): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  angles: Float32Array;
  radii: Float32Array;
  orbitSpeeds: Float32Array;
} {
  const totalCount = ringCount * particlesPerRing;
  const positions = new Float32Array(totalCount * 3);
  const colors = new Float32Array(totalCount * 3);
  const sizes = new Float32Array(totalCount);
  const angles = new Float32Array(totalCount);
  const radii = new Float32Array(totalCount);
  const orbitSpeeds = new Float32Array(totalCount);
  
  const baseRadii = [20, 25, 30];
  const baseSpeeds = [0.02, 0.015, 0.01];
  
  for (let ring = 0; ring < ringCount; ring++) {
    const radius = baseRadii[ring] || 20 + ring * 5;
    const speed = baseSpeeds[ring] || 0.01;
    const chakraColor = chakraColors[ring % chakraColors.length];
    
    for (let i = 0; i < particlesPerRing; i++) {
      const index = ring * particlesPerRing + i;
      const i3 = index * 3;
      
      // Angle for zodiac alignment (12 segments)
      const angle = (i / particlesPerRing) * Math.PI * 2;
      
      angles[index] = angle;
      radii[index] = radius;
      orbitSpeeds[index] = speed;
      
      // Initial position (will be updated in shader)
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Chakra color
      colors[i3] = chakraColor.r;
      colors[i3 + 1] = chakraColor.g;
      colors[i3 + 2] = chakraColor.b;
      
      sizes[index] = 0.8 + Math.random() * 0.4;
    }
  }
  
  return { positions, colors, sizes, angles, radii, orbitSpeeds };
}

export const OrbitalParticles: React.FC<OrbitalParticlesProps> = ({
  ringCount = 3,
  particlesPerRing = 1200,
  mouse = new THREE.Vector2(0, 0),
  scroll = 0,
  intensity = 1.0,
  orbitSpeed = 1.0,
  audioReactive,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate positions
  const { positions, colors, sizes, angles, radii, orbitSpeeds } = useMemo(
    () => generateOrbitalPositions(ringCount, particlesPerRing),
    [ringCount, particlesPerRing]
  );
  
  // Create geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    geom.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geom.setAttribute('aOrbitSpeed', new THREE.BufferAttribute(orbitSpeeds, 1));
    return geom;
  }, [positions, colors, sizes, angles, radii, orbitSpeeds]);
  
  // Create material
  const material = useMemo(() => createOrbitalMaterial(), []);
  
  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Update uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    materialRef.current.uniforms.uScroll.value = scroll;
    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uOrbitSpeed.value = orbitSpeed;
    
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

