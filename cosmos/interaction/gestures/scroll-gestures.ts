/**
 * Scroll Gesture Handler
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Scroll zone detection, velocity analysis, threshold triggers
 */

import { InteractionIntent } from '../events/interaction-events';

export interface ScrollZone {
  start: number; // 0-1 scroll progress
  end: number; // 0-1 scroll progress
  id: number;
}

export interface ScrollGestureState {
  scrollProgress: number;
  scrollVelocity: number;
  scrollAcceleration: number;
  currentZone: number;
  previousZone: number;
  velocitySpike: boolean;
}

export class ScrollGestures {
  private zones: ScrollZone[] = [
    { start: 0.0, end: 0.2, id: 0 },   // Zone 0: Top
    { start: 0.2, end: 0.4, id: 1 },   // Zone 1: Upper
    { start: 0.4, end: 0.6, id: 2 },   // Zone 2: Middle
    { start: 0.6, end: 0.8, id: 3 },  // Zone 3: Lower
    { start: 0.8, end: 1.0, id: 4 },  // Zone 4: Bottom
  ];
  
  private previousScroll: number = 0;
  private previousVelocity: number = 0;
  private velocityThreshold: number = 0.1;
  private accelerationThreshold: number = 0.05;

  /**
   * Compute scroll zones
   */
  computeScrollZones(scrollProgress: number): ScrollZone[] {
    return this.zones;
  }

  /**
   * Get current scroll zone
   */
  getCurrentZone(scrollProgress: number): number {
    for (const zone of this.zones) {
      if (scrollProgress >= zone.start && scrollProgress < zone.end) {
        return zone.id;
      }
    }
    return this.zones[this.zones.length - 1].id; // Default to last zone
  }

  /**
   * Detect zone transitions
   */
  detectZoneTransition(
    currentScroll: number,
    previousScroll: number
  ): { entered: number | null; exited: number | null } {
    const currentZone = this.getCurrentZone(currentScroll);
    const previousZone = this.getCurrentZone(previousScroll);
    
    if (currentZone !== previousZone) {
      return {
        entered: currentZone,
        exited: previousZone,
      };
    }
    
    return { entered: null, exited: null };
  }

  /**
   * Threshold triggers
   */
  checkThresholdTriggers(scrollProgress: number): {
    isAtTop: boolean;
    isAtBottom: boolean;
    isAtMiddle: boolean;
  } {
    return {
      isAtTop: scrollProgress < 0.1,
      isAtBottom: scrollProgress > 0.9,
      isAtMiddle: scrollProgress >= 0.4 && scrollProgress <= 0.6,
    };
  }

  /**
   * Scroll velocity analysis
   */
  analyzeScrollVelocity(
    currentScroll: number,
    deltaTime: number
  ): ScrollGestureState {
    const scrollVelocity = (currentScroll - this.previousScroll) / Math.max(deltaTime, 0.016);
    const scrollAcceleration = (scrollVelocity - this.previousVelocity) / Math.max(deltaTime, 0.016);
    
    const velocitySpike = Math.abs(scrollVelocity) > this.velocityThreshold ||
                          Math.abs(scrollAcceleration) > this.accelerationThreshold;
    
    const currentZone = this.getCurrentZone(currentScroll);
    const previousZone = this.getCurrentZone(this.previousScroll);
    
    this.previousScroll = currentScroll;
    this.previousVelocity = scrollVelocity;
    
    return {
      scrollProgress: currentScroll,
      scrollVelocity,
      scrollAcceleration,
      currentZone,
      previousZone,
      velocitySpike,
    };
  }

  /**
   * Positive/negative intent
   */
  getScrollIntent(scrollVelocity: number): 'positive' | 'negative' | 'neutral' {
    if (scrollVelocity > 0.05) return 'positive';
    if (scrollVelocity < -0.05) return 'negative';
    return 'neutral';
  }

  /**
   * Process scroll input
   */
  processScroll(
    scrollProgress: number,
    deltaTime: number,
    position: { x: number; y: number }
  ): InteractionIntent {
    const gestureState = this.analyzeScrollVelocity(scrollProgress, deltaTime);
    const zoneTransition = this.detectZoneTransition(scrollProgress, this.previousScroll);
    
    return {
      type: 'scroll',
      target: 'none',
      position,
      screenPosition: position,
      intensity: Math.abs(gestureState.scrollVelocity),
      metadata: {
        scrollProgress,
        scrollVelocity: gestureState.scrollVelocity,
        scrollAcceleration: gestureState.scrollAcceleration,
        currentZone: gestureState.currentZone,
        previousZone: gestureState.previousZone,
        zoneEntered: zoneTransition.entered,
        zoneExited: zoneTransition.exited,
        velocitySpike: gestureState.velocitySpike,
        intent: this.getScrollIntent(gestureState.scrollVelocity),
      },
    };
  }
}

