/**
 * Cosmic LensFlare v1 Engine
 * 
 * Phase 3 — Section 7: COSMIC LENSFLARE ENGINE v1
 * Cosmic LensFlare Engine v1 (F7)
 * 
 * Cinematic lens flares + ghosting + light streaks + chroma halos engine
 */

import * as THREE from 'three';
import { Uniform, Vector2 } from 'three';
import { cosmicLensFlareShader } from './cosmic-lensflare-shader';

export interface CosmicLensFlareEngineConfig {
  flareIntensity?: number;
  ghostIntensity?: number;
  chromaStrength?: number;
  streakLength?: number;
  isMobile?: boolean;
}

export class CosmicLensFlareEngine {
  private config: CosmicLensFlareEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uFlareIntensity: Uniform;
    uGhostIntensity: Uniform;
    uChromaStrength: Uniform;
    uStreakLength: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
    uGhostCount: Uniform;
    uFlareCenter: Uniform;
  };

  constructor(config: CosmicLensFlareEngineConfig = {}) {
    this.config = {
      flareIntensity: config.flareIntensity || 0.3,
      ghostIntensity: config.ghostIntensity || 0.2,
      chromaStrength: config.chromaStrength || 0.15,
      streakLength: config.streakLength || 0.5,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce ghost count to 3 and streakLength *= 0.5
    const ghostCount = this.config.isMobile ? 3.0 : 5.0;
    const streakLength = this.config.isMobile 
      ? (this.config.streakLength || 0.5) * 0.5 
      : (this.config.streakLength || 0.5);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(1.0),
      uFlareIntensity: new Uniform(this.config.flareIntensity),
      uGhostIntensity: new Uniform(this.config.ghostIntensity),
      uChromaStrength: new Uniform(this.config.chromaStrength),
      uStreakLength: new Uniform(streakLength),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uGhostCount: new Uniform(ghostCount),
      uFlareCenter: new Uniform(new Vector2(0.5, 0.5)),
    };

    // Create scene and camera for fullscreen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);
  }

  /**
   * Update uniforms
   */
  updateUniforms(
    time: number,
    bass: number,
    mid: number,
    high: number,
    blessingWaveProgress: number,
    cameraFOV: number,
    resolution: Vector2,
    flareCenter?: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
    
    if (flareCenter) {
      this.uniforms.uFlareCenter.value = flareCenter;
    }
  }

  /**
   * Set flare intensity
   */
  setFlareIntensity(value: number): void {
    this.uniforms.uFlareIntensity.value = value;
  }

  /**
   * Set ghost intensity
   */
  setGhostIntensity(value: number): void {
    this.uniforms.uGhostIntensity.value = value;
  }

  /**
   * Set chroma strength
   */
  setChromaStrength(value: number): void {
    this.uniforms.uChromaStrength.value = value;
  }

  /**
   * Set streak length
   */
  setStreakLength(value: number): void {
    this.uniforms.uStreakLength.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

