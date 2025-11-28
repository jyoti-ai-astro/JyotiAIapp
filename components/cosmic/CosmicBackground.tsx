/**
 * Optimized Cosmic Background Component
 * 
 * Memoized R3F scene with performance optimizations
 */

'use client';

import React, { Suspense, memo, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { NebulaShader } from './NebulaShader';
import { ParticleField } from './ParticleField';
import { RotatingMandala } from './RotatingMandala';

interface CosmicBackgroundProps {
  intensity?: number;
  particleCount?: number;
  showMandala?: boolean;
  className?: string;
}

const R3FFallback = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-cosmic-navy via-cosmic-indigo to-cosmic-purple" />
));

R3FFallback.displayName = 'R3FFallback';

export const CosmicBackground = memo(function CosmicBackground({
  intensity = 1.0,
  particleCount,
  showMandala = true,
  className = '',
}: CosmicBackgroundProps) {
  // Optimize particle count based on device (50% reduction for mobile)
  const optimizedParticleCount = useMemo(() => {
    if (particleCount !== undefined) return particleCount;
    
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      
      if (isMobile) return 1000; // 50% reduction
      if (isTablet) return 2000;
      return 3000;
    }
    
    return 3000;
  }, [particleCount]);

  // Limit shader resolution for mobile
  const pixelRatio = useMemo(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      return isMobile ? 1 : 2; // Lower DPR for mobile
    }
    return 2;
  }, []);

  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ 
          antialias: typeof window !== 'undefined' && window.innerWidth >= 768, // Disable antialiasing on mobile
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, pixelRatio]} // Limit pixel ratio for mobile
      >
        <Suspense fallback={null}>
          <NebulaShader intensity={intensity} />
          <ParticleField count={optimizedParticleCount} intensity={intensity} />
          {showMandala && <RotatingMandala speed={0.1} intensity={intensity * 0.8} />}
        </Suspense>
      </Canvas>
    </div>
  );
});

CosmicBackground.displayName = 'CosmicBackground';

