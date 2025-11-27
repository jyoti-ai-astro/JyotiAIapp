/**
 * Celestial Wave Engine
 * 
 * Phase 2 — Section 42: CELESTIAL WAVE ENGINE
 * Celestial Wave Engine (E46)
 * 
 * Generate wave plane, cross-wave overlay, mist particles, manage uniforms
 */

import * as THREE from 'three';
import { waveVertexShader } from './shaders/wave-vertex';
import { waveFragmentShader } from './shaders/wave-fragment';

export interface CelestialWaveEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numMistParticles?: number;
}

export interface WavePlaneData {
  width: number;
  height: number;
  segments: number;
}

export interface CrossWaveData {
  width: number;
  height: number;
  segments: number;
}

export interface MistParticleData {
  mistIndex: number;
  xPosition: number;
  radius: number;
}

export class CelestialWaveEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialWaveEngineConfig;
  
  private wavePlane: WavePlaneData;
  private crossWave: CrossWaveData;
  private mistParticles: MistParticleData[] = [];
  
  private numMistParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialWaveEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numMistParticles: config.numMistParticles || 110,
    };
    
    this.numMistParticles = this.config.numMistParticles || 110;
    
    // Generate wave plane
    this.generateWavePlane();
    
    // Generate cross wave
    this.generateCrossWave();
    
    // Generate mist particles
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
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate wave plane
   */
  private generateWavePlane(): void {
    this.wavePlane = {
      width: 20.0,
      height: 12.0,
      segments: 32, // 32×32 grid resolution
    };
  }

  /**
   * Generate cross wave
   */
  private generateCrossWave(): void {
    this.crossWave = {
      width: 20.0,
      height: 12.0,
      segments: 32,
    };
  }

  /**
   * Generate mist particles (80-140)
   */
  private generateMistParticles(): void {
    this.mistParticles = [];
    
    for (let i = 0; i < this.numMistParticles; i++) {
      const xPosition = (i / this.numMistParticles) * 20.0 - 10.0; // -10 to 10 range
      const radius = 0.02;
      
      this.mistParticles.push({
        mistIndex: i,
        xPosition,
        radius,
      });
    }
  }

  /**
   * Create geometry with wave plane, cross-wave, and mist particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const waveIndices: number[] = [];
    const crossWaveIndices: number[] = [];
    const mistIndices: number[] = [];
    
    // ============================================
    // WAVE PLANE (Layer A)
    // ============================================
    const planeWidth = 20.0;
    const planeHeight = 12.0;
    const planeSegments = 32;
    
    for (let i = 0; i <= planeSegments; i++) {
      for (let j = 0; j <= planeSegments; j++) {
        const u = i / planeSegments;
        const v = j / planeSegments;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        waveIndices.push(0); // Single wave plane
        crossWaveIndices.push(-1);
        mistIndices.push(-1);
      }
    }
    
    // ============================================
    // CROSS-WAVE (Layer B)
    // ============================================
    for (let i = 0; i <= planeSegments; i++) {
      for (let j = 0; j <= planeSegments; j++) {
        const u = i / planeSegments;
        const v = j / planeSegments;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        waveIndices.push(-1);
        crossWaveIndices.push(0); // Single cross-wave plane
        mistIndices.push(-1);
      }
    }
    
    // ============================================
    // MIST PARTICLES (Layer C)
    // ============================================
    const mistRadius = 0.02;
    
    for (let i = 0; i < this.numMistParticles; i++) {
      const mist = this.mistParticles[i];
      const x = mist.xPosition;
      const y = 0.0; // Will be positioned above wave in shader
      const z = 0.0; // Will be animated in shader
      
      // Create quad for each mist particle
      positions.push(
        x - mistRadius, y - mistRadius, z, // Bottom-left
        x + mistRadius, y - mistRadius, z, // Bottom-right
        x - mistRadius, y + mistRadius, z, // Top-left
        x + mistRadius, y + mistRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      waveIndices.push(-1, -1, -1, -1);
      crossWaveIndices.push(-1, -1, -1, -1);
      mistIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('waveIndex', new THREE.Float32BufferAttribute(waveIndices, 1));
    geometry.setAttribute('crossWaveIndex', new THREE.Float32BufferAttribute(crossWaveIndices, 1));
    geometry.setAttribute('mistIndex', new THREE.Float32BufferAttribute(mistIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Wave plane (quads)
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
    
    // Cross-wave plane (quads)
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
   * Update with celestial wave state
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

