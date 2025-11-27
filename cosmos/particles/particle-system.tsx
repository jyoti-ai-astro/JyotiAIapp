/**
 * Base Particle System Component
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Core particle system architecture with InstancedMesh
 * Shared utilities and base functionality
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ParticleSystemProps {
  /** Number of particles */
  count: number;
  
  /** Particle size */
  size?: number;
  
  /** Mouse position for parallax */
  mouse?: THREE.Vector2;
  
  /** Scroll position */
  scroll?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Gravity strength (cursor attraction) */
  gravityStrength?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Custom geometry */
  geometry?: THREE.BufferGeometry;
  
  /** Custom material */
  material?: THREE.Material;
  
  /** Position generator function */
  generatePositions?: (count: number) => Float32Array;
  
  /** Custom update function */
  onUpdate?: (positions: Float32Array, time: number) => void;
}

// Shared noise function for GLSL
export const particleNoiseFunctions = `
// Simplified noise for particles
float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float n = i.x + i.y * 57.0 + 113.0 * i.z;
  return mix(
    mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
        mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
        mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`;

// Base particle vertex shader
export const particleVertexShader = `
attribute float aSize;
attribute float aTwinkleSpeed;
attribute float aTwinkleOffset;
attribute vec3 aColor;

uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uIntensity;
uniform float uParallaxStrength;
uniform float uGravityStrength;
uniform vec2 uCursorPos;
uniform float uBass;
uniform float uMid;
uniform float uHigh;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

${particleNoiseFunctions}

void main() {
  vec3 pos = position;
  
  // Noise-driven drift
  float n = fbm(pos * 0.1 + uTime * 0.08);
  pos += normal * n * 0.5;
  
  // Parallax from mouse
  float depthFactor = 1.0 - (length(pos) / 50.0);  // Normalize depth
  pos.xy += uMouse.xy * (0.001 * depthFactor * uParallaxStrength);
  
  // Scroll drift
  pos.z += uScroll * 0.1;
  
  // Cursor gravity (subtle attraction)
  vec2 toCursor = uCursorPos - pos.xy;
  float distToCursor = length(toCursor);
  float gravity = uGravityStrength * 0.05 / (distToCursor + 1.0);
  pos.xy += normalize(toCursor) * gravity;
  
  // Audio-reactive motion amplitude (mid frequencies)
  pos += normal * uMid * 0.2;
  
  // Scale pulsation
  float pulse = sin(uTime * 0.2 + n * 5.0) * 0.3;
  float finalSize = aSize + pulse;
  
  // Audio-reactive: bass affects scale
  finalSize *= (1.0 + uBass * 0.2);
  
  // Twinkle calculation
  vTwinkle = sin(uTime * aTwinkleSpeed + aTwinkleOffset) * 0.5 + 0.5;
  vTwinkle *= (1.0 + uHigh * 0.3);  // High frequencies affect twinkle speed
  
  vColor = aColor;
  vDistance = length(pos);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = finalSize * (300.0 / -mvPosition.z) * uIntensity;
}
`;

// Base particle fragment shader
export const particleFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBass;
uniform float uHigh;

varying vec3 vColor;
varying float vTwinkle;
varying float vDistance;

void main() {
  // Twinkle effect
  float twinkle = vTwinkle;
  float glow = smoothstep(0.95, 1.0, twinkle);
  
  // Color palette
  vec3 palette1 = vec3(1.0, 0.95, 0.88);  // Aura white
  vec3 palette2 = vec3(0.75, 0.55, 1.0);  // Mystic purple
  vec3 palette3 = vec3(1.0, 0.78, 0.37);  // Sacred gold
  
  vec3 color = mix(palette1, palette2, twinkle);
  color = mix(color, palette3, glow * 0.4);
  
  // Blend with vertex color
  color = mix(color, vColor, 0.6);
  
  // Audio-reactive brightness (bass)
  color *= (1.0 + uBass * 0.3);
  
  // Distance fade
  float fade = 1.0 - smoothstep(0.0, 100.0, vDistance);
  
  // Final color
  vec3 finalColor = color * uIntensity * fade;
  float alpha = twinkle * fade * uIntensity;
  
  // High frequencies add shimmer
  alpha *= (1.0 + uHigh * 0.2);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Base particle material
export function createParticleMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uIntensity: { value: 1.0 },
      uParallaxStrength: { value: 1.0 },
      uGravityStrength: { value: 0.6 },
      uCursorPos: { value: new THREE.Vector2(0, 0) },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
}
