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
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useScrollStore } from '@/lib/motion/scroll-store';
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
  
  // Store callbacks in refs to prevent ScrollTrigger recreation
  const onEnterRef = useRef(onEnter);
  const onExitRef = useRef(onExit);
  const onProgressRef = useRef(onProgress);
  const orchestratorRef = useRef(orchestrator);
  const enterThresholdRef = useRef(enterThreshold);
  const exitThresholdRef = useRef(exitThreshold);
  
  // Update refs when callbacks change (without recreating ScrollTrigger)
  useEffect(() => {
    onEnterRef.current = onEnter;
    onExitRef.current = onExit;
    onProgressRef.current = onProgress;
    orchestratorRef.current = orchestrator;
    enterThresholdRef.current = enterThreshold;
    exitThresholdRef.current = exitThreshold;
  }, [onEnter, onExit, onProgress, orchestrator, enterThreshold, exitThreshold]);

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;
    
    // Register section with orchestrator
    const handleEnter = () => {
      orchestratorRef.current?.onSectionEnter?.(sectionId);
      onEnterRef.current?.();
    };
    
    const handleExit = () => {
      orchestratorRef.current?.onSectionExit?.(sectionId);
      onExitRef.current?.();
    };
    
    // Use ref to track smoothed progress without causing re-renders
    const progressValueRef = { value: 0 };
    
    const handleProgress = (progress: number) => {
      const now = Date.now();
      const deltaTime = Math.max((now - lastTimeRef.current) / 1000, 0.001);
      const deltaProgress = progress - lastProgressRef.current;
      
      // Calculate scroll velocity (batch updates with requestAnimationFrame)
      const velocity = Math.abs(deltaProgress / deltaTime);
      
      // Determine scroll direction
      let direction: 'up' | 'down' | 'none' = 'none';
      if (deltaProgress > 0.01) {
        direction = 'down';
      } else if (deltaProgress < -0.01) {
        direction = 'up';
      }
      
      // Batch all state updates in a single requestAnimationFrame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        // Update all state at once to prevent multiple re-renders
        setScrollVelocity(velocity);
        setScrollDirection(direction);
        
        // Smooth progress with GSAP (using ref to avoid dependency)
        gsap.to(progressValueRef.current, {
          value: progress,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: function() {
            setSmoothedProgress(progressValueRef.current.value);
          },
        });
      });
      
      // Update store (non-reactive, safe)
      useScrollStore.getState().setSectionProgress(sectionId, progress);
      
      // Check thresholds
      if (progress >= enterThresholdRef.current && lastProgressRef.current < enterThresholdRef.current) {
        handleEnter();
      }
      if (progress < enterThresholdRef.current && lastProgressRef.current >= enterThresholdRef.current) {
        handleExit();
      }
      
      lastProgressRef.current = progress;
      lastTimeRef.current = now;
      onProgressRef.current?.(progress);
    };
    
    // Create ScrollTrigger ONCE on mount only - use sectionRef if available, otherwise use sectionId
    const triggerElement = sectionRef.current || `#${sectionId}`;
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: triggerElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onEnter: handleEnter,
      onLeave: handleExit,
      onEnterBack: handleEnter,
      onLeaveBack: handleExit,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Only update if progress actually changed (prevent unnecessary callbacks)
        if (Math.abs(progress - lastProgressRef.current) < 0.001) {
          return;
        }
        
        // Batch onProgress callbacks with requestAnimationFrame
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        
        rafRef.current = requestAnimationFrame(() => {
          handleProgress(progress);
          rafRef.current = null;
        });
      },
    });
    
    // Cleanup
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    
    // IMPORTANT: Run only once on mount - no dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return { 
    sectionRef,
    smoothedProgress,
    scrollDirection,
    scrollVelocity,
  };
}
