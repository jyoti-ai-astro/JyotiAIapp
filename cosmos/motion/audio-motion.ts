/**
 * Audio Motion
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Maps FFT values to motion curves
 */

import { FFTData } from '../audio/fft-processor';
import { ExponentialSmoothing } from '../audio/utils/smoothing';
import { easeOutCubic, easeInOutExpo } from './easing';

export interface AudioMotionData {
  bassMotion: number; // 0-1 (expansion)
  midMotion: number; // 0-1 (distortion)
  highMotion: number; // 0-1 (shimmer)
}

export class AudioMotion {
  private bassSmoother: ExponentialSmoothing;
  private midSmoother: ExponentialSmoothing;
  private highSmoother: ExponentialSmoothing;
  
  private currentData: AudioMotionData = {
    bassMotion: 0,
    midMotion: 0,
    highMotion: 0,
  };

  constructor(smoothing: number = 0.15) {
    this.bassSmoother = new ExponentialSmoothing(smoothing);
    this.midSmoother = new ExponentialSmoothing(smoothing);
    this.highSmoother = new ExponentialSmoothing(smoothing);
  }

  /**
   * Update audio motion from FFT data
   */
  update(fftData: FFTData): AudioMotionData {
    // Bass → expansion (easeOutCubic for smooth expansion)
    const bassRaw = this.bassSmoother.update(fftData.bass);
    const bassMotion = easeOutCubic(bassRaw);
    
    // Mid → distortion (easeInOutExpo for dynamic distortion)
    const midRaw = this.midSmoother.update(fftData.mid);
    const midMotion = easeInOutExpo(midRaw);
    
    // High → shimmer (linear for responsive shimmer)
    const highRaw = this.highSmoother.update(fftData.high);
    const highMotion = highRaw; // Linear for immediate response
    
    this.currentData = {
      bassMotion: Math.max(0, Math.min(1, bassMotion)),
      midMotion: Math.max(0, Math.min(1, midMotion)),
      highMotion: Math.max(0, Math.min(1, highMotion)),
    };
    
    return this.currentData;
  }

  /**
   * Get current audio motion data
   */
  getData(): AudioMotionData {
    return { ...this.currentData };
  }

  /**
   * Reset audio motion
   */
  reset(): void {
    this.bassSmoother.reset();
    this.midSmoother.reset();
    this.highSmoother.reset();
    this.currentData = {
      bassMotion: 0,
      midMotion: 0,
      highMotion: 0,
    };
  }
}

