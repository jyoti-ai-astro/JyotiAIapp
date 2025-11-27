/**
 * Cosmic MotionBlur v1 Pass
 * 
 * Phase 3 — Section 12: COSMIC MOTIONBLUR ENGINE v1
 * Cosmic MotionBlur Engine v1 (F12)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicMotionBlurShader } from './cosmic-motionblur-shader';

export interface CosmicMotionBlurPassConfig {
  blurStrength?: number;
  radialStrength?: number;
  velocityFactor?: number;
  sampleCount?: number;
  bass?: number;
  mid?: number;
  high?: number;
  scrollVelocity?: Vector2;
  mouseVelocity?: Vector2;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  disableDepthAware?: boolean;
}

export class CosmicMotionBlurPass extends Effect {
  private timeUniform: Uniform;
  private blurStrengthUniform: Uniform;
  private radialStrengthUniform: Uniform;
  private velocityFactorUniform: Uniform;
  private sampleCountUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private scrollVelocityUniform: Uniform;
  private mouseVelocityUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;
  private disableDepthAwareUniform: Uniform;

  constructor(config: CosmicMotionBlurPassConfig = {}) {
    const blurStrength = config.blurStrength ?? 0.5;
    const radialStrength = config.radialStrength ?? 0.3;
    const velocityFactor = config.velocityFactor ?? 1.0;
    const sampleCount = config.sampleCount ?? 16.0;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const scrollVelocity = config.scrollVelocity ?? new Vector2(0, 0);
    const mouseVelocity = config.mouseVelocity ?? new Vector2(0, 0);
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const disableDepthAware = config.disableDepthAware ?? false;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const blurStrengthUniform = new Uniform(blurStrength);
    const radialStrengthUniform = new Uniform(radialStrength);
    const velocityFactorUniform = new Uniform(velocityFactor);
    const sampleCountUniform = new Uniform(sampleCount);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const scrollVelocityUniform = new Uniform(scrollVelocity);
    const mouseVelocityUniform = new Uniform(mouseVelocity);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const disableDepthAwareUniform = new Uniform(disableDepthAware ? 1.0 : 0.0);

    super('CosmicMotionBlurPass', cosmicMotionBlurShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL, // Normal blending for motion blur
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uBlurStrength', blurStrengthUniform],
        ['uRadialStrength', radialStrengthUniform],
        ['uVelocityFactor', velocityFactorUniform],
        ['uSampleCount', sampleCountUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uScrollVelocity', scrollVelocityUniform],
        ['uMouseVelocity', mouseVelocityUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
        ['uDisableDepthAware', disableDepthAwareUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.blurStrengthUniform = blurStrengthUniform;
    this.radialStrengthUniform = radialStrengthUniform;
    this.velocityFactorUniform = velocityFactorUniform;
    this.sampleCountUniform = sampleCountUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.scrollVelocityUniform = scrollVelocityUniform;
    this.mouseVelocityUniform = mouseVelocityUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
    this.disableDepthAwareUniform = disableDepthAwareUniform;
  }

  /**
   * Update time
   */
  setTime(value: number): void {
    this.timeUniform.value = value;
  }

  /**
   * Update audio reactive values
   */
  setAudioReactive(bass: number, mid: number, high: number): void {
    this.bassUniform.value = bass;
    this.midUniform.value = mid;
    this.highUniform.value = high;
  }

  /**
   * Update scroll velocity
   */
  setScrollVelocity(x: number, y: number): void {
    this.scrollVelocityUniform.value.set(x, y);
  }

  /**
   * Update mouse velocity
   */
  setMouseVelocity(x: number, y: number): void {
    this.mouseVelocityUniform.value.set(x, y);
  }

  /**
   * Update blessing wave progress
   */
  setBlessingWaveProgress(value: number): void {
    this.blessingWaveUniform.value = value;
  }

  /**
   * Update camera FOV
   */
  setCameraFOV(value: number): void {
    this.cameraFOVUniform.value = value;
  }

  /**
   * Update blur strength
   */
  setBlurStrength(value: number): void {
    this.blurStrengthUniform.value = value;
  }

  /**
   * Update radial strength
   */
  setRadialStrength(value: number): void {
    this.radialStrengthUniform.value = value;
  }

  /**
   * Update velocity factor
   */
  setVelocityFactor(value: number): void {
    this.velocityFactorUniform.value = value;
  }

  /**
   * Update sample count
   */
  setSampleCount(value: number): void {
    this.sampleCountUniform.value = value;
  }

  /**
   * Update disable depth-aware flag
   */
  setDisableDepthAware(value: boolean): void {
    this.disableDepthAwareUniform.value = value ? 1.0 : 0.0;
  }

  /**
   * Update resolution
   */
  setResolution(width: number, height: number): void {
    this.resolutionUniform.value.set(width, height);
  }

  /**
   * Update method called each frame
   */
  update(renderer: any, inputBuffer: any, deltaTime: number): void {
    // Update time
    this.timeUniform.value += deltaTime;
    
    // Update resolution from input buffer
    if (inputBuffer) {
      const width = inputBuffer.width || 1;
      const height = inputBuffer.height || 1;
      this.resolutionUniform.value.set(width, height);
    }
  }
}

