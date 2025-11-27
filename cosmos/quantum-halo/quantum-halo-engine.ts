/**
 * Quantum Halo Engine
 * 
 * Phase 2 — Section 48: QUANTUM HALO ENGINE
 * Quantum Halo Engine (E52)
 * 
 * Generate primary rings, echo rings, quantum halo sparks, manage uniforms
 */

import * as THREE from 'three';
import { quantumHaloVertexShader } from './shaders/quantum-halo-vertex';
import { quantumHaloFragmentShader } from './shaders/quantum-halo-fragment';

export interface QuantumHaloEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSparks?: number;
}

export interface PrimaryRingData {
  ringIndex: number;
  baseRadius: number; // 2.0 to 6.0
  thickness: number;
}

export interface EchoRingData {
  echoRingIndex: number;
  baseRadius: number; // 2.5 to 6.0
  thickness: number;
}

export interface SparkData {
  sparkIndex: number;
  speed: number;
  baseRadius: number;
}

export class QuantumHaloEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: QuantumHaloEngineConfig;
  
  private primaryRings: PrimaryRingData[] = [];
  private echoRings: EchoRingData[] = [];
  private sparks: SparkData[] = [];
  
  private numSparks: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: QuantumHaloEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numSparks: config.numSparks || 260,
    };
    
    this.numSparks = this.config.numSparks || 260;
    
    // Generate primary rings
    this.generatePrimaryRings();
    
    // Generate echo rings
    this.generateEchoRings();
    
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
      vertexShader: quantumHaloVertexShader,
      fragmentShader: quantumHaloFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate primary rings (3-5 rings)
   */
  private generatePrimaryRings(): void {
    this.primaryRings = [];
    
    for (let i = 0; i < 5; i++) {
      const baseRadius = 2.0 + (i / 4.0) * 4.0; // 2.0 to 6.0
      this.primaryRings.push({
        ringIndex: i,
        baseRadius,
        thickness: 0.2,
      });
    }
  }

  /**
   * Generate echo rings (3 rings)
   */
  private generateEchoRings(): void {
    this.echoRings = [];
    
    for (let i = 0; i < 3; i++) {
      const baseRadius = 2.5 + (i / 2.0) * 3.5; // 2.5 to 6.0
      this.echoRings.push({
        echoRingIndex: i,
        baseRadius,
        thickness: 0.2,
      });
    }
  }

  /**
   * Generate sparks (200-320)
   */
  private generateSparks(): void {
    this.sparks = [];
    
    for (let i = 0; i < this.numSparks; i++) {
      const speed = 0.12 + (i / this.numSparks) * 0.08; // Varying speeds
      const baseRadius = 2.0 + (i / this.numSparks) * 4.0; // 2.0 to 6.0
      
      this.sparks.push({
        sparkIndex: i,
        speed,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with primary rings, echo rings, and sparks
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const ringIndices: number[] = [];
    const echoRingIndices: number[] = [];
    const sparkIndices: number[] = [];
    
    // ============================================
    // PRIMARY RINGS (Layer A - 5 rings)
    // ============================================
    const ringSegments = 64; // Segments per ring (full circle)
    const thickness = 0.2;
    
    for (let ring = 0; ring < 5; ring++) {
      const ringData = this.primaryRings[ring];
      
      for (let i = 0; i <= ringSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / ringSegments; // Angle: 0 to 1 (0 to 2π)
          const v = j / 4.0; // Thickness: 0 to 1
          
          const angle = u * Math.PI * 2.0; // 0 to 2π
          const radius = ringData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          ringIndices.push(ring);
          echoRingIndices.push(-1);
          sparkIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // ECHO RINGS (Layer B - 3 rings)
    // ============================================
    for (let ring = 0; ring < 3; ring++) {
      const ringData = this.echoRings[ring];
      
      for (let i = 0; i <= ringSegments; i++) {
        for (let j = 0; j <= 4; j++) {
          const u = i / ringSegments;
          const v = j / 4.0;
          
          const angle = u * Math.PI * 2.0;
          const radius = ringData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          ringIndices.push(-1);
          echoRingIndices.push(ring);
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
      ringIndices.push(-1, -1, -1, -1);
      echoRingIndices.push(-1, -1, -1, -1);
      sparkIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('ringIndex', new THREE.Float32BufferAttribute(ringIndices, 1));
    geometry.setAttribute('echoRingIndex', new THREE.Float32BufferAttribute(echoRingIndices, 1));
    geometry.setAttribute('sparkIndex', new THREE.Float32BufferAttribute(sparkIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Primary rings (quads) - 5 rings
    for (let ring = 0; ring < 5; ring++) {
      for (let i = 0; i < ringSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (ringSegments + 1) * 5;
    }
    
    // Echo rings (quads) - 3 rings
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i < ringSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (ringSegments + 1) * 5;
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
   * Update with quantum halo state
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

