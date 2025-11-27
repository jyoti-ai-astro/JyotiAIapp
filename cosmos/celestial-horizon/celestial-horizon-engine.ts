/**
 * Celestial Horizon Engine
 * 
 * Phase 2 — Section 41: CELESTIAL HORIZON ENGINE
 * Celestial Horizon Engine (E45)
 * 
 * Generate gradient plane, horizon band, star fog particles, manage uniforms
 */

import * as THREE from 'three';
import { horizonVertexShader } from './shaders/horizon-vertex';
import { horizonFragmentShader } from './shaders/horizon-fragment';

export interface CelestialHorizonEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
}

export interface PlaneData {
  width: number;
  height: number;
}

export interface BandData {
  width: number;
  thickness: number;
}

export interface ParticleData {
  particleIndex: number;
  xPosition: number;
  radius: number;
}

export class CelestialHorizonEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialHorizonEngineConfig;
  
  private plane: PlaneData;
  private band: BandData;
  private particles: ParticleData[] = [];
  
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialHorizonEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 160,
    };
    
    this.numParticles = this.config.numParticles || 160;
    
    // Generate plane
    this.generatePlane();
    
    // Generate band
    this.generateBand();
    
    // Generate particles
    this.generateParticles();
    
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
      vertexShader: horizonVertexShader,
      fragmentShader: horizonFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate plane
   */
  private generatePlane(): void {
    this.plane = {
      width: 18.0,
      height: 10.0,
    };
  }

  /**
   * Generate band
   */
  private generateBand(): void {
    this.band = {
      width: 18.0,
      thickness: 0.15,
    };
  }

  /**
   * Generate particles (120-200)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const xPosition = (i / this.numParticles) * 18.0 - 9.0; // -9 to 9 range
      const radius = 0.0125; // 0.01-0.015 range
      
      this.particles.push({
        particleIndex: i,
        xPosition,
        radius,
      });
    }
  }

  /**
   * Create geometry with plane, band, and particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const planeIndices: number[] = [];
    const bandIndices: number[] = [];
    const particleIndices: number[] = [];
    
    // ============================================
    // PLANE (Layer A)
    // ============================================
    const planeWidth = 18.0;
    const planeHeight = 10.0;
    const planeSegments = 32; // Grid resolution
    
    for (let i = 0; i <= planeSegments; i++) {
      for (let j = 0; j <= planeSegments; j++) {
        const u = i / planeSegments;
        const v = j / planeSegments;
        
        const x = (u - 0.5) * planeWidth;
        const y = (v - 0.5) * planeHeight;
        const z = -6.0;
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        planeIndices.push(0); // Single plane
        bandIndices.push(-1);
        particleIndices.push(-1);
      }
    }
    
    // ============================================
    // BAND (Layer B)
    // ============================================
    const bandWidth = 18.0;
    const bandThickness = 0.15;
    const bandSegments = 64;
    
    for (let i = 0; i < bandSegments; i++) {
      const t = i / bandSegments;
      const x = (t - 0.5) * bandWidth;
      const y = 0.0; // Center Y
      const z = -6.0;
      
      // Create quad for band segment
      positions.push(
        x - bandThickness, y - bandThickness, z, // Bottom-left
        x + bandThickness, y - bandThickness, z, // Bottom-right
        x - bandThickness, y + bandThickness, z, // Top-left
        x + bandThickness, y + bandThickness, z  // Top-right
      );
      
      // UVs
      uvs.push(t, 0, t, 0, t, 1, t, 1);
      
      // Indices
      planeIndices.push(-1, -1, -1, -1);
      bandIndices.push(0, 0, 0, 0); // Single band
      particleIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // PARTICLES (Layer C)
    // ============================================
    const particleRadius = 0.0125;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      const x = particle.xPosition;
      const y = 0.0; // Will be animated in shader
      const z = -6.0;
      
      // Create quad for each particle
      positions.push(
        x - particleRadius, y - particleRadius, z, // Bottom-left
        x + particleRadius, y - particleRadius, z, // Bottom-right
        x - particleRadius, y + particleRadius, z, // Top-left
        x + particleRadius, y + particleRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      planeIndices.push(-1, -1, -1, -1);
      bandIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('planeIndex', new THREE.Float32BufferAttribute(planeIndices, 1));
    geometry.setAttribute('bandIndex', new THREE.Float32BufferAttribute(bandIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Plane (quads)
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
    
    // Band (quads)
    for (let i = 0; i < bandSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Particles (quads)
    for (let i = 0; i < this.numParticles; i++) {
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
   * Update with celestial horizon state
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

