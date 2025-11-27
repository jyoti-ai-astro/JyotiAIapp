/**
 * Cosmic Lens Engine
 * 
 * Phase 2 — Section 49: COSMIC LENS ENGINE
 * Cosmic Lens Engine (E53)
 * 
 * Generate lens plane, light arcs, photon particles, manage uniforms
 */

import * as THREE from 'three';
import { cosmicLensVertexShader } from './shaders/cosmic-lens-vertex';
import { cosmicLensFragmentShader } from './shaders/cosmic-lens-fragment';

export interface CosmicLensEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numPhotons?: number;
}

export interface LensPlaneData {
  width: number;
  height: number;
  segments: number;
}

export interface ArcData {
  arcIndex: number;
  baseRadius: number; // 1.8 to 6.0
  thickness: number;
}

export interface PhotonData {
  photonIndex: number;
  speed: number;
  baseRadius: number;
}

export class CosmicLensEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CosmicLensEngineConfig;
  
  private lensPlane: LensPlaneData;
  private arcs: ArcData[] = [];
  private photons: PhotonData[] = [];
  
  private numPhotons: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CosmicLensEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numPhotons: config.numPhotons || 260,
    };
    
    this.numPhotons = this.config.numPhotons || 260;
    
    // Generate lens plane
    this.generateLensPlane();
    
    // Generate arcs
    this.generateArcs();
    
    // Generate photons
    this.generatePhotons();
    
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
      vertexShader: cosmicLensVertexShader,
      fragmentShader: cosmicLensFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate lens plane
   */
  private generateLensPlane(): void {
    this.lensPlane = {
      width: 24.0,
      height: 14.0,
      segments: 48, // 48×48 grid
    };
  }

  /**
   * Generate arcs (3-6 arcs)
   */
  private generateArcs(): void {
    this.arcs = [];
    
    for (let i = 0; i < 6; i++) {
      const baseRadius = 1.8 + (i / 5.0) * 4.2; // 1.8 to 6.0
      this.arcs.push({
        arcIndex: i,
        baseRadius,
        thickness: 0.2,
      });
    }
  }

  /**
   * Generate photons (200-320)
   */
  private generatePhotons(): void {
    this.photons = [];
    
    for (let i = 0; i < this.numPhotons; i++) {
      const speed = 0.1 + (i / this.numPhotons) * 0.08; // Varying speeds
      const baseRadius = 1.5 + (i / this.numPhotons) * 4.5; // 1.5 to 6.0
      
      this.photons.push({
        photonIndex: i,
        speed,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with lens plane, arcs, and photons
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const lensIndices: number[] = [];
    const arcIndices: number[] = [];
    const photonIndices: number[] = [];
    
    // ============================================
    // LENS PLANE (Layer A)
    // ============================================
    const planeWidth = 24.0;
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
        
        lensIndices.push(0); // Single lens plane
        arcIndices.push(-1);
        photonIndices.push(-1);
      }
    }
    
    // ============================================
    // ARCS (Layer B - 6 arcs)
    // ============================================
    const arcSegments = 64; // Segments per arc (full circle)
    const thickness = 0.2;
    
    for (let arc = 0; arc < 6; arc++) {
      const arcData = this.arcs[arc];
      
      for (let i = 0; i <= arcSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / arcSegments; // Angle: 0 to 1 (0 to 2π)
          const v = j / 4.0; // Thickness: 0 to 1
          
          const angle = u * Math.PI * 2.0; // 0 to 2π
          const radius = arcData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          lensIndices.push(-1);
          arcIndices.push(arc);
          photonIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // PHOTONS (Layer C)
    // ============================================
    const photonRadius = 0.0125;
    
    for (let i = 0; i < this.numPhotons; i++) {
      const photon = this.photons[i];
      const x = 0.0; // Will be positioned in shader
      const y = 0.0;
      const z = 0.0;
      
      // Create quad for each photon
      positions.push(
        x - photonRadius, y - photonRadius, z, // Bottom-left
        x + photonRadius, y - photonRadius, z, // Bottom-right
        x - photonRadius, y + photonRadius, z, // Top-left
        x + photonRadius, y + photonRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      lensIndices.push(-1, -1, -1, -1);
      arcIndices.push(-1, -1, -1, -1);
      photonIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('lensIndex', new THREE.Float32BufferAttribute(lensIndices, 1));
    geometry.setAttribute('arcIndex', new THREE.Float32BufferAttribute(arcIndices, 1));
    geometry.setAttribute('photonIndex', new THREE.Float32BufferAttribute(photonIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Lens plane (quads)
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
    
    // Arcs (quads) - 6 arcs
    for (let arc = 0; arc < 6; arc++) {
      for (let i = 0; i < arcSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (arcSegments + 1) * 5;
    }
    
    // Photons (quads)
    for (let i = 0; i < this.numPhotons; i++) {
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
   * Update with cosmic lens state
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

