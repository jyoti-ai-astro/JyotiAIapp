/**
 * Path Indicator Engine
 * 
 * Phase 2 — Section 20: DIVINE PATH INDICATOR ENGINE
 * Path Indicator Engine (E24)
 * 
 * Precompute spline path, manage bead positions, line segments, shader uniforms
 */

import * as THREE from 'three';
import { pathVertexShader } from './shaders/path-vertex';
import { pathFragmentShader } from './shaders/path-fragment';

export interface PathIndicatorEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numBeads?: number;
}

export interface SplinePoint {
  position: THREE.Vector3;
  t: number; // Normalized position along path (0-1)
}

export class PathIndicatorEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: PathIndicatorEngineConfig;
  
  private splinePoints: SplinePoint[] = [];
  private numBeads: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private pathRotation: number = 0;
  private pulseIntensity: number = 0;
  private pulseDamping: number = 0.9;

  constructor(config: PathIndicatorEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numBeads: config.numBeads || 20,
    };
    
    this.numBeads = this.config.numBeads || 20;
    
    // Precompute spline path (phi-based spiral)
    this.precomputeSpline();
    
    // Create geometry with bead positions
    this.geometry = this.createBeadGeometry();
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: this.config.intensity },
        uBreathPhase: { value: 0 },
        uBreathStrength: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uScroll: { value: 0 },
        uBlessingWaveProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uParallaxStrength: { value: this.config.parallaxStrength },
        uPathRotation: { value: 0 },
      },
      vertexShader: pathVertexShader,
      fragmentShader: pathFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Precompute spline path (phi-based spiral)
   */
  private precomputeSpline(): void {
    this.splinePoints = [];
    
    for (let i = 0; i < this.numBeads; i++) {
      const t = i / (this.numBeads - 1); // 0 to 1
      const point = this.phiSpiralSpline(t);
      this.splinePoints.push({
        position: point,
        t: t,
      });
    }
  }

  /**
   * Phi-based spiral spline (golden ratio)
   */
  private phiSpiralSpline(t: number): THREE.Vector3 {
    // Phi = 1.618033988749895
    const phi = 1.618033988749895;
    
    // Spiral parameters
    const spiralRadius = 0.8;
    const spiralTurns = 1.5;
    const spiralHeight = -0.5;
    
    // Angle based on phi
    const angle = t * spiralTurns * Math.PI * 2;
    const radius = t * spiralRadius;
    
    // X-Z plane spiral (horizontal)
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Y position (vertical lift with scroll)
    const y = spiralHeight + t * 0.3;
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Create geometry with bead positions
   */
  private createBeadGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const beadIndices: number[] = [];
    
    // Create a small quad for each bead
    const beadSize = 0.05;
    
    for (let i = 0; i < this.numBeads; i++) {
      const point = this.splinePoints[i];
      const beadIndex = i;
      
      // Create quad centered at bead position
      const x = point.position.x;
      const y = point.position.y;
      const z = point.position.z;
      
      // Quad vertices (4 vertices per bead)
      positions.push(
        x - beadSize, y, z - beadSize, // Bottom-left
        x + beadSize, y, z - beadSize, // Bottom-right
        x - beadSize, y, z + beadSize, // Top-left
        x + beadSize, y, z + beadSize  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Bead index (same for all 4 vertices of a bead)
      beadIndices.push(beadIndex, beadIndex, beadIndex, beadIndex);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('beadIndex', new THREE.Float32BufferAttribute(beadIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    for (let i = 0; i < this.numBeads; i++) {
      const base = i * 4;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
    }
    geometry.setIndex(indices);
    
    geometry.computeVertexNormals();
    
    return geometry;
  }

  /**
   * Set breath data
   */
  setBreath(phase: number, strength: number): void {
    this.breathPhase = phase;
    this.breathStrength = strength;
    if (this.material.uniforms) {
      this.material.uniforms.uBreathPhase.value = phase;
      this.material.uniforms.uBreathStrength.value = strength;
    }
  }

  /**
   * Set blessing wave progress
   */
  setBlessingWave(progress: number): void {
    this.blessingWaveProgress = progress;
    if (this.material.uniforms) {
      this.material.uniforms.uBlessingWaveProgress.value = progress;
    }
  }

  /**
   * Set scroll progress
   */
  setScroll(scroll: number): void {
    this.scrollProgress = scroll;
    if (this.material.uniforms) {
      this.material.uniforms.uScroll.value = scroll;
    }
  }

  /**
   * Set path rotation (mandala-alignment from Projection E17)
   */
  setPathRotation(rotation: number): void {
    this.pathRotation = rotation;
    if (this.material.uniforms) {
      this.material.uniforms.uPathRotation.value = rotation;
    }
  }

  /**
   * Pulse path
   */
  pulse(intensity: number = 1.0): void {
    this.pulseIntensity = intensity;
  }

  /**
   * Update with path indicator state
   */
  update(
    time: number,
    scrollProgress: number,
    bass: number,
    mid: number,
    high: number,
    deltaTime: number
  ): void {
    if (!this.material.uniforms) return;
    
    // Update time
    this.material.uniforms.uTime.value = time;
    
    // Update scroll
    this.material.uniforms.uScroll.value = scrollProgress;
    
    // Update audio reactive
    this.material.uniforms.uBass.value = bass;
    this.material.uniforms.uMid.value = mid;
    this.material.uniforms.uHigh.value = high;
    
    // Update pulse (decay)
    this.pulseIntensity *= this.pulseDamping;
    
    // Update intensity (with pulse)
    const finalIntensity = (this.config.intensity || 1.0) * (1.0 + this.pulseIntensity * 0.2);
    this.material.uniforms.uIntensity.value = finalIntensity;
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
   * Get spline points
   */
  getSplinePoints(): SplinePoint[] {
    return this.splinePoints;
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

