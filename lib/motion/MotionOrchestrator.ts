/**
 * Motion Orchestrator Core
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * 
 * Global motion coordination system
 */

'use client';

import { useMouseStore } from './mouse-store';
import { useScrollStore } from './scroll-store';

export type AnimationCallback = (data?: any) => void;
export type AnimationRegistry = Map<string, AnimationCallback>;

export interface MotionOrchestratorConfig {
  enableScrollTracking?: boolean;
  enableMouseTracking?: boolean;
  enableAudioReactive?: boolean;
  enableBlessingWave?: boolean;
}

export interface AudioReactiveData {
  bass: number;
  mid: number;
  high: number;
}

export class MotionOrchestrator {
  private animationRegistry: AnimationRegistry = new Map();
  private scrollListener: (() => void) | null = null;
  private mouseListener: ((e: MouseEvent) => void) | null = null;
  private isHydrated = false;
  private config: MotionOrchestratorConfig;
  
  // Audio reactive data
  private audioReactive: AudioReactiveData = { bass: 0, mid: 0, high: 0 };
  
  // Blessing wave progress
  private blessingWaveProgress = 0;
  
  constructor(config: MotionOrchestratorConfig = {}) {
    this.config = {
      enableScrollTracking: true,
      enableMouseTracking: true,
      enableAudioReactive: false,
      enableBlessingWave: false,
      ...config,
    };
  }
  
  /**
   * Initialize orchestrator (hydration-safe)
   */
  init(): void {
    if (typeof window === 'undefined' || this.isHydrated) return;
    
    this.isHydrated = true;
    
    if (this.config.enableScrollTracking) {
      this.initScrollTracking();
    }
    
    if (this.config.enableMouseTracking) {
      this.initMouseTracking();
    }
  }
  
  /**
   * Initialize scroll tracking
   */
  private initScrollTracking(): void {
    const updateScroll = useScrollStore.getState().updateScroll;
    
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      updateScroll(scrollY);
      
      // Dispatch onScroll event
      this.dispatch('onScroll', { scrollY });
    };
    
