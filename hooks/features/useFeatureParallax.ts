/**
 * Feature Parallax Hook
 * 
 * Phase 3 — Section 18: PAGES PHASE 3 (F18)
 * 
 * Provides parallax depth effects for feature modules
 */

'use client';

import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface UseFeatureParallaxOptions {
  /** Parallax intensity (0-1) */
  intensity?: number;
  
  /** Depth layer (0 = front, 1 = back) */
  depth?: number;
}

export function useFeatureParallax(options: UseFeatureParallaxOptions = {}) {
  const { intensity = 0.3, depth = 0.5 } = options;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  // Apply depth-based parallax
  const parallaxX = useTransform(springX, (value) => value * intensity * (1 - depth));
  const parallaxY = useTransform(springY, (value) => value * intensity * (1 - depth));
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      mouseX.set(x * 100);
      mouseY.set(y * 100);
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  return {
    parallaxX,
    parallaxY,
    mousePosition,
  };
}

