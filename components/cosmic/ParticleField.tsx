/**
 * Particle Field Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * 2000-5000 particles with slow cosmic wind drift and cursor-reactive movement
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  intensity?: number;
}

export const ParticleField = React.memo(function ParticleField({ count = 3000, intensity = 1.0 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random positions in a sphere
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current && geometry) {
      const positions = geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Slow cosmic wind drift
        positions[i3] += Math.sin(time * 0.1 + i) * 0.0001;
        positions[i3 + 1] += Math.cos(time * 0.15 + i) * 0.0001;
        positions[i3 + 2] += Math.sin(time * 0.12 + i) * 0.0001;

        // Cursor-reactive movement (subtle)
        const mouseX = state.mouse.x * 0.01;
        const mouseY = state.mouse.y * 0.01;
        positions[i3] += mouseX * 0.0001;
        positions[i3 + 1] += mouseY * 0.0001;

        // Wrap around if out of bounds
        if (Math.abs(positions[i3]) > 5) positions[i3] *= -0.9;
        if (Math.abs(positions[i3 + 1]) > 5) positions[i3 + 1] *= -0.9;
        if (Math.abs(positions[i3 + 2]) > 5) positions[i3 + 2] *= -0.9;
      }

      geometry.attributes.position.needsUpdate = true;
    }
  });

  const pointsMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#F2C94C',
      size: 0.005,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6 * intensity,
      depthWrite: false,
    });
  }, [intensity]);

  return (
    <points ref={pointsRef} geometry={geometry} material={pointsMaterial} />
  );
});

