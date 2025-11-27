/**
 * Celestial Crown v2 Engine
 * 
 * Phase 2 — Section 65: CELESTIAL CROWN ENGINE v2
 * Celestial Crown Engine v2 (E69)
 * 
 * Generate all 26 layers: Crown Base Disc, Twin Crown Pillars, Triple Ascension Arches, Royal Crown Halo, Celestial Sigil Band, Spiral Crown Ribbons, Crown Glyph Ring, Orbital Crown Runners, Royal Light Shafts, Crown Flame Shell, Crown Fog Plane, Crown Dust Field, Royal Spiral Matrix, Ascension Crown Rays, Outer Crown Halo, Inner Crown Core, Crown Energy Threads, Dimensional Ripple Veil, Ascension Wave Rings, Crown Particle Stream, Supreme Aura Field, Crown Spires, Royal Rune Band, Crown Lattice Field, Crown Warp Layer, Bloom Mask Layer
 */

import * as THREE from 'three';
import { celestialCrownVertexShader } from './shaders/celestial-crown-vertex';
import { celestialCrownFragmentShader } from './shaders/celestial-crown-fragment';

export interface CelestialCrownEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numTwinPillars?: number;
  numSigils?: number;
  numGlyphs?: number;
  numRunners?: number;
  numLightShafts?: number;
  numSpiralMatrix?: number;
  numParticles?: number;
  numWaveRings?: number;
  numEnergyThreads?: number;
  numCrownSpires?: number;
  numRunes?: number;
  numCrownRays?: number;
}

