/**
 * Frame Loop
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Central frame loop that emits time, delta, scroll, and audio data
 */

import { FFTData } from '../audio/fft-processor';

export interface FrameData {
  time: number;
  delta: number;
  scroll: number;
  audio: {
    bass: number;
    mid: number;
    high: number;
  };
}

export type FrameCallback = (data: FrameData) => void;

class FrameLoop {
  private callbacks: Set<FrameCallback> = new Set();
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private currentScroll: number = 0;
  private currentAudio: FFTData = { bass: 0, mid: 0, high: 0 };
  private animationFrameId: number | null = null;

  /**
   * Start frame loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * Stop frame loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main loop
   */
  private loop = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = (now - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = now;

    const frameData: FrameData = {
      time: now / 1000, // Time in seconds
      delta,
      scroll: this.currentScroll,
      audio: { ...this.currentAudio },
    };

    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(frameData);
      } catch (error) {
        console.error('Frame loop callback error:', error);
      }
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Register callback
   */
  onFrame(callback: FrameCallback): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Set scroll value
   */
  setScroll(scroll: number): void {
    this.currentScroll = scroll;
  }

  /**
   * Set audio data
   */
  setAudio(audio: FFTData): void {
    this.currentAudio = audio;
  }

  /**
   * Get current time
   */
  getTime(): number {
    return performance.now() / 1000;
  }
}

// Singleton instance
export const frameLoop = new FrameLoop();

