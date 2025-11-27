/**
 * useRouteMotion Hook
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * Phase 3 — Section 25: PAGES PHASE 10 (F25) - Enhanced with full transition system
 * 
 * Global route change detection and page transition animations
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useRouteMotion() {
  const { orchestrator } = useMotionOrchestrator();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const currentPath = pathname;
    const prevPath = prevPathnameRef.current;
    
    if (prevPath && prevPath !== currentPath && !isTransitioning) {
      setIsTransitioning(true);
      
      // Route change detected - start exit animations
      const exitElement = document.querySelector('[data-page-exit]') as HTMLElement;
      const pageElement = document.querySelector('[data-page-transition="cosmic"]') as HTMLElement;
      
      // Reset ScrollTrigger instances to prevent conflicts
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger?.closest('[data-page-transition]')) {
          trigger.kill();
        }
      });
      
      // Determine transition type based on route
      const transitionType = getTransitionType(prevPath, currentPath);
      
      // Exit animation sequence
      const exitPromise = exitElement || pageElement
        ? orchestrator.cosmicMistExit(exitElement || pageElement)
        : Promise.resolve();
      
      exitPromise.then(() => {
        // Wait for route to complete
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        
        transitionTimeoutRef.current = setTimeout(() => {
          // Enter animation sequence
          const enterElement = document.querySelector('[data-page-enter]') as HTMLElement;
          const newPageElement = document.querySelector('[data-page-transition="cosmic"]') as HTMLElement;
          
          if (enterElement || newPageElement) {
            // Trigger enter animation based on transition type
            switch (transitionType) {
              case 'mandala':
                orchestrator.mandalaZoomEnter(enterElement || newPageElement).then(() => {
                  setIsTransitioning(false);
                });
                break;
              case 'nebula':
                orchestrator.nebulaShiftEnter(enterElement || newPageElement).then(() => {
                  setIsTransitioning(false);
                });
                break;
              default:
                orchestrator.cosmicMistEnter(enterElement || newPageElement).then(() => {
                  setIsTransitioning(false);
                });
            }
            
            // Starfield pulse on enter
            orchestrator.starfieldPulse(1.0);
          } else {
            setIsTransitioning(false);
          }
          
          // Dispatch route change event
          orchestrator.dispatch('onRouteChange', {
            from: prevPath,
            to: currentPath,
            transitionType,
          });
        }, 100);
      });
    } else if (!prevPath) {
      // Initial load - just enter animation
      const enterElement = document.querySelector('[data-page-enter]') as HTMLElement;
      const pageElement = document.querySelector('[data-page-transition="cosmic"]') as HTMLElement;
      
      if (enterElement || pageElement) {
        orchestrator.cosmicMistEnter(enterElement || pageElement);
      }
    }
    
    prevPathnameRef.current = currentPath;
    
    // Cleanup
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [pathname, orchestrator, isTransitioning]);
  
  return { isTransitioning };
}

/**
 * Determine transition type based on route paths
 */
function getTransitionType(from: string, to: string): 'mandala' | 'nebula' | 'cosmic' {
  // Premium pages use mandala zoom
  if (from.includes('/premium') || to.includes('/premium')) {
    return 'mandala';
  }
  
  // Cosmos/Astro pages use nebula shift
  if (from.includes('/cosmos') || to.includes('/cosmos') || 
      from.includes('/astro') || to.includes('/astro')) {
    return 'nebula';
  }
  
  // Default cosmic mist
  return 'cosmic';
}
