/**
 * Fate Ripple Engine
 * 
 * Phase 2 — Section 30: FATE RIPPLE ENGINE
 * Fate Ripple Engine (E34)
 * 
 * Generate ripple rings, shockwave pulses, fragments, manage uniforms
 */

import * as THREE from 'three';
import { rippleVertexShader } from './shaders/ripple-vertex';
import { rippleFragmentShader } from './shaders/ripple-fragment';

export interface FateRippleEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numRippleRings?: number;
  numShockwaves?: number;
  numFragments?: number;
}

export interface RippleRingData {
  ringIndex: number;
  baseRadius: number;
}

export interface ShockwaveData {
  shockwaveIndex: number;
  startTime: number;
}

export interface FragmentData {
  fragmentIndex: number;
  position: THREE.Vector3;
}

export class FateRippleEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: FateRippleEngineConfig;
  
  private rippleRings: RippleRingData[] = [];
  private shockwaves: ShockwaveData[] = [];
  private fragments: FragmentData[] = [];
  
  private numRippleRings: number;
  private numShockwaves: number;
  private numFragments: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: FateRippleEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numRippleRings: config.numRippleRings || 7,
      numShockwaves: config.numShockwaves || 2,
      numFragments: config.numFragments || 30,
    };
    
    this.numRippleRings = this.config.numRippleRings || 7;
    this.numShockwaves = this.config.numShockwaves || 2;
    this.numFragments = this.config.numFragments || 30;
    
    // Generate ripple rings (5-9)
    this.generateRippleRings();
    
    // Generate shockwave pulses (2-3 active)
    this.generateShockwaves();
    
    // Generate fragments (20-40)
    this.generateFragments();
    
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
      vertexShader: rippleVertexShader,
      fragmentShader: rippleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate ripple rings (5-9)
   */
  private generateRippleRings(): void {
    this.rippleRings = [];
    
    for (let i = 0; i < this.numRippleRings; i++) {
      const baseRadius = 0.2 + i * 0.15; // Expanding rings
      this.rippleRings.push({
        ringIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate shockwave pulses (2-3 active)
   */
  private generateShockwaves(): void {
    this.shockwaves = [];
    
    for (let i = 0; i < this.numShockwaves; i++) {
      this.shockwaves.push({
        shockwaveIndex: i,
        startTime: i * 2.0, // Staggered start times
      });
    }
  }

  /**
   * Generate fragments (20-40)
   */
  private generateFragments(): void {
    this.fragments = [];
    
    for (let i = 0; i < this.numFragments; i++) {
      // Random positions around center
      const angle = (i / this.numFragments) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -2.5 + Math.random() * 0.2;
      
      this.fragments.push({
        fragmentIndex: i,
        position: new THREE.Vector3(x, y, z),
      });
    }
  }

  /**
   * Create geometry with ripple rings, shockwaves, and fragments
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const rippleRingIndices: number[] = [];
    const shockwaveIndices: number[] = [];
    const fragmentIndices: number[] = [];
    
    // ============================================
    // RIPPLE RINGS (Layer A)
    // ============================================
    const ringSegments = 64; // 64 segments per ring
    
    for (let ringIdx = 0; ringIdx < this.numRippleRings; ringIdx++) {
      const ring = this.rippleRings[ringIdx];
      
      for (let i = 0; i < ringSegments; i++) {
        const t = i / ringSegments;
        const angle = t * Math.PI * 2;
        const radius = ring.baseRadius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -2.5;
        
        // Create quad for ring segment
        const segmentSize = 0.02;
        positions.push(
          x - segmentSize, y - segmentSize, z, // Bottom-left
          x + segmentSize, y - segmentSize, z, // Bottom-right
          x - segmentSize, y + segmentSize, z, // Top-left
          x + segmentSize, y + segmentSize, z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        rippleRingIndices.push(ringIdx, ringIdx, ringIdx, ringIdx);
        shockwaveIndices.push(-1, -1, -1, -1);
        fragmentIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // SHOCKWAVES (Layer B)
    // ============================================
    const shockwaveSegments = 64;
    
    for (let shockIdx = 0; shockIdx < this.numShockwaves; shockIdx++) {
      for (let i = 0; i < shockwaveSegments; i++) {
        const t = i / shockwaveSegments;
        const angle = t * Math.PI * 2;
        const radius = 0.1; // Base radius, expands in shader
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -2.5;
        
        // Create quad for shockwave segment
        const segmentSize = 0.03;
        positions.push(
          x - segmentSize, y - segmentSize, z, // Bottom-left
          x + segmentSize, y - segmentSize, z, // Bottom-right
          x - segmentSize, y + segmentSize, z, // Top-left
          x + segmentSize, y + segmentSize, z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        rippleRingIndices.push(-1, -1, -1, -1);
        shockwaveIndices.push(shockIdx, shockIdx, shockIdx, shockIdx);
        fragmentIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // FRAGMENTS (Layer C)
    // ============================================
    const fragmentSize = 0.05;
    
    for (let i = 0; i < this.numFragments; i++) {
      const fragment = this.fragments[i];
      
      // Create quad for each fragment
      const x = fragment.position.x;
      const y = fragment.position.y;
      const z = fragment.position.z;
      
      positions.push(
        x - fragmentSize, y - fragmentSize, z, // Bottom-left
        x + fragmentSize, y - fragmentSize, z, // Bottom-right
        x - fragmentSize, y + fragmentSize, z, // Top-left
        x + fragmentSize, y + fragmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      rippleRingIndices.push(-1, -1, -1, -1);
      shockwaveIndices.push(-1, -1, -1, -1);
      fragmentIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('rippleRingIndex', new THREE.Float32BufferAttribute(rippleRingIndices, 1));
    geometry.setAttribute('shockwaveIndex', new THREE.Float32BufferAttribute(shockwaveIndices, 1));
    geometry.setAttribute('fragmentIndex', new THREE.Float32BufferAttribute(fragmentIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Ripple rings
    for (let ringIdx = 0; ringIdx < this.numRippleRings; ringIdx++) {
      for (let i = 0; i < ringSegments; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Shockwaves
    for (let shockIdx = 0; shockIdx < this.numShockwaves; shockIdx++) {
      for (let i = 0; i < shockwaveSegments; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Fragments
    for (let i = 0; i < this.numFragments; i++) {
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
   * Update with fate ripple state
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

