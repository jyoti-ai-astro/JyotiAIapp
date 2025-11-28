/**
 * Nebula Shader Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Purple-indigo gradient nebula with noise-based cloud patterns
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uMouse;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Parallax from mouse
    uv.x += uMouse.x * 0.03;
    uv.y += uMouse.y * 0.02;
    
    // Slow drift animation
    float t = uTime * 0.2;
    
    // Base fog field
    float fog = fbm(uv * 0.3 + t * 0.005);
    
    // Deep Space Navy → Cosmic Indigo → Mystic Violet
    vec3 color1 = vec3(0.03, 0.02, 0.10);  // Deep Space Navy
    vec3 color2 = vec3(0.09, 0.05, 0.22);  // Cosmic Indigo
    vec3 color3 = vec3(0.18, 0.08, 0.45);  // Mystic Violet
    
    vec3 fogColor = mix(color1, color2, fog);
    fogColor = mix(fogColor, color3, fog * 0.6);
    
    // Fractal nebula clouds
    float n = fbm(uv * 1.2 + t * 0.12);
    float clouds = smoothstep(0.3, 0.7, n);
    
    // Purple → Pink → Gold gradient
    vec3 purple = vec3(0.45, 0.20, 0.75);  // Sacred Purple
    vec3 pink = vec3(0.75, 0.35, 0.85);
    vec3 gold = vec3(1.0, 0.70, 0.30);  // Spiritual Gold
    
    vec3 cloudColor = mix(purple, pink, clouds * 0.5);
    cloudColor = mix(cloudColor, gold, clouds * 0.3);
    
    // Blend fog and clouds
    vec3 finalColor = mix(fogColor, cloudColor, clouds * 0.6);
    
    // Apply intensity
    finalColor *= uIntensity;
    
    // Opacity
    float alpha = (fog * 0.45 + clouds * 0.35) * uIntensity;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function NebulaShader({ intensity = 1.0 }: { intensity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [intensity]);

  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uIntensity.value = intensity;
      material.uniforms.uMouse.value = new THREE.Vector2(
        state.mouse.x,
        state.mouse.y
      );
    }
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, 0]} />
  );
}

