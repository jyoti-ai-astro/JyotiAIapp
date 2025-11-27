/**
 * Cosmic ColorGrade v1 Pass
 * 
 * Phase 3 — Section 13: COSMIC COLORGRADE ENGINE v1
 * Cosmic ColorGrade Engine v1 (F13)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicColorGradeShader } from './cosmic-colorgrade-shader';

export interface CosmicColorGradePassConfig {
  lutStrength?: number;
  temperature?: number;
  tint?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  vibrance?: number;
  fade?: number;
  rolloff?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
}

export class CosmicColorGradePass extends Effect {
  private timeUniform: Uniform;
  private lutStrengthUniform: Uniform;
  private temperatureUniform: Uniform;
  private tintUniform: Uniform;
  private contrastUniform: Uniform;
  private gammaUniform: Uniform;
  private saturationUniform: Uniform;
  private vibranceUniform: Uniform;
  private fadeUniform: Uniform;
  private rolloffUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;

  constructor(config: CosmicColorGradePassConfig = {}) {
    const lutStrength = config.lutStrength ?? 0.3;
    const temperature = config.temperature ?? 0.0;
    const tint = config.tint ?? 0.0;
    const contrast = config.contrast ?? 1.0;
    const gamma = config.gamma ?? 1.0;
    const saturation = config.saturation ?? 1.0;
    const vibrance = config.vibrance ?? 1.0;
    const fade = config.fade ?? 0.0;
    const rolloff = config.rolloff ?? 0.5;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const lutStrengthUniform = new Uniform(lutStrength);
    const temperatureUniform = new Uniform(temperature);
    const tintUniform = new Uniform(tint);
    const contrastUniform = new Uniform(contrast);
    const gammaUniform = new Uniform(gamma);
    const saturationUniform = new Uniform(saturation);
    const vibranceUniform = new Uniform(vibrance);
    const fadeUniform = new Uniform(fade);
    const rolloffUniform = new Uniform(rolloff);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));

    super('CosmicColorGradePass', cosmicColorGradeShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL, // Normal blending for color grading
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uLutStrength', lutStrengthUniform],
        ['uTemperature', temperatureUniform],
        ['uTint', tintUniform],
        ['uContrast', contrastUniform],
        ['uGamma', gammaUniform],
        ['uSaturation', saturationUniform],
        ['uVibrance', vibranceUniform],
        ['uFade', fadeUniform],
        ['uRolloff', rolloffUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.lutStrengthUniform = lutStrengthUniform;
    this.temperatureUniform = temperatureUniform;
    this.tintUniform = tintUniform;
    this.contrastUniform = contrastUniform;
    this.gammaUniform = gammaUniform;
    this.saturationUniform = saturationUniform;
    this.vibranceUniform = vibranceUniform;
    this.fadeUniform = fadeUniform;
    this.rolloffUniform = rolloffUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
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
   * Update LUT strength
   */
  setLutStrength(value: number): void {
    this.lutStrengthUniform.value = value;
  }

  /**
   * Update temperature
   */
  setTemperature(value: number): void {
    this.temperatureUniform.value = value;
  }

  /**
   * Update tint
   */
  setTint(value: number): void {
    this.tintUniform.value = value;
  }

  /**
   * Update contrast
   */
  setContrast(value: number): void {
    this.contrastUniform.value = value;
  }

  /**
   * Update gamma
   */
  setGamma(value: number): void {
    this.gammaUniform.value = value;
  }

  /**
   * Update saturation
   */
  setSaturation(value: number): void {
    this.saturationUniform.value = value;
  }

  /**
   * Update vibrance
   */
  setVibrance(value: number): void {
    this.vibranceUniform.value = value;
  }

  /**
   * Update fade
   */
  setFade(value: number): void {
    this.fadeUniform.value = value;
  }

  /**
   * Update rolloff
   */
  setRolloff(value: number): void {
    this.rolloffUniform.value = value;
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

