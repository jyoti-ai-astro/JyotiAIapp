/**
 * Particle Universe Engine - Unified Component
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Complete 4-layer particle system:
 * - Layer A: Stellar Starfield
 * - Layer B: Energy Particle Field
 * - Layer C: Quantum Dust Layer
 * - Layer D: Orbital Particles
 */

'use client';

import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { StarfieldLayer } from './starfield-layer';
import { EnergyParticles } from './energy-particles';
import { DustParticles } from './dust-particles';
import { OrbitalParticles } from './orbital-particles';

export interface ParticleUniverseProps {
  /** Mouse position for parallax and gravity */
  mouse?: { x: number; y: number };
  
  /** Scroll position */
  scroll?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Gravity strength (cursor attraction) */
  gravityStrength?: number;
  
  /** Orbit speed multiplier */
  orbitSpeed?: number;
}

export const ParticleUniverse: React.FC<ParticleUniverseProps> = ({
  mouse = { x: 0, y: 0 },
  scroll = 0,
  audioReactive,
  intensity = 1.0,
  parallaxStrength = 1.0,
  gravityStrength = 0.6,
  orbitSpeed = 1.0,
}) => {
  const { size } = useThree();
  
  // Convert mouse to Vector2
  const mouseVec = useMemo(
    () => new THREE.Vector2(mouse.x, mouse.y),
    [mouse.x, mouse.y]
  );
  
  // Performance: Reduce particle counts on mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return size.width < 800;
  }, [size.width]);
  
  // Particle counts (desktop vs mobile)
  const starfieldCount = useMemo(() => (isMobile ? 20000 : 50000), [isMobile]);
  const energyCount = useMemo(() => (isMobile ? 8000 : 20000), [isMobile]);
  const dustCount = useMemo(() => (isMobile ? 2500 : 5000), [isMobile]);  // 50% fallback
  
  return (
    <group>
      {/* Layer A: Stellar Starfield (Base Layer) */}
      <StarfieldLayer
        count={starfieldCount}
        distribution="spiral"
        mouse={mouseVec}
        scroll={scroll}
        intensity={intensity}
        parallaxStrength={parallaxStrength}
        gravityStrength={gravityStrength}
        audioReactive={audioReactive}
      />
      
      {/* Layer B: Energy Particle Field */}
      <EnergyParticles
        count={energyCount}
        mouse={mouseVec}
        scroll={scroll}
        intensity={intensity}
        audioReactive={audioReactive}
      />
      
      {/* Layer C: Quantum Dust Layer */}
      <DustParticles
        count={dustCount}
        mouse={mouseVec}
        scroll={scroll}
        intensity={intensity}
        audioReactive={audioReactive}
      />
      
      {/* Layer D: Orbital Particles (Planetary/Chakra Rings) */}
      <OrbitalParticles
        ringCount={3}
        particlesPerRing={1200}
        mouse={mouseVec}
        scroll={scroll}
        intensity={intensity}
        orbitSpeed={orbitSpeed}
        audioReactive={audioReactive}
      />
    </group>
  );
};

