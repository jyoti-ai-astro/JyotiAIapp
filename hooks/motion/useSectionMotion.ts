/**
 * useSectionMotion Hook
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * Phase 3 — Section 26: PAGES PHASE 11 (F26) - Enhanced with scroll features
 * 
 * Section enter/exit tracking with scroll progress, velocity, and direction
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useScrollStore } from '@/lib/motion/scroll-store';
import { gsapScrollTriggerSection } from '@/lib/motion/gsap-motion-bridge';
import { gsap } from 'gsap';

export interface UseSectionMotionOptions {
  sectionId: string;
  onEnter?: () => void;
  onExit?: () => void;
  onProgress?: (progress: number) => void;
  enterThreshold?: number; // 0-1, default 0.1
  exitThreshold?: number; // 0-1, default 0.9
}

export function useSectionMotion({
  sectionId,
  onEnter,
  onExit,
  onProgress,
  enterThreshold = 0.1,
  exitThreshold = 0.9,
}: UseSectionMotionOptions) {
  const { orchestrator } = useMotionOrchestrator();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollTriggerRef = useRef<any>(null);
  const [smoothedProgress, setSmoothedProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'none'>('none');
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastProgressRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    // Register section with orchestrator
    const handleEnter = () => {
      orchestrator.onSectionEnter(sectionId);
      onEnter?.();
    };
    
    const handleExit = () => {
      orchestrator.onSectionExit(sectionId);
      onExit?.();
    };
    
    const handleProgress = (progress: number) => {
      const now = Date.now();
      const deltaTime = Math.max((now - lastTimeRef.current) / 1000, 0.001);
      const deltaProgress = progress - lastProgressRef.current;
      
      // Calculate scroll velocity
      const velocity = Math.abs(deltaProgress / deltaTime);
      setScrollVelocity(velocity);
      
      // Determine scroll direction
      if (deltaProgress > 0.01) {
        setScrollDirection('down');
      } else if (deltaProgress < -0.01) {
        setScrollDirection('up');
      } else {
        setScrollDirection('none');
      }
      
      // Smooth progress with GSAP
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        gsap.to({ value: smoothedProgress }, {
          value: progress,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: function() {
            setSmoothedProgress(this.targets()[0].value);
          },
        });
      });
      
      // Update store
      useScrollStore.getState().setSectionProgress(sectionId, progress);
      
      // Check thresholds
      if (progress >= enterThreshold && lastProgressRef.current < enterThreshold) {
        handleEnter();
      }
      if (progress >= exitThreshold && lastProgressRef.current < exitThreshold) {
        // Section is fully visible
      }
      if (progress < enterThreshold && lastProgressRef.current >= enterThreshold) {
        handleExit();
      }
      
      lastProgressRef.current = progress;
      lastTimeRef.current = now;
      onProgress?.(progress);
    };
    
    // Create ScrollTrigger with smart lag
    scrollTriggerRef.current = gsapScrollTriggerSection(
      sectionId,
      handleEnter,
      handleExit,
      handleProgress
    );
    
    // Cleanup
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sectionId, orchestrator, onEnter, onExit, onProgress, enterThreshold, exitThreshold]);
  
  return { 
    sectionRef,
    smoothedProgress,
    scrollDirection,
    scrollVelocity,
  };
}
