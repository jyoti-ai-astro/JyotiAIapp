/**
 * Celestial Gate Engine
 * 
 * Phase 2 — Section 32: CELESTIAL GATE ENGINE
 * Celestial Gate Engine (E36)
 * 
 * Generate halo ring, rotating sigils, core portal disc, manage uniforms
 */

import * as THREE from 'three';
import { gateVertexShader } from './shaders/gate-vertex';
import { gateFragmentShader } from './shaders/gate-fragment';

export interface CelestialGateEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  haloSegments?: number;
  numSigils?: number;
  coreSegments?: number;
}

export interface HaloData {
  radius: number;
  segments: number;
}

export interface SigilData {
  sigilIndex: number;
  angle: number;
  radius: number;
}

export interface CoreData {
  radius: number;
  segments: number;
}

export class CelestialGateEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialGateEngineConfig;
  
  private halo: HaloData;
  private sigils: SigilData[] = [];
  private core: CoreData;
  
  private haloSegments: number;
  private numSigils: number;
  private coreSegments: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialGateEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      haloSegments: config.haloSegments || 80,
      numSigils: config.numSigils || 16,
      coreSegments: config.coreSegments || 48,
    };
    
    this.haloSegments = this.config.haloSegments || 80;
    this.numSigils = this.config.numSigils || 16;
    this.coreSegments = this.config.coreSegments || 48;
    
    // Generate halo ring
    this.generateHalo();
    
    // Generate rotating sigils
    this.generateSigils();
    
    // Generate core portal disc
    this.generateCore();
    
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
      vertexShader: gateVertexShader,
      fragmentShader: gateFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate halo ring
   */
  private generateHalo(): void {
    this.halo = {
      radius: 0.8,
      segments: this.haloSegments,
    };
  }

  /**
   * Generate rotating sigils
   */
  private generateSigils(): void {
    this.sigils = [];
    
    for (let i = 0; i < this.numSigils; i++) {
      const angle = (i / this.numSigils) * Math.PI * 2;
      const radius = 0.5;
      this.sigils.push({
        sigilIndex: i,
        angle,
        radius,
      });
    }
  }

  /**
   * Generate core portal disc
   */
  private generateCore(): void {
    this.core = {
      radius: 0.35,
      segments: this.coreSegments,
    };
  }

  /**
   * Create geometry with halo, sigils, and core
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const haloIndices: number[] = [];
    const sigilIndices: number[] = [];
    const coreIndices: number[] = [];
    
    // ============================================
    // HALO (Layer A)
    // ============================================
    const haloRadius = 0.8;
    const haloThickness = 0.03;
    
    for (let i = 0; i < this.haloSegments; i++) {
      const t = i / this.haloSegments;
      const angle = t * Math.PI * 2;
      const radius = haloRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -3.0;
      
      // Create quad for halo segment
      const segmentSize = haloThickness;
      positions.push(
        x - segmentSize, y - segmentSize, z, // Bottom-left
        x + segmentSize, y - segmentSize, z, // Bottom-right
        x - segmentSize, y + segmentSize, z, // Top-left
        x + segmentSize, y + segmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      haloIndices.push(0, 0, 0, 0); // Single halo
      sigilIndices.push(-1, -1, -1, -1);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // SIGILS (Layer B)
    // ============================================
    const sigilSize = 0.06;
    
    for (let i = 0; i < this.numSigils; i++) {
      const sigil = this.sigils[i];
      
      // Position sigil
      const x = Math.cos(sigil.angle) * sigil.radius;
      const y = Math.sin(sigil.angle) * sigil.radius;
      const z = -3.0;
      
      // Create quad for each sigil
      positions.push(
        x - sigilSize, y - sigilSize, z, // Bottom-left
        x + sigilSize, y - sigilSize, z, // Bottom-right
        x - sigilSize, y + sigilSize, z, // Top-left
        x + sigilSize, y + sigilSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      haloIndices.push(-1, -1, -1, -1);
      sigilIndices.push(i, i, i, i);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // CORE (Layer C)
    // ============================================
    const coreRadius = 0.35;
    
    for (let i = 0; i < this.coreSegments; i++) {
      for (let j = 0; j < this.coreSegments; j++) {
        const u = i / this.coreSegments;
        const v = j / this.coreSegments;
        
        const angle = u * Math.PI * 2;
        const radius = v * coreRadius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -3.0;
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        haloIndices.push(-1);
        sigilIndices.push(-1);
        coreIndices.push(0); // Single core
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('haloIndex', new THREE.Float32BufferAttribute(haloIndices, 1));
    geometry.setAttribute('sigilIndex', new THREE.Float32BufferAttribute(sigilIndices, 1));
    geometry.setAttribute('coreIndex', new THREE.Float32BufferAttribute(coreIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Halo (quads)
    for (let i = 0; i < this.haloSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Sigils (quads)
    for (let i = 0; i < this.numSigils; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Core (quads)
    for (let i = 0; i < this.coreSegments - 1; i++) {
      for (let j = 0; j < this.coreSegments - 1; j++) {
        const a = vertexIndex + i * this.coreSegments + j;
        const b = a + 1;
        const c = a + this.coreSegments;
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
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
   * Update with celestial gate state
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

