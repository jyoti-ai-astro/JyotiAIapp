/**
 * Astral Lotus Engine
 * 
 * Phase 2 — Section 33: ASTRAL LOTUS ENGINE
 * Astral Lotus Engine (E37)
 * 
 * Generate outer petals, inner petals, core jewel, manage uniforms
 */

import * as THREE from 'three';
import { lotusVertexShader } from './shaders/lotus-vertex';
import { lotusFragmentShader } from './shaders/lotus-fragment';

export interface AstralLotusEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numOuterPetals?: number;
  numInnerPetals?: number;
}

export interface OuterPetalData {
  petalIndex: number;
  angle: number;
  length: number;
  width: number;
}

export interface InnerPetalData {
  petalIndex: number;
  angle: number;
  length: number;
  width: number;
}

export interface CoreData {
  radius: number;
}

export class AstralLotusEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AstralLotusEngineConfig;
  
  private outerPetals: OuterPetalData[] = [];
  private innerPetals: InnerPetalData[] = [];
  private core: CoreData;
  
  private numOuterPetals: number;
  private numInnerPetals: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AstralLotusEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numOuterPetals: config.numOuterPetals || 18,
      numInnerPetals: config.numInnerPetals || 9,
    };
    
    this.numOuterPetals = this.config.numOuterPetals || 18;
    this.numInnerPetals = this.config.numInnerPetals || 9;
    
    // Generate outer petals
    this.generateOuterPetals();
    
    // Generate inner petals
    this.generateInnerPetals();
    
    // Generate core jewel
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
      vertexShader: lotusVertexShader,
      fragmentShader: lotusFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate outer petals (12-24)
   */
  private generateOuterPetals(): void {
    this.outerPetals = [];
    
    for (let i = 0; i < this.numOuterPetals; i++) {
      const angle = (i / this.numOuterPetals) * Math.PI * 2;
      const length = 0.4; // 0.35-0.45 range, using 0.4
      const width = 0.18;
      
      this.outerPetals.push({
        petalIndex: i,
        angle,
        length,
        width,
      });
    }
  }

  /**
   * Generate inner petals (6-12)
   */
  private generateInnerPetals(): void {
    this.innerPetals = [];
    
    for (let i = 0; i < this.numInnerPetals; i++) {
      const angle = (i / this.numInnerPetals) * Math.PI * 2;
      const length = 0.25;
      const width = 0.12;
      
      this.innerPetals.push({
        petalIndex: i,
        angle,
        length,
        width,
      });
    }
  }

  /**
   * Generate core jewel
   */
  private generateCore(): void {
    this.core = {
      radius: 0.08,
    };
  }

  /**
   * Create geometry with outer petals, inner petals, and core
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const outerPetalIndices: number[] = [];
    const innerPetalIndices: number[] = [];
    const coreIndices: number[] = [];
    
    // ============================================
    // OUTER PETALS (Layer A)
    // ============================================
    const petalLength = 0.4;
    const petalWidth = 0.18;
    
    for (let i = 0; i < this.numOuterPetals; i++) {
      const petal = this.outerPetals[i];
      
      // Position petal
      const x = Math.cos(petal.angle) * petal.length;
      const y = Math.sin(petal.angle) * petal.length;
      const z = -3.3;
      
      // Create quad for each petal
      positions.push(
        x - petalWidth, y - petalLength, z, // Bottom-left
        x + petalWidth, y - petalLength, z, // Bottom-right
        x - petalWidth, y + petalLength, z, // Top-left
        x + petalWidth, y + petalLength, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      outerPetalIndices.push(i, i, i, i);
      innerPetalIndices.push(-1, -1, -1, -1);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // INNER PETALS (Layer B)
    // ============================================
    const innerPetalLength = 0.25;
    const innerPetalWidth = 0.12;
    
    for (let i = 0; i < this.numInnerPetals; i++) {
      const petal = this.innerPetals[i];
      
      // Position petal
      const x = Math.cos(petal.angle) * petal.length;
      const y = Math.sin(petal.angle) * petal.length;
      const z = -3.3;
      
      // Create quad for each petal
      positions.push(
        x - innerPetalWidth, y - innerPetalLength, z, // Bottom-left
        x + innerPetalWidth, y - innerPetalLength, z, // Bottom-right
        x - innerPetalWidth, y + innerPetalLength, z, // Top-left
        x + innerPetalWidth, y + innerPetalLength, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      outerPetalIndices.push(-1, -1, -1, -1);
      innerPetalIndices.push(i, i, i, i);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // CORE JEWEL (Layer C)
    // ============================================
    const coreRadius = 0.08;
    const coreSegments = 32;
    
    for (let i = 0; i < coreSegments; i++) {
      const t = i / coreSegments;
      const angle = t * Math.PI * 2;
      const radius = coreRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -3.3;
      
      // Create quad for core segment
      const segmentSize = 0.01;
      positions.push(
        x - segmentSize, y - segmentSize, z, // Bottom-left
        x + segmentSize, y - segmentSize, z, // Bottom-right
        x - segmentSize, y + segmentSize, z, // Top-left
        x + segmentSize, y + segmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      outerPetalIndices.push(-1, -1, -1, -1);
      innerPetalIndices.push(-1, -1, -1, -1);
      coreIndices.push(0, 0, 0, 0); // Single core
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('outerPetalIndex', new THREE.Float32BufferAttribute(outerPetalIndices, 1));
    geometry.setAttribute('innerPetalIndex', new THREE.Float32BufferAttribute(innerPetalIndices, 1));
    geometry.setAttribute('coreIndex', new THREE.Float32BufferAttribute(coreIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Outer petals (quads)
    for (let i = 0; i < this.numOuterPetals; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Inner petals (quads)
    for (let i = 0; i < this.numInnerPetals; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Core (quads)
    for (let i = 0; i < coreSegments; i++) {
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
   * Update with astral lotus state
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

