/**
 * Motion Sync Layer
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Syncs timelines, audio curves, scroll curves, and global time
 */

import { ScrollMotion, ScrollMotionData } from './scroll-motion';
import { AudioMotion, AudioMotionData } from './audio-motion';
import { FFTData } from '../audio/fft-processor';

export interface MotionState {
  time: number;
  delta: number;
  scrollProgress: number;
  scrollVelocity: number;
  scrollAcceleration: number;
  scrollDirection: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number; // Combined motion intensity
}

export class MotionSync {
  private scrollMotion: ScrollMotion;
  private audioMotion: AudioMotion;
  private currentState: MotionState;

  constructor() {
    this.scrollMotion = new ScrollMotion();
    this.audioMotion = new AudioMotion();
    
    this.currentState = {
      time: 0,
      delta: 0,
      scrollProgress: 0,
      scrollVelocity: 0,
      scrollAcceleration: 0,
      scrollDirection: 0,
      bassMotion: 0,
      midMotion: 0,
      highMotion: 0,
      globalMotion: 0,
    };
  }

  /**
   * Update motion sync with frame data
   */
  update(
    time: number,
    delta: number,
    scroll: number,
    audio: FFTData
  ): MotionState {
    // Update scroll motion
    const scrollData = this.scrollMotion.update(scroll, delta);
    
    // Update audio motion
    const audioData = this.audioMotion.update(audio);
    
    // Calculate global motion (combined intensity)
    const globalMotion = Math.max(
      scrollData.velocity * 0.3,
      audioData.bassMotion * 0.4,
      audioData.midMotion * 0.2,
      audioData.highMotion * 0.1
    );
    
    // Update state
    this.currentState = {
      time,
      delta,
      scrollProgress: scrollData.progress,
      scrollVelocity: scrollData.velocity,
      scrollAcceleration: scrollData.acceleration,
      scrollDirection: scrollData.direction,
      bassMotion: audioData.bassMotion,
      midMotion: audioData.midMotion,
      highMotion: audioData.highMotion,
      globalMotion: Math.max(0, Math.min(1, globalMotion)),
    };
    
    return this.currentState;
  }

  /**
   * Get current motion state
   */
  getState(): MotionState {
    return { ...this.currentState };
  }

  /**
   * Reset motion sync
   */
  reset(): void {
    this.scrollMotion.reset();
    this.audioMotion.reset();
    this.currentState = {
      time: 0,
      delta: 0,
      scrollProgress: 0,
      scrollVelocity: 0,
      scrollAcceleration: 0,
      scrollDirection: 0,
      bassMotion: 0,
      midMotion: 0,
      highMotion: 0,
      globalMotion: 0,
    };
  }
}

