/**
 * Cosmic Fracture Engine
 * 
 * Phase 2 — Section 50: COSMIC FRACTURE ENGINE
 * Cosmic Fracture Engine (E54)
 * 
 * Generate fracture plane, prism shards, crystal particles, manage uniforms
 */

import * as THREE from 'three';
import { cosmicFractureVertexShader } from './shaders/cosmic-fracture-vertex';
import { cosmicFractureFragmentShader } from './shaders/cosmic-fracture-fragment';

export interface CosmicFractureEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numCrystals?: number;
}

export interface FracturePlaneData {
  width: number;
  height: number;
  segments: number;
}

export interface ShardData {
  shardIndex: number;
  baseRadius: number; // 1.5 to 6.0
  thickness: number;
}

export interface CrystalData {
  crystalIndex: number;
  speed: number;
  baseRadius: number;
}

export class CosmicFractureEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CosmicFractureEngineConfig;
  
  private fracturePlane: FracturePlaneData;
  private shards: ShardData[] = [];
  private crystals: CrystalData[] = [];
  
  private numCrystals: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CosmicFractureEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numCrystals: config.numCrystals || 260,
    };
    
    this.numCrystals = this.config.numCrystals || 260;
    
    // Generate fracture plane
    this.generateFracturePlane();
    
    // Generate shards
    this.generateShards();
    
    // Generate crystals
    this.generateCrystals();
    
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
      vertexShader: cosmicFractureVertexShader,
      fragmentShader: cosmicFractureFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate fracture plane
   */
  private generateFracturePlane(): void {
    this.fracturePlane = {
      width: 22.0,
      height: 14.0,
      segments: 48, // 48×48 grid
    };
  }

  /**
   * Generate shards (8-14 shards)
   */
  private generateShards(): void {
    this.shards = [];
    
    for (let i = 0; i < 14; i++) {
      const baseRadius = 1.5 + (i / 13.0) * 4.5; // 1.5 to 6.0
      this.shards.push({
        shardIndex: i,
        baseRadius,
        thickness: 0.2,
      });
    }
  }

  /**
   * Generate crystals (200-320)
   */
  private generateCrystals(): void {
    this.crystals = [];
    
    for (let i = 0; i < this.numCrystals; i++) {
      const speed = 0.1 + (i / this.numCrystals) * 0.08; // Varying speeds
      const baseRadius = 1.2 + (i / this.numCrystals) * 4.8; // 1.2 to 6.0
      
      this.crystals.push({
        crystalIndex: i,
        speed,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with fracture plane, shards, and crystals
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const fractureIndices: number[] = [];
    const shardIndices: number[] = [];
    const crystalIndices: number[] = [];
    
    // ============================================
    // FRACTURE PLANE (Layer A)
    // ============================================
    const planeWidth = 22.0;
    const planeHeight = 14.0;
    const planeSegments = 48;
    
    for (let i = 0; i <= planeSegments; i++) {
      for (let j = 0; j <= planeSegments; j++) {
        const u = i / planeSegments;
        const v = j / planeSegments;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        fractureIndices.push(0); // Single fracture plane
        shardIndices.push(-1);
        crystalIndices.push(-1);
      }
    }
    
    // ============================================
    // SHARDS (Layer B - 14 shards)
    // ============================================
    const shardSegments = 32; // Segments per shard
    const thickness = 0.2;
    
    for (let shard = 0; shard < 14; shard++) {
      const shardData = this.shards[shard];
      
      for (let i = 0; i <= shardSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / shardSegments; // Angle: 0 to 1 (0 to 2π)
          const v = j / 4.0; // Thickness: 0 to 1
          
          const angle = u * Math.PI * 2.0; // 0 to 2π
          const radius = shardData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          fractureIndices.push(-1);
          shardIndices.push(shard);
          crystalIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // CRYSTALS (Layer C)
    // ============================================
    const crystalRadius = 0.0125;
    
    for (let i = 0; i < this.numCrystals; i++) {
      const crystal = this.crystals[i];
      const x = 0.0; // Will be positioned in shader
      const y = 0.0;
      const z = 0.0;
      
      // Create quad for each crystal
      positions.push(
        x - crystalRadius, y - crystalRadius, z, // Bottom-left
        x + crystalRadius, y - crystalRadius, z, // Bottom-right
        x - crystalRadius, y + crystalRadius, z, // Top-left
        x + crystalRadius, y + crystalRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      fractureIndices.push(-1, -1, -1, -1);
      shardIndices.push(-1, -1, -1, -1);
      crystalIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('fractureIndex', new THREE.Float32BufferAttribute(fractureIndices, 1));
    geometry.setAttribute('shardIndex', new THREE.Float32BufferAttribute(shardIndices, 1));
    geometry.setAttribute('crystalIndex', new THREE.Float32BufferAttribute(crystalIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Fracture plane (quads)
    for (let i = 0; i < planeSegments; i++) {
      for (let j = 0; j < planeSegments; j++) {
        const a = vertexIndex + i * (planeSegments + 1) + j;
        const b = a + 1;
        const c = a + (planeSegments + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (planeSegments + 1) * (planeSegments + 1);
    
    // Shards (quads) - 14 shards
    for (let shard = 0; shard < 14; shard++) {
      for (let i = 0; i < shardSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (shardSegments + 1) * 5;
    }
    
    // Crystals (quads)
    for (let i = 0; i < this.numCrystals; i++) {
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
   * Update with cosmic fracture state
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

