/**
 * CTA Glow Hook
 * 
 * Phase 3 — Section 19: PAGES PHASE 4 (F19)
 * 
 * Provides animated aura pulse and glow effects for CTA sections
 */

'use client';

import { useState, useEffect } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface UseCTAGlowOptions {
  /** Base glow intensity (0-1) */
  baseIntensity?: number;
  
  /** Pulse animation enabled */
  pulse?: boolean;
  
  /** Pulse speed (seconds) */
  pulseSpeed?: number;
  
  /** Hover glow multiplier */
  hoverMultiplier?: number;
  
  /** Variant-specific intensity modifier */
  variantIntensity?: number;
}

export function useCTAGlow(options: UseCTAGlowOptions = {}) {
  const {
    baseIntensity = 0.4,
    pulse = true,
    pulseSpeed = 2,
    hoverMultiplier = 1.5,
    variantIntensity = 1.0,
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
  const pulseIntensity = pulse ? (Math.sin(pulsePhase) * 0.3 + 0.7) : 1;
  const hoverIntensity = isHovered ? hoverMultiplier : 1;
  const glowIntensity = baseIntensity * pulseIntensity * hoverIntensity * variantIntensity;
  
  // Gold-violet gradient intensity
  const goldIntensity = glowIntensity * 0.6;
  const violetIntensity = glowIntensity * 0.4;
  
  return {
    glowIntensity,
    goldIntensity,
    violetIntensity,
    isHovered,
    setIsHovered,
    pulsePhase,
  };
}

