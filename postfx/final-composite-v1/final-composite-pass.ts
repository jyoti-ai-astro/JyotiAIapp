/**
 * Final Composite v1 Pass
 * 
 * Phase 3 — Section 15: FINAL COMPOSITE ENGINE v1
 * Final Composite Engine v1 (F15)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { finalCompositeShader } from './final-composite-shader';

export interface FinalCompositePassConfig {
  intensity?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  exposure?: number;
  fade?: number;
  vibrance?: number;
  highlightRepair?: number;
  ditherStrength?: number;
  lift?: number;
  gamma?: number;
  gain?: number;
  time?: number;
}

export class FinalCompositePass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private exposureUniform: Uniform;
  private fadeUniform: Uniform;
  private resolutionUniform: Uniform;
  private vibranceUniform: Uniform;
  private highlightRepairUniform: Uniform;
  private ditherStrengthUniform: Uniform;
  private liftUniform: Uniform;
  private gammaUniform: Uniform;
  private gainUniform: Uniform;

  constructor(config: FinalCompositePassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const exposure = config.exposure ?? 1.0;
    const fade = config.fade ?? 1.0;
    const vibrance = config.vibrance ?? 1.0;
    const highlightRepair = config.highlightRepair ?? 0.5;
    const ditherStrength = config.ditherStrength ?? 0.5;
    const lift = config.lift ?? 0.0;
    const gamma = config.gamma ?? 1.0;
    const gain = config.gain ?? 1.0;
    const time = config.time ?? 0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const exposureUniform = new Uniform(exposure);
    const fadeUniform = new Uniform(fade);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const vibranceUniform = new Uniform(vibrance);
    const highlightRepairUniform = new Uniform(highlightRepair);
    const ditherStrengthUniform = new Uniform(ditherStrength);
    const liftUniform = new Uniform(lift);
    const gammaUniform = new Uniform(gamma);
    const gainUniform = new Uniform(gain);

    super('FinalCompositePass', finalCompositeShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL, // Normal blending for final composite
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uExposure', exposureUniform],
        ['uFade', fadeUniform],
        ['uResolution', resolutionUniform],
        ['uVibrance', vibranceUniform],
        ['uHighlightRepair', highlightRepairUniform],
        ['uDitherStrength', ditherStrengthUniform],
        ['uLift', liftUniform],
        ['uGamma', gammaUniform],
        ['uGain', gainUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.intensityUniform = intensityUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.exposureUniform = exposureUniform;
    this.fadeUniform = fadeUniform;
    this.resolutionUniform = resolutionUniform;
    this.vibranceUniform = vibranceUniform;
    this.highlightRepairUniform = highlightRepairUniform;
    this.ditherStrengthUniform = ditherStrengthUniform;
    this.liftUniform = liftUniform;
    this.gammaUniform = gammaUniform;
    this.gainUniform = gainUniform;
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
   * Update exposure
   */
  setExposure(value: number): void {
    this.exposureUniform.value = value;
  }

  /**
   * Update fade
   */
  setFade(value: number): void {
    this.fadeUniform.value = value;
  }

  /**
   * Update vibrance
   */
  setVibrance(value: number): void {
    this.vibranceUniform.value = value;
  }

  /**
   * Update highlight repair
   */
  setHighlightRepair(value: number): void {
    this.highlightRepairUniform.value = value;
  }

  /**
   * Update dither strength
   */
  setDitherStrength(value: number): void {
    this.ditherStrengthUniform.value = value;
  }

  /**
   * Update lift
   */
  setLift(value: number): void {
    this.liftUniform.value = value;
  }

  /**
   * Update gamma
   */
  setGamma(value: number): void {
    this.gammaUniform.value = value;
  }

  /**
   * Update gain
   */
  setGain(value: number): void {
    this.gainUniform.value = value;
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

