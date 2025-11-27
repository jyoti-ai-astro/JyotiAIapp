/**
 * Timeline System
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Keyframe-based timeline with easing and playback control
 */

import { EasingFunction, linear } from './easing';

export type TimelineMode = 'once' | 'loop' | 'pingpong';

export interface Keyframe {
  time: number; // 0-1 normalized
  value: number;
  easing?: EasingFunction;
}

export interface TimelineConfig {
  duration?: number;
  mode?: TimelineMode;
  easing?: EasingFunction;
  keyframes?: Keyframe[];
}

export class Timeline {
  private duration: number;
  private mode: TimelineMode;
  private easing: EasingFunction;
  private keyframes: Keyframe[];
  
  private startTime: number = 0;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private direction: number = 1; // 1 forward, -1 reverse
  private progress: number = 0; // 0-1 normalized
  
  private onUpdate?: (progress: number) => void;
  private onComplete?: () => void;

  constructor(config: TimelineConfig = {}) {
    this.duration = config.duration || 1000;
    this.mode = config.mode || 'once';
    this.easing = config.easing || linear;
    this.keyframes = config.keyframes || [];
    
    // Sort keyframes by time
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  /**
   * Play timeline
   */
  play(): void {
    if (this.isPaused) {
      // Resume from current time
      this.startTime = performance.now() - this.currentTime * this.duration;
    } else {
      // Start from beginning
      this.startTime = performance.now();
      this.currentTime = 0;
      this.progress = 0;
    }
    this.isPlaying = true;
    this.isPaused = false;
  }

  /**
   * Pause timeline
   */
  pause(): void {
    this.isPaused = true;
    this.isPlaying = false;
  }

  /**
   * Stop timeline
   */
  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.progress = 0;
    this.direction = 1;
  }

  /**
   * Reverse timeline
   */
  reverse(): void {
    this.direction *= -1;
  }

  /**
   * Seek to specific time (scrubbing)
   */
  seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(this.duration, time));
    this.progress = this.currentTime / this.duration;
    this.update();
  }

  /**
   * Seek to specific progress (0-1)
   */
  seekProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
    this.currentTime = this.progress * this.duration;
    this.update();
  }

  /**
   * Update timeline (called each frame)
   */
  update(now: number = performance.now()): number {
    if (!this.isPlaying) {
      return this.getProgress();
    }

    // Calculate elapsed time
    const elapsed = (now - this.startTime) * this.direction;
    this.currentTime = elapsed;

    // Handle different modes
    if (this.mode === 'once') {
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.progress = 1;
        this.isPlaying = false;
        this.onComplete?.();
      } else if (this.currentTime <= 0) {
        this.currentTime = 0;
        this.progress = 0;
        this.isPlaying = false;
        this.onComplete?.();
      } else {
        this.progress = this.currentTime / this.duration;
      }
    } else if (this.mode === 'loop') {
      this.progress = (this.currentTime % this.duration) / this.duration;
      if (this.currentTime < 0) {
        this.progress = 1 + this.progress;
      }
    } else if (this.mode === 'pingpong') {
      const cycle = this.currentTime / this.duration;
      const cycleProgress = cycle % 2;
      if (cycleProgress < 1) {
        this.progress = cycleProgress;
      } else {
        this.progress = 2 - cycleProgress;
      }
    }

    this.update();
    return this.getProgress();
  }

  /**
   * Internal update (interpolate keyframes)
   */
  private update(): void {
    if (this.keyframes.length === 0) {
      // No keyframes, use easing on progress
      const eased = this.easing(this.progress);
      this.onUpdate?.(eased);
      return;
    }

    // Find keyframe range
    let startKeyframe: Keyframe | null = null;
    let endKeyframe: Keyframe | null = null;

    for (let i = 0; i < this.keyframes.length; i++) {
      const keyframe = this.keyframes[i];
      if (keyframe.time <= this.progress) {
        startKeyframe = keyframe;
      }
      if (keyframe.time >= this.progress && !endKeyframe) {
        endKeyframe = keyframe;
        break;
      }
    }

    if (!startKeyframe) {
      startKeyframe = this.keyframes[0];
    }
    if (!endKeyframe) {
      endKeyframe = this.keyframes[this.keyframes.length - 1];
    }

    // Interpolate between keyframes
    if (startKeyframe === endKeyframe) {
      this.onUpdate?.(startKeyframe.value);
      return;
    }

    const range = endKeyframe.time - startKeyframe.time;
    const localProgress = range > 0
      ? (this.progress - startKeyframe.time) / range
      : 0;

    const easingFn = endKeyframe.easing || this.easing;
    const eased = easingFn(localProgress);

    const value = startKeyframe.value + (endKeyframe.value - startKeyframe.value) * eased;
    this.onUpdate?.(value);
  }

  /**
   * Get current progress (0-1)
   */
  getProgress(): number {
    return this.progress;
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Set update callback
   */
  onUpdateCallback(callback: (progress: number) => void): void {
    this.onUpdate = callback;
  }

  /**
   * Set complete callback
   */
  onCompleteCallback(callback: () => void): void {
    this.onComplete = callback;
  }

  /**
   * Add keyframe
   */
  addKeyframe(keyframe: Keyframe): void {
    this.keyframes.push(keyframe);
    this.keyframes.sort((a, b) => a.time - b.time);
  }

  /**
   * Remove keyframe
   */
  removeKeyframe(index: number): void {
    this.keyframes.splice(index, 1);
  }

  /**
   * Get all keyframes
   */
  getKeyframes(): Keyframe[] {
    return [...this.keyframes];
  }
}

