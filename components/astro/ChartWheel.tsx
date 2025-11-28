/**
 * Chart Wheel Component
 * 
 * Batch 3 - Astro Components
 * 
 * Sacred geometry chart wheel visualization
 */

'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ChartWheelProps {
  chartType: 'D1' | 'D9' | 'D10';
  grahas?: any[];
  className?: string;
}

export const ChartWheel: React.FC<ChartWheelProps> = ({
  chartType,
  grahas = [],
  className,
}) => {
  return (
    <div className={`w-full h-96 bg-white/5 rounded-lg border border-white/10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {/* Outer Ring */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[3, 3.2, 64]} />
            <meshBasicMaterial color="#F2C94C" side={THREE.DoubleSide} transparent opacity={0.3} />
          </mesh>
          
          {/* Inner Ring */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[2, 2.2, 64]} />
            <meshBasicMaterial color="#6E2DEB" side={THREE.DoubleSide} transparent opacity={0.2} />
          </mesh>
          
          {/* Central Point */}
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#17E8F6" />
          </mesh>
          
          <OrbitControls enableZoom={true} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

