/**
 * Face Engine
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * Holds mesh + material and applies expression uniforms
 */

import * as THREE from 'three';
import { FaceExpressions, ExpressionName } from './face-expressions';
import { faceVertexShader } from './shaders/face-vertex';
import { faceFragmentShader } from './shaders/face-fragment';

export interface FaceEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
}

export class FaceEngine {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: FaceEngineConfig;
  private expressions: FaceExpressions;
  private currentExpression: ExpressionName = 'neutral';
  private faceTarget: { u: number; v: number } = { u: 0.5, v: 0.5 };

  constructor(config: FaceEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    this.expressions = new FaceExpressions();
    
    // Create high-resolution plane geometry for face
    this.geometry = new THREE.PlaneGeometry(1.0, 1.0, 64, 64);
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: this.config.intensity },
        uBreathPhase: { value: 0 },
        uBlinkPhase: { value: 0 },
        uBrow: { value: 0 },
        uEye: { value: 0.7 },
        uCheek: { value: 0 },
        uMouthCurve: { value: 0 },
        uGlow: { value: 0.2 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uScroll: { value: 0 },
        uScrollVelocity: { value: 0 },
        uScrollDirection: { value: 0 },
        uBlessingWaveProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uParallaxStrength: { value: this.config.parallaxStrength },
      },
      vertexShader: faceVertexShader,
      fragmentShader: faceFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Set expression
   */
  setExpression(name: ExpressionName): void {
    this.expressions.setExpression(name);
    this.currentExpression = name;
  }

  /**
   * Trigger blessing expression
   */
  triggerBlessingExpression(): void {
    this.expressions.triggerBlessingExpression();
    this.currentExpression = 'blessing-smile';
  }

  /**
   * Set face target (UV coordinates)
   */
  setFaceTarget(u: number, v: number): void {
    this.faceTarget = { u, v };
  }

  /**
   * Reset expression
   */
  resetExpression(): void {
    this.expressions.resetExpression();
    this.currentExpression = 'neutral';
  }

  /**
   * Update with face state
   */
  update(
    expression: any,
    breathPhase: number,
    blinkPhase: number,
    audioBass: number,
    audioMid: number,
    audioHigh: number,
    scrollProgress: number,
    scrollVelocity: number,
    scrollDirection: number,
    blessingWaveProgress: number
  ): void {
    if (!this.material.uniforms) return;
    
    // Update expression uniforms
    this.material.uniforms.uBrow.value = expression.brow;
    this.material.uniforms.uEye.value = expression.eye;
    this.material.uniforms.uCheek.value = expression.cheek;
    this.material.uniforms.uMouthCurve.value = expression.mouthCurve;
    this.material.uniforms.uGlow.value = expression.glow;
    
    // Update base layer uniforms
    this.material.uniforms.uBreathPhase.value = breathPhase;
    this.material.uniforms.uBlinkPhase.value = blinkPhase;
    
    // Update audio-reactive uniforms
    this.material.uniforms.uBass.value = audioBass;
    this.material.uniforms.uMid.value = audioMid;
    this.material.uniforms.uHigh.value = audioHigh;
    
    // Update scroll-reactive uniforms
    this.material.uniforms.uScroll.value = scrollProgress;
    this.material.uniforms.uScrollVelocity.value = scrollVelocity;
    this.material.uniforms.uScrollDirection.value = scrollDirection;
    
    // Update blessing wave
    this.material.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    
    // Update intensity
    this.material.uniforms.uIntensity.value = this.config.intensity || 1.0;
    this.material.uniforms.uParallaxStrength.value = this.config.parallaxStrength || 1.0;
    
    // Update mouse
    if (this.config.mouse) {
      this.material.uniforms.uMouse.value.set(
        this.config.mouse.x,
        this.config.mouse.y
      );
    }
  }

  /**
   * Get mesh (for R3F)
   */
  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Get material
   */
  getMaterial(): THREE.ShaderMaterial {
    return this.material;
  }

  /**
   * Get expressions
   */
  getExpressions(): FaceExpressions {
    return this.expressions;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Set scale
   */
  setScale(scale: number): void {
    this.mesh.scale.setScalar(scale);
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

