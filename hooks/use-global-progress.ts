/**
 * Global Progress Hook
 * 
 * Phase 3 — Section 16: PAGES PHASE 1 (F16)
 * Phase 3 — Section 23: PAGES PHASE 8 (F23) - Extended with orchestrator
 * 
 * Manages global progress for fade-in/out effects with motion orchestrator integration
 * Uses Zustand store to share state across all components and prevent infinite loops
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { useGlobalProgressStore } from '@/store/global-progress-store';

export function useGlobalProgress() {
  const pathname = usePathname();
  const { globalProgress, isTransitioning, setGlobalProgress, setIsTransitioning } = useGlobalProgressStore();
  const prevPathnameRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate transitions
    if (prevPathnameRef.current === pathname || isTransitioningRef.current) {
      return;
    }
    
    prevPathnameRef.current = pathname;
    isTransitioningRef.current = true;
    
    // Reset progress on route change
    setIsTransitioning(true);
    setGlobalProgress(0.0);

    // Cosmic fade exit
    const exitElement = document.querySelector('[data-page-exit]') as HTMLElement;
    if (exitElement) {
      gsap.to(exitElement, {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        ease: 'power2.inOut',
      });
    }

    // Fade in after a short delay with cosmic fade enter
    const timer = setTimeout(() => {
      const enterElement = document.querySelector('[data-page-enter]') as HTMLElement;
      if (enterElement) {
        gsap.fromTo(
          enterElement,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              // Use requestAnimationFrame to batch state updates and prevent loops
              requestAnimationFrame(() => {
                isTransitioningRef.current = false;
                // Only update if not already at target value
                const currentProgress = useGlobalProgressStore.getState().globalProgress;
                if (currentProgress !== 1.0) {
                  setGlobalProgress(1.0);
                }
                setIsTransitioning(false);
              });
            },
          }
        );
      } else {
        // Use requestAnimationFrame to batch state updates and prevent loops
        requestAnimationFrame(() => {
          isTransitioningRef.current = false;
          // Only update if not already at target value
          const currentProgress = useGlobalProgressStore.getState().globalProgress;
          if (currentProgress !== 1.0) {
            setGlobalProgress(1.0);
          }
          setIsTransitioning(false);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return {
    globalProgress,
    isTransitioning,
  };
}

