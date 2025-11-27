/**
 * GSAP + Framer Motion Bridge
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * 
 * Utilities for GSAP animations integrated with Framer Motion
 */

'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin and optimize performance (Phase 27 - F42)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ 
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });
  // Phase 27 - F42: Enable performance optimizations
  ScrollTrigger.defaults({
    scrub: 0.35, // Phase 27 - F42: Reduced from 0.5 for smoother performance
  });
}

export interface GSAPAnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

/**
 * GSAP Fade Up Animation
 */
export function gsapFadeUp(
  elements: string | Element | Element[],
  options: GSAPAnimationOptions = {}
): gsap.core.Tween {
  const { duration = 1, delay = 0, ease = 'power2.out', stagger = 0.1 } = options;
  
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: ease || 'power2.out', // Phase 26 - F41: Better easing
      stagger,
    }
  );
}

/**
 * GSAP Parallax Animation
 */
export function gsapParallax(
  element: string | Element,
  speed: number = 0.5,
  options: GSAPAnimationOptions = {}
): ScrollTrigger {
  const { ease = 'none' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      gsap.to(element, {
        y: progress * 100 * speed,
        ease,
      });
    },
  });
}

/**
 * GSAP Glow Pulse Animation
 */
export function gsapGlowPulse(
  element: string | Element,
  options: GSAPAnimationOptions = {}
): gsap.core.Timeline {
  const { duration = 2, ease = 'power2.inOut' } = options;
  
  return gsap.timeline({ repeat: -1 }).to(element, {
    boxShadow: '0 0 30px rgba(242, 201, 76, 0.6)',
    duration: duration / 2,
    ease: ease || 'power2.inOut', // Phase 26 - F41: Better easing
  }).to(element, {
    boxShadow: '0 0 10px rgba(242, 201, 76, 0.3)',
    duration: duration / 2,
    ease: ease || 'power2.inOut',
  });
}

/**
 * GSAP Scroll Trigger Section
 */
export function gsapScrollTriggerSection(
  sectionId: string,
  onEnter?: () => void,
  onExit?: () => void,
  onProgress?: (progress: number) => void
): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: `#${sectionId}`,
    start: 'top center',
    end: 'bottom center',
    onEnter: onEnter,
    onLeave: onExit,
    onEnterBack: onEnter,
    onLeaveBack: onExit,
    onUpdate: (self) => {
      if (onProgress) {
        onProgress(self.progress);
      }
    },
  });
}

/**
 * GSAP Hero Reveal Animation
 */
export function gsapHeroReveal(
  elements: {
    title?: string | Element;
    subtitle?: string | Element;
    description?: string | Element;
    cta?: string | Element;
  },
  options: GSAPAnimationOptions = {}
): gsap.core.Timeline {
  const { duration = 1, delay = 0, ease = 'power3.out', stagger = 0.2 } = options;
  
  const tl = gsap.timeline({ delay });
  
  if (elements.title) {
    tl.fromTo(
      elements.title,
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration, ease },
      0
    );
  }
  
  if (elements.subtitle) {
    tl.fromTo(
      elements.subtitle,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: duration * 0.8, ease },
      stagger
    );
  }
  
  if (elements.description) {
    tl.fromTo(
      elements.description,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: duration * 0.8, ease },
      stagger * 2
    );
  }
  
  if (elements.cta) {
    tl.fromTo(
      elements.cta,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: duration * 0.8, ease },
      stagger * 3
    );
  }
  
  return tl;
}

/**
 * GSAP Section Parallax
 */
export function gsapSectionParallax(
  sectionId: string,
  speed: number = 0.5,
  options: GSAPAnimationOptions = {}
): ScrollTrigger {
  const { ease = 'none' } = options;
  
  return ScrollTrigger.create({
    trigger: `#${sectionId}`,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      gsap.to(`#${sectionId}`, {
        y: progress * 100 * speed,
        ease,
      });
    },
  });
}

/**
 * GSAP Divider Glow
 */
export function gsapDividerGlow(
  element: string | Element,
  options: GSAPAnimationOptions = {}
): gsap.core.Timeline {
  const { duration = 2, ease = 'power1.inOut' } = options;
  
  return gsap.timeline({ repeat: -1 }).to(element, {
    boxShadow: '0 0 20px rgba(242, 201, 76, 0.4)',
    duration: duration / 2,
    ease,
  }).to(element, {
    boxShadow: '0 0 5px rgba(242, 201, 76, 0.2)',
    duration: duration / 2,
    ease,
  });
}

/**
 * GSAP Premium Gold Pulse
 */
