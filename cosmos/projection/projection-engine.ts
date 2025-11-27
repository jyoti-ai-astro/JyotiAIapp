/**
 * Projection Engine
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Sacred Geometry Projection Engine (E17)
 * 
 * Creates mesh/material for sacred geometry projection
 */

import * as THREE from 'three';
import { projectionVertexShader } from './shaders/projection-vertex';
import { projectionFragmentShader } from './shaders/projection-fragment';
import { ProjectionState } from './hooks/use-projection-uniforms';

export interface ProjectionEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  scroll?: number;
  parallaxStrength?: number;
}

export class ProjectionEngine {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: ProjectionEngineConfig;

  constructor(config: ProjectionEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      scroll: config.scroll || 0,
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    // Create plane geometry (projection plane)
    this.geometry = new THREE.PlaneGeometry(4.0, 4.0, 64, 64);
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: this.config.intensity },
        uParallaxStrength: { value: this.config.parallaxStrength },
      },
      vertexShader: projectionVertexShader,
      fragmentShader: projectionFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2; // Face upward
  }

  /**
   * Update with projection state
   */
  update(projectionState: ProjectionState): void {
    if (!this.material.uniforms) return;
    
    // Update time
    this.material.uniforms.uTime.value = projectionState.time;
    
    // Update scroll
    this.material.uniforms.uScroll.value = projectionState.scrollProgress;
    
    // Update audio reactive
    this.material.uniforms.uBass.value = projectionState.bassMotion;
    this.material.uniforms.uMid.value = projectionState.midMotion;
    this.material.uniforms.uHigh.value = projectionState.highMotion;
    
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

