/**
 * Spatial Audio
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * 3D spatial audio positioning with HRTF panning
 */

import { getAudioContext } from './audio-context';
import { createLowpassFilter, updateLowpassFilter } from './filters/lowpass-filter';

export interface SpatialAudioConfig {
  position?: [number, number, number];
  panningModel?: PanningModelType;
  distanceModel?: DistanceModelType;
  maxDistance?: number;
  refDistance?: number;
  rolloffFactor?: number;
}

export class SpatialAudio {
  private panner: PannerNode;
  private gain: GainNode;
  private lowpassFilter: BiquadFilterNode;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  
  private currentPosition: [number, number, number] = [0, 0, 0];
  private currentMouse: { x: number; y: number } = { x: 0, y: 0 };
  private currentScroll: number = 0;

  constructor(config: SpatialAudioConfig = {}) {
    const ctx = getAudioContext();
    
    // Create panner node (HRTF for 3D spatialization)
    this.panner = ctx.createPanner();
    this.panner.panningModel = config.panningModel || 'HRTF';
    this.panner.distanceModel = config.distanceModel || 'inverse';
    this.panner.maxDistance = config.maxDistance || 10000;
    this.panner.refDistance = config.refDistance || 1;
    this.panner.rolloffFactor = config.rolloffFactor || 1;
    
    // Create gain node for volume control
    this.gain = ctx.createGain();
    this.gain.gain.value = 1.0;
    
    // Create lowpass filter (reacts to scroll)
    this.lowpassFilter = createLowpassFilter({ frequency: 1000 });
    
    // Connect: source → lowpass → panner → gain → destination
    this.lowpassFilter.connect(this.panner);
    this.panner.connect(this.gain);
  }

  /**
   * Set 3D position
   */
  setPosition(x: number, y: number, z: number): void {
    this.currentPosition = [x, y, z];
    this.panner.positionX.value = x;
    this.panner.positionY.value = y;
    this.panner.positionZ.value = z;
    
    // Update panning based on mouse
    this.updatePanning();
  }

  /**
   * Set mouse position (affects panning)
   */
  setMouse(x: number, y: number): void {
    this.currentMouse = { x, y };
    this.updatePanning();
  }

  /**
   * Set scroll position (affects LPF cutoff)
   */
  setScroll(scroll: number): void {
    this.currentScroll = scroll;
    // Scroll increases LPF cutoff (brighter sound as user scrolls)
    const baseCutoff = 1000;
    const maxCutoff = 8000;
    const cutoff = baseCutoff + scroll * (maxCutoff - baseCutoff);
    updateLowpassFilter(this.lowpassFilter, cutoff);
  }

  /**
   * Update panning based on mouse position
   */
  private updatePanning(): void {
    // Mouse X → left/right pan
    const panX = this.currentMouse.x * 10; // Scale for effect
    
    // Mouse Y → vertical tilt
    const panY = this.currentMouse.y * 10;
    
    // Update position with panning offset
    this.panner.positionX.value = this.currentPosition[0] + panX;
    this.panner.positionY.value = this.currentPosition[1] + panY;
    this.panner.positionZ.value = this.currentPosition[2];
  }

  /**
   * Set audio buffer
   */
  setBuffer(buffer: AudioBuffer): void {
    this.buffer = buffer;
  }

  /**
   * Play audio
   */
  play(loop: boolean = false): void {
    if (!this.buffer) return;
    
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = this.buffer;
    source.loop = loop;
    
    // Connect source to filter chain
    source.connect(this.lowpassFilter);
    
    source.start(0);
    this.source = source;
  }

  /**
   * Stop audio
   */
  stop(): void {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
  }

  /**
   * Set gain (volume)
   */
  setGain(value: number): void {
    this.gain.gain.value = value;
  }

  /**
   * Get output node (for connection)
   */
  getOutput(): GainNode {
    return this.gain;
  }

  /**
   * Get input node (for connection)
   */
  getInput(): BiquadFilterNode {
    return this.lowpassFilter;
  }
}