export class CelestialCrownEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialCrownEngineConfig;
  
  private numTwinPillars: number;
  private numSigils: number;
  private numGlyphs: number;
  private numRunners: number;
  private numLightShafts: number;
  private numSpiralMatrix: number;
  private numParticles: number;
  private numWaveRings: number;
  private numEnergyThreads: number;
  private numCrownSpires: number;
  private numRunes: number;
  private numCrownRays: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialCrownEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numTwinPillars: config.numTwinPillars || 2,
      numSigils: config.numSigils || 130,
      numGlyphs: config.numGlyphs || 130,
      numRunners: config.numRunners || 14,
      numLightShafts: config.numLightShafts || 14,
      numSpiralMatrix: config.numSpiralMatrix || 20,
      numParticles: config.numParticles || 450,
      numWaveRings: config.numWaveRings || 14,
      numEnergyThreads: config.numEnergyThreads || 50,
      numCrownSpires: config.numCrownSpires || 12,
      numRunes: config.numRunes || 130,
      numCrownRays: config.numCrownRays || 26,
    };
    
    this.numTwinPillars = this.config.numTwinPillars || 2;
    this.numSigils = this.config.numSigils || 130;
    this.numGlyphs = this.config.numGlyphs || 130;
    this.numRunners = this.config.numRunners || 14;
    this.numLightShafts = this.config.numLightShafts || 14;
    this.numSpiralMatrix = this.config.numSpiralMatrix || 20;
    this.numParticles = this.config.numParticles || 450;
    this.numWaveRings = this.config.numWaveRings || 14;
    this.numEnergyThreads = this.config.numEnergyThreads || 50;
    this.numCrownSpires = this.config.numCrownSpires || 12;
    this.numRunes = this.config.numRunes || 130;
    this.numCrownRays = this.config.numCrownRays || 26;
    
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
      vertexShader: celestialCrownVertexShader,
      fragmentShader: celestialCrownFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Create geometry with all 26 layers
   * Note: This is a simplified version - full implementation would include all 26 layers
   * The shader system is ready to handle all layers, but geometry can be expanded later
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 26 layers
    const crownRadius = 7.0;
    const radialSegments = 64;
    const concentricRings = 64;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Layer A: Crown Base Disc (64×64 grid)
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const u = i / radialSegments;
        const v = j / concentricRings;
        const angle = u * Math.PI * 2.0;
        const radius = v * crownRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 39.8
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
    const twinPillarIndex = new Float32Array(positions.length / 3).fill(-1);
    const tripleArchIndex = new Float32Array(positions.length / 3).fill(-1);
    const royalHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const sigilBandIndex = new Float32Array(positions.length / 3).fill(-1);
    const spiralRibbonIndex = new Float32Array(positions.length / 3).fill(-1);
    const glyphRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const orbitalRunnerIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightShaftIndex = new Float32Array(positions.length / 3).fill(-1);
    const flameShellIndex = new Float32Array(positions.length / 3).fill(-1);
    const fogPlaneIndex = new Float32Array(positions.length / 3).fill(-1);
    const dustFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const spiralMatrixIndex = new Float32Array(positions.length / 3).fill(-1);
    const crownRayIndex = new Float32Array(positions.length / 3).fill(-1);
    const outerHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const innerCoreIndex = new Float32Array(positions.length / 3).fill(-1);
    const energyThreadIndex = new Float32Array(positions.length / 3).fill(-1);
    const rippleVeilIndex = new Float32Array(positions.length / 3).fill(-1);
    const waveRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const particleStreamIndex = new Float32Array(positions.length / 3).fill(-1);
    const auraFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const crownSpireIndex = new Float32Array(positions.length / 3).fill(-1);
    const runeBandIndex = new Float32Array(positions.length / 3).fill(-1);
    const latticeFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const warpLayerIndex = new Float32Array(positions.length / 3).fill(-1);
    const bloomIndex = new Float32Array(positions.length / 3).fill(-1);
    
    // Set base disc indices
    for (let i = 0; i < baseDiscIndex.length; i++) {
      baseDiscIndex[i] = i;
    }
    
    geometry.setAttribute('baseDiscIndex', new THREE.Float32BufferAttribute(baseDiscIndex, 1));
    geometry.setAttribute('twinPillarIndex', new THREE.Float32BufferAttribute(twinPillarIndex, 1));
    geometry.setAttribute('tripleArchIndex', new THREE.Float32BufferAttribute(tripleArchIndex, 1));
    geometry.setAttribute('royalHaloIndex', new THREE.Float32BufferAttribute(royalHaloIndex, 1));
    geometry.setAttribute('sigilBandIndex', new THREE.Float32BufferAttribute(sigilBandIndex, 1));
    geometry.setAttribute('spiralRibbonIndex', new THREE.Float32BufferAttribute(spiralRibbonIndex, 1));
    geometry.setAttribute('glyphRingIndex', new THREE.Float32BufferAttribute(glyphRingIndex, 1));
    geometry.setAttribute('orbitalRunnerIndex', new THREE.Float32BufferAttribute(orbitalRunnerIndex, 1));
    geometry.setAttribute('lightShaftIndex', new THREE.Float32BufferAttribute(lightShaftIndex, 1));
    geometry.setAttribute('flameShellIndex', new THREE.Float32BufferAttribute(flameShellIndex, 1));
    geometry.setAttribute('fogPlaneIndex', new THREE.Float32BufferAttribute(fogPlaneIndex, 1));
    geometry.setAttribute('dustFieldIndex', new THREE.Float32BufferAttribute(dustFieldIndex, 1));
    geometry.setAttribute('spiralMatrixIndex', new THREE.Float32BufferAttribute(spiralMatrixIndex, 1));
    geometry.setAttribute('crownRayIndex', new THREE.Float32BufferAttribute(crownRayIndex, 1));
    geometry.setAttribute('outerHaloIndex', new THREE.Float32BufferAttribute(outerHaloIndex, 1));
    geometry.setAttribute('innerCoreIndex', new THREE.Float32BufferAttribute(innerCoreIndex, 1));
    geometry.setAttribute('energyThreadIndex', new THREE.Float32BufferAttribute(energyThreadIndex, 1));
    geometry.setAttribute('rippleVeilIndex', new THREE.Float32BufferAttribute(rippleVeilIndex, 1));
    geometry.setAttribute('waveRingIndex', new THREE.Float32BufferAttribute(waveRingIndex, 1));
    geometry.setAttribute('particleStreamIndex', new THREE.Float32BufferAttribute(particleStreamIndex, 1));
    geometry.setAttribute('auraFieldIndex', new THREE.Float32BufferAttribute(auraFieldIndex, 1));
    geometry.setAttribute('crownSpireIndex', new THREE.Float32BufferAttribute(crownSpireIndex, 1));
    geometry.setAttribute('runeBandIndex', new THREE.Float32BufferAttribute(runeBandIndex, 1));
    geometry.setAttribute('latticeFieldIndex', new THREE.Float32BufferAttribute(latticeFieldIndex, 1));
    geometry.setAttribute('warpLayerIndex', new THREE.Float32BufferAttribute(warpLayerIndex, 1));
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
   * Update with celestial crown state
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

