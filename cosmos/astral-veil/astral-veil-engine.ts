/**
 * Astral Veil Engine
 * 
 * Phase 2 — Section 29: ASTRAL VEIL ENGINE
 * Astral Veil Engine (E33)
 * 
 * Generate front veil plane, rear veil plane, mist particles, manage uniforms
 */

import * as THREE from 'three';
import { veilVertexShader } from './shaders/veil-vertex';
import { veilFragmentShader } from './shaders/veil-fragment';

export interface AstralVeilEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  frontVeilSegments?: number;
  rearVeilSegments?: number;
  numMistParticles?: number;
}

export interface FrontVeilData {
  segments: number;
}

export interface RearVeilData {
  segments: number;
}

export interface MistParticleData {
  particleIndex: number;
  position: THREE.Vector3;
}

export class AstralVeilEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AstralVeilEngineConfig;
  
  private frontVeil: FrontVeilData;
  private rearVeil: RearVeilData;
  private mistParticles: MistParticleData[] = [];
  
  private frontVeilSegments: number;
  private rearVeilSegments: number;
  private numMistParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AstralVeilEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      frontVeilSegments: config.frontVeilSegments || 48,
      rearVeilSegments: config.rearVeilSegments || 32,
      numMistParticles: config.numMistParticles || 120,
    };
    
    this.frontVeilSegments = this.config.frontVeilSegments || 48;
    this.rearVeilSegments = this.config.rearVeilSegments || 32;
    this.numMistParticles = this.config.numMistParticles || 120;
    
    // Generate front veil plane (48-64 segments)
    this.generateFrontVeil();
    
    // Generate rear veil plane (32-48 segments)
    this.generateRearVeil();
    
    // Generate mist particles (100-180)
    this.generateMistParticles();
    
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
      vertexShader: veilVertexShader,
      fragmentShader: veilFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate front veil plane (48-64 segments)
   */
  private generateFrontVeil(): void {
    this.frontVeil = {
      segments: this.frontVeilSegments,
    };
  }

  /**
   * Generate rear veil plane (32-48 segments)
   */
  private generateRearVeil(): void {
    this.rearVeil = {
      segments: this.rearVeilSegments,
    };
  }

  /**
   * Generate mist particles (100-180)
   */
  private generateMistParticles(): void {
    this.mistParticles = [];
    
    for (let i = 0; i < this.numMistParticles; i++) {
      // Random positions around Guru
      const angle = (i / this.numMistParticles) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.4;
      const x = Math.cos(angle) * radius;
      const y = -0.5 + Math.random() * 1.0;
      const z = -2.0 + Math.random() * 0.3;
      
      this.mistParticles.push({
        particleIndex: i,
        position: new THREE.Vector3(x, y, z),
      });
    }
  }

  /**
   * Create geometry with front veil, rear veil, and mist particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const frontVeilIndices: number[] = [];
    const rearVeilIndices: number[] = [];
    const mistParticleIndices: number[] = [];
    
    // ============================================
    // FRONT VEIL (Layer A)
    // ============================================
    const frontVeilSize = 1.2;
    const frontSegments = this.frontVeilSegments;
    
    for (let i = 0; i < frontSegments; i++) {
      for (let j = 0; j < frontSegments; j++) {
        const u = i / frontSegments;
        const v = j / frontSegments;
        
        const x = (u - 0.5) * frontVeilSize;
        const y = (v - 0.5) * frontVeilSize;
        const z = -1.8; // In front of Guru
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        frontVeilIndices.push(0); // Single front veil
        rearVeilIndices.push(-1);
        mistParticleIndices.push(-1);
      }
    }
    
    // ============================================
    // REAR VEIL (Layer C)
    // ============================================
    const rearVeilSize = 1.0;
    const rearSegments = this.rearVeilSegments;
    
    for (let i = 0; i < rearSegments; i++) {
      for (let j = 0; j < rearSegments; j++) {
        const u = i / rearSegments;
        const v = j / rearSegments;
        
        const x = (u - 0.5) * rearVeilSize;
        const y = (v - 0.5) * rearVeilSize;
        const z = -2.2; // Behind Guru
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        frontVeilIndices.push(-1);
        rearVeilIndices.push(0); // Single rear veil
        mistParticleIndices.push(-1);
      }
    }
    
    // ============================================
    // MIST PARTICLES (Layer B)
    // ============================================
    const particleSize = 0.04;
    
    for (let i = 0; i < this.numMistParticles; i++) {
      const particle = this.mistParticles[i];
      
      // Create quad for each particle
      const x = particle.position.x;
      const y = particle.position.y;
      const z = particle.position.z;
      
      positions.push(
        x - particleSize, y - particleSize, z, // Bottom-left
        x + particleSize, y - particleSize, z, // Bottom-right
        x - particleSize, y + particleSize, z, // Top-left
        x + particleSize, y + particleSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      frontVeilIndices.push(-1, -1, -1, -1);
      rearVeilIndices.push(-1, -1, -1, -1);
      mistParticleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('frontVeilIndex', new THREE.Float32BufferAttribute(frontVeilIndices, 1));
    geometry.setAttribute('rearVeilIndex', new THREE.Float32BufferAttribute(rearVeilIndices, 1));
    geometry.setAttribute('mistParticleIndex', new THREE.Float32BufferAttribute(mistParticleIndices, 1));
    
    // Create indices for front veil
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Front veil (quads)
    for (let i = 0; i < frontSegments - 1; i++) {
      for (let j = 0; j < frontSegments - 1; j++) {
        const a = vertexIndex + i * frontSegments + j;
        const b = a + 1;
        const c = a + frontSegments;
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += frontSegments * frontSegments;
    
    // Rear veil (quads)
    for (let i = 0; i < rearSegments - 1; i++) {
      for (let j = 0; j < rearSegments - 1; j++) {
        const a = vertexIndex + i * rearSegments + j;
        const b = a + 1;
        const c = a + rearSegments;
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += rearSegments * rearSegments;
    
    // Mist particles (quads)
    for (let i = 0; i < this.numMistParticles; i++) {
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
   * Update with astral veil state
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

