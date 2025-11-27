/**
 * Cosmic Orbit Engine
 * 
 * Phase 2 — Section 37: COSMIC ORBIT ENGINE
 * Cosmic Orbit Engine (E41)
 * 
 * Generate orbit rings, satellites, nexus core, manage uniforms
 */

import * as THREE from 'three';
import { orbitVertexShader } from './shaders/orbit-vertex';
import { orbitFragmentShader } from './shaders/orbit-fragment';

export interface CosmicOrbitEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numRings?: number;
  numSatellites?: number;
}

export interface OrbitRingData {
  ringIndex: number;
  radius: number;
  thickness: number;
  segments: number;
}

export interface SatelliteData {
  satelliteIndex: number;
  angle: number;
  radius: number;
  linkedRing: number;
  particleRadius: number;
}

export interface CoreData {
  radius: number;
  segments: number;
}

export class CosmicOrbitEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CosmicOrbitEngineConfig;
  
  private orbitRings: OrbitRingData[] = [];
  private satellites: SatelliteData[] = [];
  private core: CoreData;
  
  private numRings: number;
  private numSatellites: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CosmicOrbitEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numRings: config.numRings || 3,
      numSatellites: config.numSatellites || 9,
    };
    
    this.numRings = this.config.numRings || 3;
    this.numSatellites = this.config.numSatellites || 9;
    
    // Generate orbit rings
    this.generateOrbitRings();
    
    // Generate satellites
    this.generateSatellites();
    
    // Generate core
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
      vertexShader: orbitVertexShader,
      fragmentShader: orbitFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate orbit rings (2-4)
   */
  private generateOrbitRings(): void {
    // Orbit radii: [0.9, 1.2, 1.5, 1.8]
    const radii = [0.9, 1.2, 1.5, 1.8];
    
    for (let i = 0; i < this.numRings; i++) {
      this.orbitRings.push({
        ringIndex: i,
        radius: radii[i],
        thickness: 0.02,
        segments: 64,
      });
    }
  }

  /**
   * Generate satellites (6-12)
   */
  private generateSatellites(): void {
    this.satellites = [];
    
    for (let i = 0; i < this.numSatellites; i++) {
      const angle = (i / this.numSatellites) * Math.PI * 2;
      // Each satellite is linked to a random orbit ring
      const linkedRing = i % this.numRings;
      const baseRadius = this.orbitRings[linkedRing].radius;
      const orbitOffset = 0.1; // Offset from ring
      const radius = baseRadius + orbitOffset;
      
      this.satellites.push({
        satelliteIndex: i,
        angle,
        radius,
        linkedRing,
        particleRadius: 0.03,
      });
    }
  }

  /**
   * Generate core
   */
  private generateCore(): void {
    this.core = {
      radius: 0.25,
      segments: 32,
    };
  }

  /**
   * Create geometry with orbit rings, satellites, and core
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const orbitRingIndices: number[] = [];
    const satelliteIndices: number[] = [];
    const coreIndices: number[] = [];
    
    // ============================================
    // ORBIT RINGS (Layer A)
    // ============================================
    const ringThickness = 0.02;
    const ringSegments = 64;
    
    for (let i = 0; i < this.numRings; i++) {
      const ring = this.orbitRings[i];
      
      for (let j = 0; j < ringSegments; j++) {
        const t = j / ringSegments;
        const angle = t * Math.PI * 2;
        const radius = ring.radius;
        
        // Elliptical orbit (slightly elliptical)
        const ellipseRatio = 0.95;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * ellipseRatio;
        const z = -4.6;
        
        // Create quad for ring segment
        positions.push(
          x - ringThickness, y - ringThickness, z, // Bottom-left
          x + ringThickness, y - ringThickness, z, // Bottom-right
          x - ringThickness, y + ringThickness, z, // Top-left
          x + ringThickness, y + ringThickness, z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        orbitRingIndices.push(i, i, i, i);
        satelliteIndices.push(-1, -1, -1, -1);
        coreIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // SATELLITES (Layer B)
    // ============================================
    const particleSize = 0.03;
    
    for (let i = 0; i < this.numSatellites; i++) {
      const satellite = this.satellites[i];
      
      // Position satellite
      const x = Math.cos(satellite.angle) * satellite.radius;
      const y = Math.sin(satellite.angle) * satellite.radius;
      const z = -4.6;
      
      // Create quad for each satellite
      positions.push(
        x - particleSize, y - particleSize, z, // Bottom-left
        x + particleSize, y - particleSize, z, // Bottom-right
        x - particleSize, y + particleSize, z, // Top-left
        x + particleSize, y + particleSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      orbitRingIndices.push(-1, -1, -1, -1);
      satelliteIndices.push(i, i, i, i);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // CORE (Layer C)
    // ============================================
    const coreRadius = 0.25;
    
    for (let i = 0; i < this.core.segments; i++) {
      const t = i / this.core.segments;
      const angle = t * Math.PI * 2;
      const radius = coreRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -4.6;
      
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
      orbitRingIndices.push(-1, -1, -1, -1);
      satelliteIndices.push(-1, -1, -1, -1);
      coreIndices.push(0, 0, 0, 0); // Single core
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('orbitRingIndex', new THREE.Float32BufferAttribute(orbitRingIndices, 1));
    geometry.setAttribute('satelliteIndex', new THREE.Float32BufferAttribute(satelliteIndices, 1));
    geometry.setAttribute('coreIndex', new THREE.Float32BufferAttribute(coreIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Orbit rings (quads)
    for (let i = 0; i < this.numRings; i++) {
      for (let j = 0; j < ringSegments; j++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Satellites (quads)
    for (let i = 0; i < this.numSatellites; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Core (quads)
    for (let i = 0; i < this.core.segments; i++) {
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
   * Update with cosmic orbit state
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

