/**
 * Cosmic Glare v1 Engine
 * 
 * Phase 3 — Section 4: COSMIC GLARE ENGINE v1
 * Cosmic Glare Engine v1 (F4)
 * 
 * Anamorphic streaks + starburst halo + blessing flare engine
 * with 2-pass streak RT pipeline (H + V)
 */

import * as THREE from 'three';
import { Uniform, WebGLRenderTarget, Vector2 } from 'three';
import { cosmicGlareShader, horizontalStreakShader, verticalStreakShader } from './cosmic-glare-shader';

export interface CosmicGlareEngineConfig {
  glareIntensity?: number;
  streakLength?: number;
  starStrength?: number;
  isMobile?: boolean;
}

export class CosmicGlareEngine {
  private config: CosmicGlareEngineConfig;
  private horizontalStreakTarget: WebGLRenderTarget | null = null;
  private verticalStreakTarget: WebGLRenderTarget | null = null;
  private compositeTarget: WebGLRenderTarget | null = null;
  private horizontalStreakPass: THREE.ShaderMaterial | null = null;
  private verticalStreakPass: THREE.ShaderMaterial | null = null;
  private compositePass: THREE.ShaderMaterial | null = null;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uStreakLength: Uniform;
    uStarStrength: Uniform;
    uResolution: Uniform;
    uKernelSize: Uniform;
  };

  constructor(config: CosmicGlareEngineConfig = {}) {
    this.config = {
      glareIntensity: config.glareIntensity || 1.0,
      streakLength: config.streakLength || 0.5,
      starStrength: config.starStrength || 1.0,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce streak kernel
    const kernelSize = this.config.isMobile ? 9 : 15;

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(this.config.glareIntensity),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uStreakLength: new Uniform(this.config.streakLength),
      uStarStrength: new Uniform(this.config.starStrength),
      uResolution: new Uniform(new Vector2(1, 1)),
      uKernelSize: new Uniform(kernelSize),
    };

    // Create scene and camera for fullscreen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);

    // Initialize render targets and passes
    this.initializeRenderTargets();
  }

  /**
   * Initialize render targets for 2-pass streak pipeline
   */
  private initializeRenderTargets(): void {
    const resolution = 512; // Can be adjusted
    
    // Create horizontal streak render target
    this.horizontalStreakTarget = new WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });

    // Create vertical streak render target
    this.verticalStreakTarget = new WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });

    // Create composite render target
    this.compositeTarget = new WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });

    // Create horizontal streak pass material
    this.horizontalStreakPass = new THREE.ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uInputTexture: new Uniform(null),
      },
      vertexShader: horizontalStreakShader.vertexShader,
      fragmentShader: horizontalStreakShader.fragmentShader,
    });

    // Create vertical streak pass material
    this.verticalStreakPass = new THREE.ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uInputTexture: new Uniform(null),
      },
      vertexShader: verticalStreakShader.vertexShader,
      fragmentShader: verticalStreakShader.fragmentShader,
    });

    // Create composite pass material
    this.compositePass = new THREE.ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uInputTexture: new Uniform(null),
        uHorizontalStreak: new Uniform(null),
        uVerticalStreak: new Uniform(null),
      },
      vertexShader: cosmicGlareShader.vertexShader,
      fragmentShader: cosmicGlareShader.fragmentShader,
    });
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
    resolution: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;

    // Update all pass materials
    if (this.horizontalStreakPass) {
      Object.assign(this.horizontalStreakPass.uniforms, this.uniforms);
      this.horizontalStreakPass.uniforms.uResolution.value = resolution;
    }
    if (this.verticalStreakPass) {
      Object.assign(this.verticalStreakPass.uniforms, this.uniforms);
      this.verticalStreakPass.uniforms.uResolution.value = resolution;
    }
    if (this.compositePass) {
      Object.assign(this.compositePass.uniforms, this.uniforms);
      this.compositePass.uniforms.uResolution.value = resolution;
    }
  }

  /**
   * Render glare pipeline
   */
  render(
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    outputTarget: WebGLRenderTarget
  ): void {
    if (!this.horizontalStreakTarget || !this.verticalStreakTarget || !this.compositeTarget) return;
    if (!this.horizontalStreakPass || !this.verticalStreakPass || !this.compositePass) return;

    // Pass 1: Horizontal anamorphic streak
    this.horizontalStreakPass.uniforms.uInputTexture.value = inputTexture;
    this.quad.material = this.horizontalStreakPass;
    renderer.setRenderTarget(this.horizontalStreakTarget);
    renderer.render(this.scene, this.camera);

    // Pass 2: Vertical streak
    this.verticalStreakPass.uniforms.uInputTexture.value = inputTexture;
    this.quad.material = this.verticalStreakPass;
    renderer.setRenderTarget(this.verticalStreakTarget);
    renderer.render(this.scene, this.camera);

    // Pass 3: Composite (starburst + blessing flare + combine streaks)
    this.compositePass.uniforms.uInputTexture.value = inputTexture;
    this.compositePass.uniforms.uHorizontalStreak.value = this.horizontalStreakTarget.texture;
    this.compositePass.uniforms.uVerticalStreak.value = this.verticalStreakTarget.texture;
    this.quad.material = this.compositePass;
    renderer.setRenderTarget(outputTarget);
    renderer.render(this.scene, this.camera);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.horizontalStreakTarget) this.horizontalStreakTarget.dispose();
    if (this.verticalStreakTarget) this.verticalStreakTarget.dispose();
    if (this.compositeTarget) this.compositeTarget.dispose();

    if (this.horizontalStreakPass) this.horizontalStreakPass.dispose();
    if (this.verticalStreakPass) this.verticalStreakPass.dispose();
    if (this.compositePass) this.compositePass.dispose();

    this.quad.geometry.dispose();
  }
}

