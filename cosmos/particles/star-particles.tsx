/**
 * Star Particles Component
 * 
 * Phase 2 — Section 2: Galaxy Scene Blueprint
 * Phase 2 — Section 4: Particle Universe Engine
 * 
 * InstancedMesh star particle system with twinkle animation
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface StarParticlesProps {
  /** Number of stars (Phase 27 - F42: Reduced by 15-20% for performance) */
  count?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Mouse position for parallax */
  mouse?: THREE.Vector2;
  
  /** Cursor velocity for particle displacement (Phase 12 - F27) */
  cursorVelocity?: { x: number; y: number };
  
  /** Cursor proximity for gravitational pull (Phase 12 - F27) */
  cursorProximity?: number;
  
  /** Speed multiplier for drift */
  speed?: number;
  
  /** Blessing wave progress for radial push (Phase 13 - F28) */
  blessingWaveProgress?: number;
}

// Generate spiral galaxy star positions
function generateStarPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinkleOffsets = new Float32Array(count);
  
  // Galaxy parameters
  const a = 0.4;  // Spiral tightness
  const b = 0.22; // Spiral growth rate
  const galaxyRadius = 12;
  const coreRadius = 1.2;
  const thickness = 0.5;
  
  // Color gradients
  const coreColor = new THREE.Color(1.0, 0.98, 0.90);  // Mystic Gold / Cosmic White
  const midColor = new THREE.Color(0.725, 0.588, 1.0);  // Violet
  const outerColor = new THREE.Color(0.314, 0.275, 0.549);  // Deep Navy / Purple Mist
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Spiral distribution
    const theta = Math.random() * Math.PI * 2 * 5;  // 0 to 5 full rotations
    const radius = a * Math.exp(b * theta);
    const clampedRadius = Math.min(radius, galaxyRadius);
    
    // Random angle for spiral arm
    const armAngle = (Math.floor(Math.random() * 4) * Math.PI * 2) / 4;  // 4 arms
    const angle = theta + armAngle;
    
    // Position
    const x = Math.cos(angle) * clampedRadius;
    const y = (Math.random() - 0.5) * thickness;
    const z = Math.sin(angle) * clampedRadius;
    
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    
    // Color based on radius
    const normalizedRadius = clampedRadius / galaxyRadius;
    let color: THREE.Color;
    
    if (normalizedRadius < 0.1) {
      // Core stars (25%)
      color = coreColor.clone();
      sizes[i] = 0.8 + Math.random() * 0.8;  // 0.8-1.6px
    } else if (normalizedRadius < 0.7) {
      // Spiral stars (60%)
      color = midColor.clone().lerp(outerColor, (normalizedRadius - 0.1) / 0.6);
      sizes[i] = 0.5 + Math.random() * 0.8;  // 0.5-1.3px
    } else {
      // Distant dust (15%)
      color = outerColor.clone();
      sizes[i] = 0.3 + Math.random() * 0.2;  // 0.3-0.5px
    }
    
    // Add slight color variation
    color.lerp(new THREE.Color(1, 1, 1), Math.random() * 0.2);
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    
    // Twinkle parameters
    twinkleSpeeds[i] = 0.5 + Math.random() * 1.5;  // 0.5-2.0
    twinkleOffsets[i] = Math.random() * Math.PI * 2;
  }
  
  return { positions, colors, sizes, twinkleSpeeds, twinkleOffsets };
}

export const StarParticles: React.FC<StarParticlesProps> = ({
  count = 42500, // Phase 27 - F42: Reduced by 15% (from 50000) for performance
  intensity = 1.0,
  mouse = new THREE.Vector2(0, 0),
  cursorVelocity = { x: 0, y: 0 },
  cursorProximity = 0,
  speed = 0,
  blessingWaveProgress = 0,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const positionsRef = useRef<Float32Array | null>(null);
  
  // Generate star positions
  const { positions, colors, sizes, twinkleSpeeds, twinkleOffsets } = useMemo(
    () => {
      const data = generateStarPositions(count);
      positionsRef.current = data.positions;
      return data;
    },
    [count]
  );
  
  // Create geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
    geom.setAttribute('twinkleOffset', new THREE.BufferAttribute(twinkleOffsets, 1));
    return geom;
  }, [positions, colors, sizes, twinkleSpeeds, twinkleOffsets]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!pointsRef.current || !materialRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Slow rotation of entire galaxy + speed-based drift
    pointsRef.current.rotation.y += 0.0002 + speed;
    
    // Parallax effect from mouse
    if (mouse) {
      pointsRef.current.rotation.y += mouse.x * 0.0008;
      pointsRef.current.rotation.x += mouse.y * 0.0005;
    }
    
    // Cursor → Particle Interaction (Phase 12 - F27)
    // Apply cursor velocity displacement
    if (cursorVelocity && (Math.abs(cursorVelocity.x) > 0.001 || Math.abs(cursorVelocity.y) > 0.001)) {
      const displacementX = cursorVelocity.x * 0.0001;
      const displacementY = cursorVelocity.y * 0.0001;
      pointsRef.current.rotation.y += displacementX;
      pointsRef.current.rotation.x += displacementY;
    }
    
    // Cursor proximity gravitational pull
    if (cursorProximity > 0 && positionsRef.current && geometry) {
      const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      if (positionAttr) {
        const positions = positionAttr.array as Float32Array;
        const cursorX = mouse.x * 5; // Scale to scene space
        const cursorY = mouse.y * 5;
        
        // Apply gravitational pull to nearby particles
        for (let i = 0; i < positions.length; i += 3) {
          const dx = cursorX - positions[i];
          const dy = cursorY - positions[i + 1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 2.0 && distance > 0.01) {
            const pullStrength = cursorProximity * (1.0 - distance / 2.0);
            positions[i] += (dx / distance) * pullStrength * 0.01;
            positions[i + 1] += (dy / distance) * pullStrength * 0.01;
          }
        }
        
        positionAttr.needsUpdate = true;
      }
    }
    
    // Update material for twinkle effect
    // Note: Individual star twinkling would require custom shader
    // For now, we use a global opacity pulse
    const globalTwinkle = 0.8 + 0.2 * Math.sin(time * 0.5);
    if (materialRef.current) {
      materialRef.current.opacity = globalTwinkle * intensity;
    }
  });
  
  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={true}> {/* Phase 27 - F42: Enable frustum culling */}
      <pointsMaterial
        ref={materialRef}
        vertexColors
        size={1.0}
        sizeAttenuation={true}
        transparent
        opacity={intensity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
