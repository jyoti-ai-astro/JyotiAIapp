/**
 * Motion Provider Component
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * 
 * Provides motion orchestrator context to the entire app
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMotionOrchestrator, MotionOrchestrator } from '@/lib/motion/MotionOrchestrator';
import dynamic from 'next/dynamic';

// Lazy load GSAP modules
const loadGSAP = async () => {
  if (typeof window !== 'undefined') {
    const gsap = (await import('gsap')).default;
    const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  }
  return null;
};

interface MotionContextValue {
  orchestrator: MotionOrchestrator;
  isReady: boolean;
}

const MotionContext = createContext<MotionContextValue | null>(null);

export function useMotionOrchestrator() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotionOrchestrator must be used within MotionProvider');
  }
  return context;
}

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const [orchestrator] = useState(() => getMotionOrchestrator());
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Initialize orchestrator
    orchestrator.init();
    
    // Lazy load GSAP
    loadGSAP().then(() => {
      setIsReady(true);
    });
    
    // Cleanup on unmount (Phase 27 - F42: Enhanced cleanup)
    return () => {
      orchestrator.cleanup();
      // Phase 27 - F42: Cleanup ScrollTrigger instances
      if (typeof window !== 'undefined') {
        import('@/lib/motion/gsap-motion-bridge').then(({ cleanupScrollTriggers }) => {
          cleanupScrollTriggers();
        });
      }
    };
  }, [orchestrator]);
  
  return (
    <MotionContext.Provider value={{ orchestrator, isReady }}>
      {children}
    </MotionContext.Provider>
  );
}

