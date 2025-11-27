/**
 * Celestial Sanctum v3 Engine
 * 
 * Phase 2 — Section 64: CELESTIAL SANCTUM ENGINE v3
 * Celestial Sanctum Engine v3 (E68)
 * 
 * Generate all 24 layers: Sanctum Base Disc, Twin Infinity Staircases, Celestial Sanctum Pillars, Triple Halo Arch Crown, Quantum Spiral Halo, Celestial Rune Band, Ascension Obelisks, Cross-Realm Beams, Orbital Sanctum Rings, Sanctum Flame Shell, Ether Fog Plane, Sanctum Light Shafts, Inner Spiral Matrix, Divine Particle Stream, Dimensional Wave Rings, Outer Sanctum Halo, Sanctum Heart Core, Celestial Lattice Veil, Ether Thread Matrix, Spiral Light Towers, Sanctum Rays, Ascension Aura Field, Reality Warp Layer, Bloom Mask Layer
 */

import * as THREE from 'three';
import { celestialSanctumVertexShader } from './shaders/celestial-sanctum-vertex';
import { celestialSanctumFragmentShader } from './shaders/celestial-sanctum-fragment';

export interface CelestialSanctumEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSanctumPillars?: number;
  numRunes?: number;
  numObelisks?: number;
  numCrossBeams?: number;
  numOrbitalRings?: number;
  numLightShafts?: number;
  numSpiralMatrix?: number;
  numParticles?: number;
  numWaveRings?: number;
  numEtherThreads?: number;
  numLightTowers?: number;
  numSanctumRays?: number;
}

