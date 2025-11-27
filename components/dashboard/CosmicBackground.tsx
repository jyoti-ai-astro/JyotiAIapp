/**
 * Cosmic Background Component
 * 
 * Master Plan v1.0 - Section 3.1: Dashboard Background
 * Subtle R3F stars + nebula background (5% opacity)
 * Aurora Flow (GLSL shader) at top edge
 */

'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Subtle starfield component
function SubtleStars() {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={300}
      depth={50}
      count={2000}
      factor={2}
      saturation={0.3}
      fade
      speed={0.1}
    />
  );
}

// Subtle nebula cloud (very low opacity)
function SubtleNebula() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
      meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -100]}>
      <planeGeometry args={[200, 200]} />
      <MeshDistortMaterial
        color="#6E2DEB"
        opacity={0.03}
        transparent
        distort={0.3}
        speed={0.5}
      />
    </mesh>
  );
}

// Aurora flow at top edge
function AuroraFlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 5, -50]}>
      <planeGeometry args={[100, 2]} />
      <shaderMaterial
        transparent
        opacity={0.1}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            float wave = sin(uv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
            vec3 color = mix(
              vec3(0.09, 0.91, 0.96), // Aura Cyan
              vec3(0.43, 0.18, 0.87), // Cosmic Purple
              wave
            );
            gl_FragColor = vec4(color, wave * 0.1);
          }
        `}
        uniforms={{
          time: { value: 0 },
        }}
      />
    </mesh>
  );
}

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#020916']} />
        <SubtleStars />
        <SubtleNebula />
        <AuroraFlow />
      </Canvas>
    </div>
  );
}