export function gsapPremiumGoldPulse(
  element: string | Element,
  options: GSAPAnimationOptions = {}
): gsap.core.Timeline {
  const { duration = 1.5, ease = 'power2.inOut' } = options;
  
  return gsap.timeline({ repeat: -1 }).to(element, {
    filter: 'brightness(1.3)',
    boxShadow: '0 0 40px rgba(242, 201, 76, 0.6)',
    duration: duration / 2,
    ease,
  }).to(element, {
    filter: 'brightness(1.0)',
    boxShadow: '0 0 10px rgba(242, 201, 76, 0.3)',
    duration: duration / 2,
    ease,
  });
}

/**
 * GSAP Starfield React
 */
export function gsapStarfieldReact(
  element: string | Element,
  scrollVelocity: number,
  options: GSAPAnimationOptions = {}
): gsap.core.Tween {
  const { ease = 'power1.out' } = options;
  
  return gsap.to(element, {
    opacity: Math.min(0.8 + scrollVelocity * 0.01, 1.0),
    scale: 1.0 + scrollVelocity * 0.0001,
    duration: 0.3,
    ease,
  });
}

/**
 * GSAP Scroll Fade In
 */
export function scrollFadeIn(
  element: string | Element,
  options: GSAPAnimationOptions & { start?: string; end?: string } = {}
): ScrollTrigger {
  const { start = 'top bottom', end = 'bottom top', ease = 'power2.out' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    scrub: 0.35, // Phase 27 - F42: Optimized scrub value
    onUpdate: (self) => {
      gsap.to(element, {
        opacity: self.progress,
        y: (1 - self.progress) * 50,
        ease: ease || 'power2.out',
      });
    },
  });
}

/**
 * GSAP Scroll Parallax Y
 */
export function scrollParallaxY(
  element: string | Element,
  speed: number = 0.5,
  options: GSAPAnimationOptions & { start?: string; end?: string } = {}
): ScrollTrigger {
  const { start = 'top bottom', end = 'bottom top', ease = 'power2.out' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    scrub: 0.35, // Phase 27 - F42: Optimized scrub value
    onUpdate: (self) => {
      gsap.to(element, {
        y: self.progress * 100 * speed,
        ease: ease || 'power2.out',
      });
    },
  });
}

/**
 * GSAP Scroll Parallax X
 */
export function scrollParallaxX(
  element: string | Element,
  speed: number = 0.5,
  options: GSAPAnimationOptions & { start?: string; end?: string } = {}
): ScrollTrigger {
  const { start = 'top bottom', end = 'bottom top', ease = 'none' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    scrub: true,
    onUpdate: (self) => {
      gsap.to(element, {
        x: self.progress * 100 * speed,
        ease,
      });
    },
  });
}

/**
 * GSAP Scroll Glow Pulse
 */
export function scrollGlowPulse(
  element: string | Element,
  options: GSAPAnimationOptions & { start?: string; end?: string } = {}
): ScrollTrigger {
  const { start = 'top center', end = 'bottom center', ease = 'power1.out' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    scrub: true,
    onUpdate: (self) => {
      const glowIntensity = Math.sin(self.progress * Math.PI);
      gsap.to(element, {
        boxShadow: `0 0 ${20 + glowIntensity * 30}px rgba(242, 201, 76, ${0.3 + glowIntensity * 0.3})`,
        ease,
      });
    },
  });
}

/**
 * GSAP Scroll Tilt
 */
export function scrollTilt(
  element: string | Element,
  maxTilt: number = 5,
  options: GSAPAnimationOptions & { start?: string; end?: string } = {}
): ScrollTrigger {
  const { start = 'top center', end = 'bottom center', ease = 'power1.out' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    scrub: true,
    onUpdate: (self) => {
      const tilt = (self.progress - 0.5) * maxTilt * 2;
      gsap.to(element, {
        rotateX: tilt,
        rotateY: tilt * 0.5,
        ease,
      });
    },
  });
}

/**
 * GSAP Scroll Divider Reveal
 */
export function scrollDividerReveal(
  element: string | Element,
  options: GSAPAnimationOptions & { start?: string; end?: string } = {}
): ScrollTrigger {
  const { start = 'top center', end = 'bottom center', ease = 'power2.out' } = options;
  
  return ScrollTrigger.create({
    trigger: element,
    start,
    end,
    scrub: 0.35, // Phase 27 - F42: Optimized scrub value
    onUpdate: (self) => {
      const rotation = self.progress * 360;
      const opacity = Math.min(self.progress * 2, 1);
      gsap.to(element, {
        rotation,
        opacity,
        scale: 0.8 + self.progress * 0.2,
        ease: ease || 'power2.out',
      });
    },
  });
}

/**
 * Cleanup ScrollTrigger instances (Phase 27 - F42: Enhanced cleanup)
 */
export function cleanupScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill();
  });
  ScrollTrigger.refresh(); // Phase 27 - F42: Refresh after cleanup
}

/**
 * Create GSAP context for proper cleanup (Phase 27 - F42)
 */
export function createGSAPContext(callback: (ctx: gsap.Context) => void): gsap.Context {
  return gsap.context(callback);
}

