/**
 * Solar Arc Engine
 * 
 * Phase 2 — Section 47: SOLAR ARC FIELD ENGINE
 * Solar Arc Engine (E51)
 * 
 * Generate primary arcs, reverse arcs, solar sparks, manage uniforms
 */

import * as THREE from 'three';
import { solarArcVertexShader } from './shaders/solar-arc-vertex';
import { solarArcFragmentShader } from './shaders/solar-arc-fragment';

export interface SolarArcEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSparks?: number;
}

export interface PrimaryArcData {
  arcIndex: number;
  baseRadius: number; // 3.5 to 6.0
  thickness: number;
}

export interface ReverseArcData {
  reverseArcIndex: number;
  baseRadius: number; // 4.0 to 6.0
  thickness: number;
}

export interface SparkData {
  sparkIndex: number;
  speed: number;
  baseRadius: number;
}

export class SolarArcEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: SolarArcEngineConfig;
  
  private primaryArcs: PrimaryArcData[] = [];
  private reverseArcs: ReverseArcData[] = [];
  private sparks: SparkData[] = [];
  
  private numSparks: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: SolarArcEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numSparks: config.numSparks || 180,
    };
    
    this.numSparks = this.config.numSparks || 180;
    
    // Generate primary arcs
    this.generatePrimaryArcs();
    
    // Generate reverse arcs
    this.generateReverseArcs();
    
    // Generate sparks
    this.generateSparks();
    
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
      vertexShader: solarArcVertexShader,
      fragmentShader: solarArcFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate primary arcs (2-3 arcs)
   */
  private generatePrimaryArcs(): void {
    this.primaryArcs = [];
    
    for (let i = 0; i < 3; i++) {
      const baseRadius = 3.5 + (i / 2.0) * 2.5; // 3.5 to 6.0
      this.primaryArcs.push({
        arcIndex: i,
        baseRadius,
        thickness: 0.25,
      });
    }
  }

  /**
   * Generate reverse arcs (2 arcs)
   */
  private generateReverseArcs(): void {
    this.reverseArcs = [];
    
    for (let i = 0; i < 2; i++) {
      const baseRadius = 4.0 + (i / 1.0) * 2.0; // 4.0 to 6.0
      this.reverseArcs.push({
        reverseArcIndex: i,
        baseRadius,
        thickness: 0.25,
      });
    }
  }

  /**
   * Generate sparks (140-220)
   */
  private generateSparks(): void {
    this.sparks = [];
    
    for (let i = 0; i < this.numSparks; i++) {
      const speed = 0.15 + (i / this.numSparks) * 0.1; // Varying speeds
      const baseRadius = 3.5 + (i / this.numSparks) * 2.5; // 3.5 to 6.0
      
      this.sparks.push({
        sparkIndex: i,
        speed,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with primary arcs, reverse arcs, and sparks
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const arcIndices: number[] = [];
    const reverseArcIndices: number[] = [];
    const sparkIndices: number[] = [];
    
    // ============================================
    // PRIMARY ARCS (Layer A - 3 arcs)
    // ============================================
    const arcSegments = 32; // Segments per arc
    const thickness = 0.25;
    
    for (let arc = 0; arc < 3; arc++) {
      const arcData = this.primaryArcs[arc];
      
      for (let i = 0; i <= arcSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / arcSegments; // Angle: 0 to 1 (0 to π)
          const v = j / 4.0; // Thickness: 0 to 1
          
          const angle = u * Math.PI; // 0 to π
          const radius = arcData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          arcIndices.push(arc);
          reverseArcIndices.push(-1);
          sparkIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // REVERSE ARCS (Layer B - 2 arcs)
    // ============================================
    for (let arc = 0; arc < 2; arc++) {
      const arcData = this.reverseArcs[arc];
      
      for (let i = 0; i <= arcSegments; i++) {
        for (let j = 0; j <= 4; j++) {
          const u = i / arcSegments;
          const v = j / 4.0;
          
          const angle = u * Math.PI;
          const radius = arcData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          arcIndices.push(-1);
          reverseArcIndices.push(arc);
          sparkIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // SPARKS (Layer C)
    // ============================================
    const sparkRadius = 0.0125;
    
    for (let i = 0; i < this.numSparks; i++) {
      const spark = this.sparks[i];
      const x = 0.0; // Will be positioned in shader
      const y = 0.0;
      const z = 0.0;
      
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
      arcIndices.push(-1, -1, -1, -1);
      reverseArcIndices.push(-1, -1, -1, -1);
      sparkIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('arcIndex', new THREE.Float32BufferAttribute(arcIndices, 1));
    geometry.setAttribute('reverseArcIndex', new THREE.Float32BufferAttribute(reverseArcIndices, 1));
    geometry.setAttribute('sparkIndex', new THREE.Float32BufferAttribute(sparkIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Primary arcs (quads) - 3 arcs
    for (let arc = 0; arc < 3; arc++) {
      for (let i = 0; i < arcSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (arcSegments + 1) * 5;
    }
    
    // Reverse arcs (quads) - 2 arcs
    for (let arc = 0; arc < 2; arc++) {
      for (let i = 0; i < arcSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (arcSegments + 1) * 5;
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
   * Update with solar arc state
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

