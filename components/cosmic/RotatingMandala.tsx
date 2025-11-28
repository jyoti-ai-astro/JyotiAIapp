/**
 * Rotating Mandala Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Sacred geometry pattern with 0.1 deg/sec rotation and gold outline glow
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RotatingMandalaProps {
  speed?: number;
  intensity?: number;
}

export function RotatingMandala({ speed = 0.1, intensity = 1.0 }: RotatingMandalaProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += (speed * Math.PI) / 180 / 60; // 0.1 deg/sec
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[2.8, 3, 64]} />
        <meshBasicMaterial
          color="#F2C94C"
          transparent
          opacity={0.2 * intensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Middle ring */}
      <mesh>
        <ringGeometry args={[1.8, 2, 64]} />
        <meshBasicMaterial
          color="#6E2DEB"
          transparent
          opacity={0.15 * intensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner ring */}
      <mesh>
        <ringGeometry args={[0.8, 1, 64]} />
        <meshBasicMaterial
          color="#17E8F6"
          transparent
          opacity={0.1 * intensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Central point */}
      <mesh>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#F2C94C" />
      </mesh>

      {/* Sacred geometry lines */}
      {useMemo(() => {
        const lineMaterial = new THREE.LineBasicMaterial({
          color: '#F2C94C',
          transparent: true,
          opacity: 0.3 * intensity,
        });

        return [...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const geo = new THREE.BufferGeometry();
          const positions = new Float32Array([
            0, 0, 0,
            Math.cos(angle) * 3, Math.sin(angle) * 3, 0,
          ]);
          geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

          return (
            <line key={i} geometry={geo} material={lineMaterial} />
          );
        });
      }, [intensity])}
    </group>
  );
}