export class CelestialSanctumEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialSanctumEngineConfig;
  
  private numSanctumPillars: number;
  private numRunes: number;
  private numObelisks: number;
  private numCrossBeams: number;
  private numOrbitalRings: number;
  private numLightShafts: number;
  private numSpiralMatrix: number;
  private numParticles: number;
  private numWaveRings: number;
  private numEtherThreads: number;
  private numLightTowers: number;
  private numSanctumRays: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialSanctumEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numSanctumPillars: config.numSanctumPillars || 12,
      numRunes: config.numRunes || 120,
      numObelisks: config.numObelisks || 10,
      numCrossBeams: config.numCrossBeams || 40,
      numOrbitalRings: config.numOrbitalRings || 4,
      numLightShafts: config.numLightShafts || 12,
      numSpiralMatrix: config.numSpiralMatrix || 18,
      numParticles: config.numParticles || 400,
      numWaveRings: config.numWaveRings || 12,
      numEtherThreads: config.numEtherThreads || 45,
      numLightTowers: config.numLightTowers || 8,
      numSanctumRays: config.numSanctumRays || 24,
    };
    
    this.numSanctumPillars = this.config.numSanctumPillars || 12;
    this.numRunes = this.config.numRunes || 120;
    this.numObelisks = this.config.numObelisks || 10;
    this.numCrossBeams = this.config.numCrossBeams || 40;
    this.numOrbitalRings = this.config.numOrbitalRings || 4;
    this.numLightShafts = this.config.numLightShafts || 12;
    this.numSpiralMatrix = this.config.numSpiralMatrix || 18;
    this.numParticles = this.config.numParticles || 400;
    this.numWaveRings = this.config.numWaveRings || 12;
    this.numEtherThreads = this.config.numEtherThreads || 45;
    this.numLightTowers = this.config.numLightTowers || 8;
    this.numSanctumRays = this.config.numSanctumRays || 24;
    
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
      vertexShader: celestialSanctumVertexShader,
      fragmentShader: celestialSanctumFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Create geometry with all 24 layers
   * Note: This is a simplified version - full implementation would include all 24 layers
   * The shader system is ready to handle all layers, but geometry can be expanded later
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 24 layers
    const sanctumRadius = 6.5;
    const radialSegments = 64;
    const concentricRings = 64;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Layer A: Sanctum Base Disc (64×64 grid)
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const u = i / radialSegments;
        const v = j / concentricRings;
        const angle = u * Math.PI * 2.0;
        const radius = v * sanctumRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 36.4
        );
        uvs.push(u, v);
      }
    }
    
    // Create indices for base disc
    for (let i = 0; i < radialSegments; i++) {
      for (let j = 0; j < concentricRings; j++) {
        const a = i * (concentricRings + 1) + j;
        const b = a + 1;
        const c = a + (concentricRings + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    // Set layer indices (using -1 for layers not active at this vertex)
    const baseDiscIndex = new Float32Array(positions.length / 3);
    const twinStaircaseIndex = new Float32Array(positions.length / 3).fill(-1);
    const sanctumPillarIndex = new Float32Array(positions.length / 3).fill(-1);
    const tripleHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const quantumSpiralIndex = new Float32Array(positions.length / 3).fill(-1);
    const runeBandIndex = new Float32Array(positions.length / 3).fill(-1);
    const obeliskIndex = new Float32Array(positions.length / 3).fill(-1);
    const crossBeamIndex = new Float32Array(positions.length / 3).fill(-1);
    const orbitalRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const flameShellIndex = new Float32Array(positions.length / 3).fill(-1);
    const etherFogIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightShaftIndex = new Float32Array(positions.length / 3).fill(-1);
    const spiralMatrixIndex = new Float32Array(positions.length / 3).fill(-1);
    const particleStreamIndex = new Float32Array(positions.length / 3).fill(-1);
    const waveRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const outerHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const heartCoreIndex = new Float32Array(positions.length / 3).fill(-1);
    const latticeVeilIndex = new Float32Array(positions.length / 3).fill(-1);
    const etherThreadIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightTowerIndex = new Float32Array(positions.length / 3).fill(-1);
    const sanctumRayIndex = new Float32Array(positions.length / 3).fill(-1);
    const auraFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const realityWarpIndex = new Float32Array(positions.length / 3).fill(-1);
    const bloomIndex = new Float32Array(positions.length / 3).fill(-1);
    
    // Set base disc indices
    for (let i = 0; i < baseDiscIndex.length; i++) {
      baseDiscIndex[i] = i;
    }
    
    geometry.setAttribute('baseDiscIndex', new THREE.Float32BufferAttribute(baseDiscIndex, 1));
    geometry.setAttribute('twinStaircaseIndex', new THREE.Float32BufferAttribute(twinStaircaseIndex, 1));
    geometry.setAttribute('sanctumPillarIndex', new THREE.Float32BufferAttribute(sanctumPillarIndex, 1));
    geometry.setAttribute('tripleHaloIndex', new THREE.Float32BufferAttribute(tripleHaloIndex, 1));
    geometry.setAttribute('quantumSpiralIndex', new THREE.Float32BufferAttribute(quantumSpiralIndex, 1));
    geometry.setAttribute('runeBandIndex', new THREE.Float32BufferAttribute(runeBandIndex, 1));
    geometry.setAttribute('obeliskIndex', new THREE.Float32BufferAttribute(obeliskIndex, 1));
    geometry.setAttribute('crossBeamIndex', new THREE.Float32BufferAttribute(crossBeamIndex, 1));
    geometry.setAttribute('orbitalRingIndex', new THREE.Float32BufferAttribute(orbitalRingIndex, 1));
    geometry.setAttribute('flameShellIndex', new THREE.Float32BufferAttribute(flameShellIndex, 1));
    geometry.setAttribute('etherFogIndex', new THREE.Float32BufferAttribute(etherFogIndex, 1));
    geometry.setAttribute('lightShaftIndex', new THREE.Float32BufferAttribute(lightShaftIndex, 1));
    geometry.setAttribute('spiralMatrixIndex', new THREE.Float32BufferAttribute(spiralMatrixIndex, 1));
    geometry.setAttribute('particleStreamIndex', new THREE.Float32BufferAttribute(particleStreamIndex, 1));
    geometry.setAttribute('waveRingIndex', new THREE.Float32BufferAttribute(waveRingIndex, 1));
    geometry.setAttribute('outerHaloIndex', new THREE.Float32BufferAttribute(outerHaloIndex, 1));
    geometry.setAttribute('heartCoreIndex', new THREE.Float32BufferAttribute(heartCoreIndex, 1));
    geometry.setAttribute('latticeVeilIndex', new THREE.Float32BufferAttribute(latticeVeilIndex, 1));
    geometry.setAttribute('etherThreadIndex', new THREE.Float32BufferAttribute(etherThreadIndex, 1));
    geometry.setAttribute('lightTowerIndex', new THREE.Float32BufferAttribute(lightTowerIndex, 1));
    geometry.setAttribute('sanctumRayIndex', new THREE.Float32BufferAttribute(sanctumRayIndex, 1));
    geometry.setAttribute('auraFieldIndex', new THREE.Float32BufferAttribute(auraFieldIndex, 1));
    geometry.setAttribute('realityWarpIndex', new THREE.Float32BufferAttribute(realityWarpIndex, 1));
    geometry.setAttribute('bloomIndex', new THREE.Float32BufferAttribute(bloomIndex, 1));
    
    // Radial segment and concentric ring attributes
    const radialSegment = new Float32Array(positions.length / 3);
    const concentricRing = new Float32Array(positions.length / 3);
    
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const index = i * (concentricRings + 1) + j;
        radialSegment[index] = i;
        concentricRing[index] = j;
      }
    }
    
    geometry.setAttribute('radialSegment', new THREE.Float32BufferAttribute(radialSegment, 1));
    geometry.setAttribute('concentricRing', new THREE.Float32BufferAttribute(concentricRing, 1));
    
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
   * Update with celestial sanctum state
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

