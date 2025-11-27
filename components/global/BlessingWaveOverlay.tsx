/**
 * Blessing Wave Overlay Component
 * 
 * Phase 3 — Section 28: PAGES PHASE 13 (F28)
 * 
 * Full-screen golden ring ripple overlay synchronized with blessing wave progress
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBlessingWaveStore } from '@/lib/motion/blessing-wave-store';

export interface BlessingWaveOverlayProps {
  /** Additional className */
  className?: string;
  
  /** Mobile fallback: limit intensity */
  isMobile?: boolean;
}

export function BlessingWaveOverlay({ className = '' }: BlessingWaveOverlayProps) {
  const blessingProgress = useBlessingWaveStore((state) => state.blessingProgress);
  const blessingActive = useBlessingWaveStore((state) => state.blessingActive);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 800);
      const handleResize = () => {
        setIsMobile(window.innerWidth < 800);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Mobile fallback: limit intensity to 0.6
  const adjustedProgress = isMobile ? blessingProgress * 0.6 : blessingProgress;
  
  // Opacity curve: fade out smoothly
  const opacity = blessingActive ? Math.max(0, 1.0 - adjustedProgress * 0.8) : 0;
  
  // Scale: expanding radial gradient
  const scale = blessingActive ? 1.0 + adjustedProgress * 2.0 : 1.0;
  
  if (!blessingActive || opacity <= 0) {
    return null;
  }
  
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{
        opacity,
      }}
    >
      {/* Full-screen golden ring ripple */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, scale],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 1.3, // 500ms + 800ms fade
          ease: 'easeOut',
        }}
      >
        {/* Expanding radial gradient */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(242, 201, 76, 0.8) 0%, rgba(242, 201, 76, 0.4) 30%, transparent 70%)',
            boxShadow: `0 0 ${adjustedProgress * 200}px rgba(242, 201, 76, 0.6)`,
          }}
          animate={{
            scale: [1, scale * 3],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.3,
            ease: 'easeOut',
          }}
        />
        
        {/* Secondary ring */}
        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: '300px',
            height: '300px',
            borderColor: `rgba(242, 201, 76, ${adjustedProgress * 0.6})`,
          }}
          animate={{
            scale: [1, scale * 2.5],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.3,
            ease: 'easeOut',
          }}
        />
      </motion.div>
    </div>
  );
}

