/**
 * Aurora Veil Engine
 * 
 * Phase 2 — Section 44: AURORA VEIL ENGINE
 * Aurora Veil Engine (E48)
 * 
 * Generate primary aurora curtains, reverse aurora veils, aurora dust particles, manage uniforms
 */

import * as THREE from 'three';
import { auroraVertexShader } from './shaders/aurora-vertex';
import { auroraFragmentShader } from './shaders/aurora-fragment';

export interface AuroraVeilEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numDustParticles?: number;
}

export interface PrimaryAuroraData {
  width: number;
  height: number;
  segments: number;
  curtainIndex: number; // 0 or 1 for two curtains
}

export interface ReverseAuroraData {
  width: number;
  height: number;
  segments: number;
  veilIndex: number; // 0 or 1 for two veils
}

export interface DustParticleData {
  dustIndex: number;
  baseX: number;
  speed: number;
}

export class AuroraVeilEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AuroraVeilEngineConfig;
  
  private primaryAuroras: PrimaryAuroraData[] = [];
  private reverseAuroras: ReverseAuroraData[] = [];
  private dustParticles: DustParticleData[] = [];
  
  private numDustParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AuroraVeilEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numDustParticles: config.numDustParticles || 160,
    };
    
    this.numDustParticles = this.config.numDustParticles || 160;
    
    // Generate primary auroras
    this.generatePrimaryAuroras();
    
    // Generate reverse auroras
    this.generateReverseAuroras();
    
    // Generate dust particles
    this.generateDustParticles();
    
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
      vertexShader: auroraVertexShader,
      fragmentShader: auroraFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate primary auroras (2 curtains)
   */
  private generatePrimaryAuroras(): void {
    this.primaryAuroras = [];
    
    for (let i = 0; i < 2; i++) {
      this.primaryAuroras.push({
        width: 14.0,
        height: 12.0,
        segments: 48, // 48×48 grid
        curtainIndex: i,
      });
    }
  }

  /**
   * Generate reverse auroras (2 veils)
   */
  private generateReverseAuroras(): void {
    this.reverseAuroras = [];
    
    for (let i = 0; i < 2; i++) {
      this.reverseAuroras.push({
        width: 14.0,
        height: 12.0,
        segments: 48,
        veilIndex: i,
      });
    }
  }

  /**
   * Generate dust particles (120-200)
   */
  private generateDustParticles(): void {
    this.dustParticles = [];
    
    for (let i = 0; i < this.numDustParticles; i++) {
      const baseX = (i / this.numDustParticles) * 14.0 - 7.0; // -7 to 7 range
      const speed = 0.2 + (i / this.numDustParticles) * 0.1; // Varying speeds
      
      this.dustParticles.push({
        dustIndex: i,
        baseX,
        speed,
      });
    }
  }

  /**
   * Create geometry with primary auroras, reverse auroras, and dust particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const primaryIndices: number[] = [];
    const reverseIndices: number[] = [];
    const dustIndices: number[] = [];
    
    // ============================================
    // PRIMARY AURORAS (Layer A - 2 curtains)
    // ============================================
    const curtainWidth = 14.0;
    const curtainHeight = 12.0;
    const curtainSegments = 48;
    
    for (let curtain = 0; curtain < 2; curtain++) {
      const curtainOffset = curtain * 7.0; // Offset second curtain
      
      for (let i = 0; i <= curtainSegments; i++) {
        for (let j = 0; j <= curtainSegments; j++) {
          const u = i / curtainSegments;
          const v = j / curtainSegments;
          
          const x = (u - 0.5) * curtainWidth + curtainOffset;
          const z = (v - 0.5) * curtainHeight;
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          primaryIndices.push(curtain); // 0 or 1
          reverseIndices.push(-1);
          dustIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // REVERSE AURORAS (Layer B - 2 veils)
    // ============================================
    for (let veil = 0; veil < 2; veil++) {
      const veilOffset = veil * 7.0; // Offset second veil
      
      for (let i = 0; i <= curtainSegments; i++) {
        for (let j = 0; j <= curtainSegments; j++) {
          const u = i / curtainSegments;
          const v = j / curtainSegments;
          
          const x = (u - 0.5) * curtainWidth + veilOffset;
          const z = (v - 0.5) * curtainHeight;
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          primaryIndices.push(-1);
          reverseIndices.push(veil); // 0 or 1
          dustIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // DUST PARTICLES (Layer C)
    // ============================================
    const dustRadius = 0.0125;
    
    for (let i = 0; i < this.numDustParticles; i++) {
      const dust = this.dustParticles[i];
      const x = dust.baseX;
      const y = 0.0; // Will be positioned in shader
      const z = 0.0; // Will be animated in shader
      
      // Create quad for each dust particle
      positions.push(
        x - dustRadius, y - dustRadius, z, // Bottom-left
        x + dustRadius, y - dustRadius, z, // Bottom-right
        x - dustRadius, y + dustRadius, z, // Top-left
        x + dustRadius, y + dustRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      primaryIndices.push(-1, -1, -1, -1);
      reverseIndices.push(-1, -1, -1, -1);
      dustIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('primaryIndex', new THREE.Float32BufferAttribute(primaryIndices, 1));
    geometry.setAttribute('reverseIndex', new THREE.Float32BufferAttribute(reverseIndices, 1));
    geometry.setAttribute('dustIndex', new THREE.Float32BufferAttribute(dustIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Primary auroras (quads) - 2 curtains
    for (let curtain = 0; curtain < 2; curtain++) {
      for (let i = 0; i < curtainSegments; i++) {
        for (let j = 0; j < curtainSegments; j++) {
          const a = vertexIndex + i * (curtainSegments + 1) + j;
          const b = a + 1;
          const c = a + (curtainSegments + 1);
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (curtainSegments + 1) * (curtainSegments + 1);
    }
    
    // Reverse auroras (quads) - 2 veils
    for (let veil = 0; veil < 2; veil++) {
      for (let i = 0; i < curtainSegments; i++) {
        for (let j = 0; j < curtainSegments; j++) {
          const a = vertexIndex + i * (curtainSegments + 1) + j;
          const b = a + 1;
          const c = a + (curtainSegments + 1);
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (curtainSegments + 1) * (curtainSegments + 1);
    }
    
    // Dust particles (quads)
    for (let i = 0; i < this.numDustParticles; i++) {
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
   * Update with aurora veil state
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

