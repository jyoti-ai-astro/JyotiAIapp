/**
 * Feature Glow Hook
 * 
 * Phase 3 — Section 18: PAGES PHASE 3 (F18)
 * 
 * Provides glow aura system for feature modules
 */

'use client';

import { useState, useEffect } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface UseFeatureGlowOptions {
  /** Base glow intensity (0-1) */
  baseIntensity?: number;
  
  /** Hover glow intensity multiplier */
  hoverMultiplier?: number;
  
  /** Pulse animation enabled */
  pulse?: boolean;
  
  /** Pulse speed (seconds) */
  pulseSpeed?: number;
}

export function useFeatureGlow(options: UseFeatureGlowOptions = {}) {
  const {
    baseIntensity = 0.3,
    hoverMultiplier = 2,
    pulse = true,
    pulseSpeed = 2,
  } = options;
  
  const [isHovered, setIsHovered] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  
  // Pulse animation
  useEffect(() => {
    if (!pulse) return;
    
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 0.02) % (Math.PI * 2));
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [pulse]);
  
  // Calculate glow intensity
  const pulseIntensity = pulse ? (Math.sin(pulsePhase) * 0.2 + 0.8) : 1;
  const hoverIntensity = isHovered ? hoverMultiplier : 1;
  const glowIntensity = baseIntensity * pulseIntensity * hoverIntensity;
  
  return {
    glowIntensity,
    isHovered,
    setIsHovered,
    pulsePhase,
  };
}

