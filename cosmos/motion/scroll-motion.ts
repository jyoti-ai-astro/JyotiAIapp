/**
 * Scroll Motion
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Smooth scroll value processing with velocity and acceleration
 */

import { ExponentialSmoothing } from '../audio/utils/smoothing';

export interface ScrollMotionData {
  progress: number; // 0-1
  velocity: number;
  acceleration: number;
  direction: number; // -1 down, 1 up, 0 none
}

export class ScrollMotion {
  private smoothScroll: ExponentialSmoothing;
  private lastScroll: number = 0;
  private lastVelocity: number = 0;
  private velocitySmoother: ExponentialSmoothing;
  
  private currentData: ScrollMotionData = {
    progress: 0,
    velocity: 0,
    acceleration: 0,
    direction: 0,
  };

  constructor(smoothing: number = 0.1) {
    this.smoothScroll = new ExponentialSmoothing(smoothing);
    this.velocitySmoother = new ExponentialSmoothing(0.2);
  }

  /**
   * Update scroll value
   */
  update(scroll: number, delta: number): ScrollMotionData {
    // Smooth scroll value
    const smoothValue = this.smoothScroll.update(scroll);
    
    // Calculate velocity (change per second)
    const velocity = (smoothValue - this.lastScroll) / delta;
    const smoothVelocity = this.velocitySmoother.update(velocity);
    
    // Calculate acceleration (change in velocity)
    const acceleration = (smoothVelocity - this.lastVelocity) / delta;
    
    // Determine direction
    let direction = 0;
    if (Math.abs(smoothVelocity) > 0.01) {
      direction = smoothVelocity > 0 ? 1 : -1;
    }
    
    // Update current data
    this.currentData = {
      progress: Math.max(0, Math.min(1, smoothValue)),
      velocity: smoothVelocity,
      acceleration,
      direction,
    };
    
    // Store for next frame
    this.lastScroll = smoothValue;
    this.lastVelocity = smoothVelocity;
    
    return this.currentData;
  }

  /**
   * Get current scroll motion data
   */
  getData(): ScrollMotionData {
    return { ...this.currentData };
  }

  /**
   * Reset scroll motion
   */
  reset(): void {
    this.lastScroll = 0;
    this.lastVelocity = 0;
    this.smoothScroll.reset();
    this.velocitySmoother.reset();
    this.currentData = {
      progress: 0,
      velocity: 0,
      acceleration: 0,
      direction: 0,
    };
  }
}

