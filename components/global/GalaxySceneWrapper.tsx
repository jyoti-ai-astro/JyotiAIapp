/**
 * Galaxy Scene Wrapper Component
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 * 
 * Dynamically loads GalaxyScene with fallback loading shimmer
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { useScrollMotion, useMouseMotion } from '@/hooks/motion';
// Phase 29 - F44: Error boundary for GalaxyScene (using try-catch instead of react-error-boundary)

// Dynamic import with no SSR for Three.js components
const GalaxyScene = dynamic(
  () => import('@/cosmos/scenes/galaxy-scene').then((mod) => ({ default: mod.GalaxyScene })),
  {
    ssr: false,
  }
);

/**
 * Loading shimmer fallback
 */
function LoadingShimmer() {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-cosmic via-purple-900 to-cosmic">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Animated shimmer effect */}
          <div className="w-64 h-64 rounded-full bg-gradient-to-r from-gold/20 via-white/10 to-gold/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-sm font-heading">Loading Cosmic Experience...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface GalaxySceneWrapperProps {
  /** Intensity multiplier (0-1) */
  intensity?: number;
  
  /** Mouse position for parallax */
  mouse?: { x: number; y: number };
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Global fade (0-1) - controls scene fade-in/out */
  globalFade?: number;
}

export function GalaxySceneWrapper({
  intensity = 1.0,
  mouse: mouseProp = { x: 0, y: 0 },
  scroll: scrollProp = 0,
  audioReactive,
  globalFade = 1.0,
}: GalaxySceneWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Get scroll and mouse from orchestrator if available (with error handling)
  let scrollMotion = { scrollY: 0, scrollVelocity: 0, direction: 'none' as const, sectionProgress: {}, sectionActive: null };
  let mouseMotion = { mouseX: 0, mouseY: 0, deltaX: 0, deltaY: 0, velocity: 0, direction: 'none' as const };
  
  try {
    scrollMotion = useScrollMotion();
    mouseMotion = useMouseMotion();
  } catch (error) {
    console.warn('[GalaxySceneWrapper] Motion hooks error, using defaults:', error);
    // Use default values if hooks fail
  }
  
  // Use orchestrator values if available, fallback to props
  const scroll = scrollMotion.scrollY > 0 
    ? Math.min(scrollMotion.scrollY / (typeof window !== 'undefined' ? window.innerHeight * 2 : 1), 1)
    : scrollProp;
  const mouse = mouseMotion.mouseX !== 0 || mouseMotion.mouseY !== 0
    ? { 
        x: (mouseMotion.mouseX / (typeof window !== 'undefined' ? window.innerWidth : 1) - 0.5) * 2,
        y: (mouseMotion.mouseY / (typeof window !== 'undefined' ? window.innerHeight : 1) - 0.5) * 2,
      }
    : mouseProp;
  
  useEffect(() => {
    // Mark as loaded after a short delay to allow dynamic import to complete
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // If error occurred, show fallback
  if (hasError) {
    return (
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-cosmic via-purple-900 to-cosmic">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-sm font-heading">Cosmic scene unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      {isLoading && <LoadingShimmer />}
      {/* Phase 29 - F44: Error handling via try-catch in Canvas onError */}
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        onError={(error) => {
          // Phase 29 - F44: Handle R3F errors gracefully - freeze scene, disable animations
          console.warn('[GalaxyScene] Canvas error, scene frozen gracefully:', error);
          setHasError(true);
        }}
      >
        <Suspense fallback={null}>
          <GalaxyScene
            intensity={intensity * globalFade}
            mouse={mouse}
            scroll={scroll}
            audioReactive={audioReactive}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

