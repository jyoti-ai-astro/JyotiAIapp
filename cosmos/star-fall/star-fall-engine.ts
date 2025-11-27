/**
 * StarFall Engine
 * 
 * Phase 2 — Section 40: STARFALL ENGINE
 * StarFall Engine (E44)
 * 
 * Generate streaks, spark particles, impact glows, manage uniforms
 */

import * as THREE from 'three';
import { starfallVertexShader } from './shaders/starfall-vertex';
import { starfallFragmentShader } from './shaders/starfall-fragment';

export interface StarFallEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numStreaks?: number;
  numSparks?: number;
  numGlows?: number;
}

export interface StreakData {
  streakIndex: number;
  xPosition: number;
  fallSpeed: number;
  length: number;
}

export interface SparkData {
  sparkIndex: number;
  xPosition: number;
  fallSpeed: number;
  radius: number;
}

export interface GlowData {
  glowIndex: number;
  xPosition: number;
  radius: number;
}

export class StarFallEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: StarFallEngineConfig;
  
  private streaks: StreakData[] = [];
  private sparks: SparkData[] = [];
  private glows: GlowData[] = [];
  
  private numStreaks: number;
  private numSparks: number;
  private numGlows: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: StarFallEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numStreaks: config.numStreaks || 60,
      numSparks: config.numSparks || 115,
      numGlows: config.numGlows || 15,
    };
    
    this.numStreaks = this.config.numStreaks || 60;
    this.numSparks = this.config.numSparks || 115;
    this.numGlows = this.config.numGlows || 15;
    
    // Generate streaks
    this.generateStreaks();
    
    // Generate sparks
    this.generateSparks();
    
    // Generate glows
    this.generateGlows();
    
    // Create geometry
    this.geometry = this.createGeometry();
    
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
        uRotationSync: { value: 0 },
        uCameraFOV: { value: 75.0 },
      },
      vertexShader: starfallVertexShader,
      fragmentShader: starfallFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate streaks (40-80)
   */
  private generateStreaks(): void {
    this.streaks = [];
    
    for (let i = 0; i < this.numStreaks; i++) {
      const xPosition = (i / this.numStreaks) * 2.0 - 1.0; // Spread across X
      const fallSpeed = 0.5 + (i % 3) * 0.1; // Varying speeds
      const length = 0.25 + (i % 2) * 0.15; // Varying lengths
      
      this.streaks.push({
        streakIndex: i,
        xPosition,
        fallSpeed,
        length,
      });
    }
  }

  /**
   * Generate sparks (80-150)
   */
  private generateSparks(): void {
    this.sparks = [];
    
    for (let i = 0; i < this.numSparks; i++) {
      const xPosition = (i / this.numSparks) * 2.0 - 1.0; // Spread across X
      const fallSpeed = 0.4 + (i % 4) * 0.05; // Varying speeds
      const radius = 0.015; // 0.01-0.02 range
      
      this.sparks.push({
        sparkIndex: i,
        xPosition,
        fallSpeed,
        radius,
      });
    }
  }

  /**
   * Generate glows (10-20)
   */
  private generateGlows(): void {
    this.glows = [];
    
    for (let i = 0; i < this.numGlows; i++) {
      const xPosition = (i / this.numGlows) * 2.0 - 1.0; // Spread across X
      const radius = 0.12; // 0.08-0.16 range
      
      this.glows.push({
        glowIndex: i,
        xPosition,
        radius,
      });
    }
  }

  /**
   * Create geometry with streaks, sparks, and glows
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const streakIndices: number[] = [];
    const sparkIndices: number[] = [];
    const glowIndices: number[] = [];
    
    // ============================================
    // STREAKS (Layer A)
    // ============================================
    const streakThickness = 0.015;
    const streakLength = 0.4; // Average length
    
    for (let i = 0; i < this.numStreaks; i++) {
      const streak = this.streaks[i];
      const x = streak.xPosition;
      const y = 0.0; // Will be animated in shader
      const z = -5.8;
      
      // Create quad for streak (extruded along Y)
      positions.push(
        x - streakThickness, y - streakLength, z, // Bottom-left
        x + streakThickness, y - streakLength, z, // Bottom-right
        x - streakThickness, y + streakLength, z, // Top-left
        x + streakThickness, y + streakLength, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      streakIndices.push(i, i, i, i);
      sparkIndices.push(-1, -1, -1, -1);
      glowIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // SPARKS (Layer B)
    // ============================================
    const sparkRadius = 0.015;
    
    for (let i = 0; i < this.numSparks; i++) {
      const spark = this.sparks[i];
      const x = spark.xPosition;
      const y = 0.0; // Will be animated in shader
      const z = -5.8;
      
      // Create quad for each spark
      positions.push(
        x - sparkRadius, y - sparkRadius, z, // Bottom-left
        x + sparkRadius, y - sparkRadius, z, // Bottom-right
        x - sparkRadius, y + sparkRadius, z, // Top-left
        x + sparkRadius, y + sparkRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      streakIndices.push(-1, -1, -1, -1);
      sparkIndices.push(i, i, i, i);
      glowIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // GLOWS (Layer C)
    // ============================================
    const glowRadius = 0.12;
    const glowSegments = 16; // Billboards
    
    for (let i = 0; i < this.numGlows; i++) {
      const glow = this.glows[i];
      const x = glow.xPosition;
      const y = -1.0; // Bottom plane
      const z = -5.8;
      
      // Create quad for each glow (polar billboard)
      positions.push(
        x - glowRadius, y - glowRadius, z, // Bottom-left
        x + glowRadius, y - glowRadius, z, // Bottom-right
        x - glowRadius, y + glowRadius, z, // Top-left
        x + glowRadius, y + glowRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      streakIndices.push(-1, -1, -1, -1);
      sparkIndices.push(-1, -1, -1, -1);
      glowIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('streakIndex', new THREE.Float32BufferAttribute(streakIndices, 1));
    geometry.setAttribute('sparkIndex', new THREE.Float32BufferAttribute(sparkIndices, 1));
    geometry.setAttribute('glowIndex', new THREE.Float32BufferAttribute(glowIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Streaks (quads)
    for (let i = 0; i < this.numStreaks; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Sparks (quads)
    for (let i = 0; i < this.numSparks; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Glows (quads)
    for (let i = 0; i < this.numGlows; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
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
   * Set rotation sync (from Projection E17)
   */
  setRotationSync(rotation: number): void {
    this.rotationSync = rotation;
    if (this.material.uniforms) {
      this.material.uniforms.uRotationSync.value = rotation;
    }
  }

  /**
   * Set camera FOV (from CameraController E18)
   */
  setCameraFOV(fov: number): void {
    this.cameraFOV = fov;
    if (this.material.uniforms) {
      this.material.uniforms.uCameraFOV.value = fov;
    }
  }

  /**
   * Update with starfall state
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
   * Get geometry
   */
  getGeometry(): THREE.BufferGeometry {
    return this.geometry;
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