    // Throttled scroll listener
    let ticking = false;
    this.scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }
  
  /**
   * Initialize mouse tracking
   */
  private initMouseTracking(): void {
    const updateMouse = useMouseStore.getState().updateMouse;
    
    const handleMouseMove = (e: MouseEvent) => {
      updateMouse(e.clientX, e.clientY);
      
      // Dispatch onMouseMove event
      this.dispatch('onMouseMove', { x: e.clientX, y: e.clientY });
    };
    
    this.mouseListener = handleMouseMove;
    window.addEventListener('mousemove', this.mouseListener, { passive: true });
  }
  
  /**
   * Register animation callback
   */
  register(id: string, callback: AnimationCallback): void {
    this.animationRegistry.set(id, callback);
  }
  
  /**
   * Unregister animation callback
   */
  unregister(id: string): void {
    this.animationRegistry.delete(id);
  }
  
  /**
   * Dispatch trigger event
   */
  dispatch(trigger: string, data?: any): void {
    // Dispatch to all registered callbacks
    this.animationRegistry.forEach((callback) => {
      try {
        callback({ trigger, data });
      } catch (error) {
        console.error(`Error in animation callback for trigger ${trigger}:`, error);
      }
    });
  }
  
  /**
   * Update scroll progress and dispatch scroll callbacks
   */
  updateScrollProgress(scrollY: number, maxScroll: number = 1): void {
    const progress = Math.min(scrollY / maxScroll, 1);
    
    // Dispatch global scroll callbacks
    this.scrollNebulaReact(progress);
    this.scrollStarfieldReact(progress);
    
    // Update scroll store
    if (typeof window !== 'undefined') {
      const { useScrollStore } = require('./scroll-store');
      useScrollStore.getState().updateScroll(scrollY);
    }
  }
  
  /**
   * Get scroll state
   */
  getScrollState() {
    return useScrollStore.getState();
  }
  
  /**
   * Get mouse state
   */
  getMouseState() {
    return useMouseStore.getState();
  }
  
  /**
   * Set audio reactive data
   */
  setAudioReactive(data: AudioReactiveData): void {
    this.audioReactive = data;
    this.dispatch('onAudioReactive', data);
  }
  
  /**
   * Get audio reactive data
   */
  getAudioReactive(): AudioReactiveData {
    return this.audioReactive;
  }
  
  /**
   * Set blessing wave progress
   */
  setBlessingWaveProgress(progress: number): void {
    this.blessingWaveProgress = progress;
    this.dispatch('onBlessingWave', { progress });
  }
  
  /**
   * Get blessing wave progress
   */
  getBlessingWaveProgress(): number {
    return this.blessingWaveProgress;
  }
  
  // Note: Transition methods are defined later with Promise return types
  
  /**
   * Section enter
   */
  onSectionEnter(sectionId: string): void {
    useScrollStore.getState().setSectionActive(sectionId);
    this.dispatch('onSectionEnter', { sectionId });
  }
  
  /**
   * Section exit
   */
  onSectionExit(sectionId: string): void {
    this.dispatch('onSectionExit', { sectionId });
  }
  
  /**
   * Scroll parallax for section
   */
  scrollParallax(sectionId: string, progress: number): void {
    this.dispatch('scrollParallax', { sectionId, progress });
  }
  
  /**
   * Scroll reveal for section
   */
  scrollReveal(sectionId: string, progress: number): void {
    this.dispatch('scrollReveal', { sectionId, progress });
  }
  
  /**
   * Scroll glow for section
   */
  scrollGlow(sectionId: string, progress: number): void {
    this.dispatch('scrollGlow', { sectionId, progress });
  }
  
  /**
   * Scroll nebula react
   */
  scrollNebulaReact(progress: number): void {
    this.dispatch('scrollNebulaReact', { progress });
  }
  
  /**
   * Scroll starfield react
   */
  scrollStarfieldReact(progress: number): void {
    this.dispatch('scrollStarfieldReact', { progress });
  }
  
  /**
   * Hero loaded
   */
  onHeroLoaded(): void {
    this.dispatch('onHeroLoaded');
  }
  
  /**
   * Scene progress
   */
  onSceneProgress(progress: number): void {
    this.dispatch('onSceneProgress', { progress });
  }
  
  /**
   * Hero reveal animation
   */
  heroReveal(elements: {
    title?: HTMLElement | null;
    subtitle?: HTMLElement | null;
    description?: HTMLElement | null;
    cta?: HTMLElement | null;
  }): void {
    this.dispatch('heroReveal', { elements });
  }
  
  /**
   * Card tilt animation
   */
  cardTilt(sectionProgress: number, cardId: string): void {
    this.dispatch('cardTilt', { sectionProgress, cardId });
  }
  
  /**
   * CTA pulse animation
   */
  ctaPulse(sectionProgress: number, ctaId: string): void {
    this.dispatch('ctaPulse', { sectionProgress, ctaId });
  }
  
  /**
   * Content fade animation
   */
  contentFade(sectionProgress: number, contentId: string): void {
    this.dispatch('contentFade', { sectionProgress, contentId });
  }
  
  /**
   * Divider reveal animation
   */
  dividerReveal(sectionProgress: number): void {
    this.dispatch('dividerReveal', { sectionProgress });
  }
  
  /**
   * Footer shimmer animation
   */
  footerShimmer(scrollProgress: number): void {
    this.dispatch('footerShimmer', { scrollProgress });
  }
  
  /**
   * Mandala Zoom Enter Animation
   */
  mandalaZoomEnter(element: HTMLElement, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch('onRouteChange', { type: 'mandala-zoom-enter', element });
      
      // Import GSAP dynamically
      if (typeof window !== 'undefined') {
        import('gsap').then(({ gsap }) => {
          gsap.fromTo(
            element,
            { scale: 0.8, opacity: 0, rotation: -180 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 1.2,
              ease: 'power3.out',
              onComplete: () => {
                callback?.();
                resolve();
              },
            }
          );
        });
      } else {
        callback?.();
        resolve();
      }
    });
  }
  
  /**
   * Mandala Zoom Exit Animation
   */
  mandalaZoomExit(element: HTMLElement, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch('onRouteChange', { type: 'mandala-zoom-exit', element });
      
      if (typeof window !== 'undefined') {
        import('gsap').then(({ gsap }) => {
          gsap.to(element, {
            scale: 1.2,
            opacity: 0,
            rotation: 180,
            duration: 0.8,
            ease: 'power2.in',
            onComplete: () => {
              callback?.();
              resolve();
            },
          });
        });
      } else {
        callback?.();
        resolve();
      }
    });
  }
  
  /**
   * Cosmic Mist Enter Animation
   */
  cosmicMistEnter(element: HTMLElement, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch('onRouteChange', { type: 'cosmic-mist-enter', element });
      
      if (typeof window !== 'undefined') {
        import('gsap').then(({ gsap }) => {
          const tl = gsap.timeline({
            onComplete: () => {
              callback?.();
              resolve();
            },
          });
          
          // Mist fade in
          tl.fromTo(
            element,
            { opacity: 0, filter: 'blur(20px)' },
            { opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out' }
          );
          
          // Content reveal
          tl.fromTo(
            element.querySelectorAll('[data-page-content]'),
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
            '-=0.5'
          );
        });
      } else {
        callback?.();
        resolve();
      }
    });
  }
  
  /**
   * Cosmic Mist Exit Animation
   */
  cosmicMistExit(element: HTMLElement, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch('onRouteChange', { type: 'cosmic-mist-exit', element });
      
      if (typeof window !== 'undefined') {
        import('gsap').then(({ gsap }) => {
          const tl = gsap.timeline({
            onComplete: () => {
              callback?.();
              resolve();
            },
          });
          
          // Content fade out
          tl.to(
            element.querySelectorAll('[data-page-content]'),
            { y: -30, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.in' }
          );
          
          // Mist fade out
          tl.to(
            element,
            { opacity: 0, filter: 'blur(20px)', duration: 0.6, ease: 'power2.in' },
            '-=0.3'
          );
        });
      } else {
        callback?.();
        resolve();
      }
    });
  }
  
  /**
   * Nebula Shift Enter Animation
   */
  nebulaShiftEnter(element: HTMLElement, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch('onRouteChange', { type: 'nebula-shift-enter', element });
      
      if (typeof window !== 'undefined') {
        import('gsap').then(({ gsap }) => {
          const tl = gsap.timeline({
            onComplete: () => {
              callback?.();
              resolve();
            },
          });
          
          // Nebula shift from right
          tl.fromTo(
            element,
            { x: '100%', opacity: 0 },
            { x: '0%', opacity: 1, duration: 1.0, ease: 'power3.out' }
          );
          
          // Parallax layers
          tl.fromTo(
            element.querySelectorAll('[data-parallax-layer]'),
            { x: '50%', opacity: 0 },
            { x: '0%', opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
            '-=0.7'
          );
        });
      } else {
        callback?.();
        resolve();
      }
    });
  }
  
  /**
   * Nebula Shift Exit Animation
   */
  nebulaShiftExit(element: HTMLElement, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.dispatch('onRouteChange', { type: 'nebula-shift-exit', element });
      
      if (typeof window !== 'undefined') {
        import('gsap').then(({ gsap }) => {
          const tl = gsap.timeline({
            onComplete: () => {
              callback?.();
              resolve();
            },
          });
          
          // Parallax layers exit
          tl.to(
            element.querySelectorAll('[data-parallax-layer]'),
            { x: '-50%', opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.in' }
          );
          
          // Nebula shift to left
          tl.to(
            element,
            { x: '-100%', opacity: 0, duration: 0.7, ease: 'power2.in' },
            '-=0.3'
          );
        });
      } else {
        callback?.();
        resolve();
      }
    });
  }
  
  /**
   * Starfield Pulse Animation
   */
  starfieldPulse(intensity: number = 1.0, callback?: () => void): void {
    this.dispatch('onRouteChange', { type: 'starfield-pulse', intensity });
    
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        gsap.to('[data-starfield]', {
          opacity: intensity,
          scale: 1.0 + (intensity - 1.0) * 0.1,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: callback,
        });
      });
    } else {
      callback?.();
    }
  }
  
  /**
   * Emit scene event for 3D scene interaction
   * Phase 12 (F27) — Cosmic 3D Object Interaction Pass
   */
  emitSceneEvent(eventName: string, payload?: any): void {
    this.dispatch('onSceneEvent', { eventName, payload });
  }
  
  /**
   * Trigger blessing wave animation
   * Phase 13 (F28) — Cosmic BlessingWave Engine
   */
  triggerBlessingWave(intensity: number = 1.0): void {
    // Dispatch blessing wave start event
    this.dispatch('blessing-wave-start', { intensity });
    
    // Update blessing wave store
    if (typeof window !== 'undefined') {
      import('./blessing-wave-store').then(({ useBlessingWaveStore }) => {
        useBlessingWaveStore.getState().startBlessingWave(intensity);
      });
    }
    
    // Animate blessing progress using GSAP
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        // 0 → 1 (500ms)
        gsap.to({}, {
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: function() {
            const progress = this.progress() * intensity;
            if (typeof window !== 'undefined') {
              import('./blessing-wave-store').then(({ useBlessingWaveStore }) => {
                useBlessingWaveStore.getState().setBlessingProgress(progress);
              });
            }
          },
          onComplete: () => {
            // 1 → 0 (800ms)
            gsap.to({}, {
              duration: 0.8,
              ease: 'power2.in',
              onUpdate: function() {
                const progress = intensity * (1 - this.progress());
                if (typeof window !== 'undefined') {
                  import('./blessing-wave-store').then(({ useBlessingWaveStore }) => {
                    useBlessingWaveStore.getState().setBlessingProgress(progress);
                  });
                }
              },
              onComplete: () => {
                // Dispatch blessing wave end event
                this.dispatch('blessing-wave-end');
                if (typeof window !== 'undefined') {
                  import('./blessing-wave-store').then(({ useBlessingWaveStore }) => {
                    useBlessingWaveStore.getState().stopBlessingWave();
                  });
                }
              },
            });
          },
        });
      });
    }
  }
  
  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
    
    if (this.mouseListener) {
      window.removeEventListener('mousemove', this.mouseListener);
      this.mouseListener = null;
    }
    
    this.animationRegistry.clear();
    this.isHydrated = false;
  }
}

// Singleton instance
let orchestratorInstance: MotionOrchestrator | null = null;

export function getMotionOrchestrator(): MotionOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new MotionOrchestrator();
  }
  return orchestratorInstance;
}

