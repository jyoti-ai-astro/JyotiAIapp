/**
 * Celestial Crest v2 Engine
 * 
 * Phase 2 — Section 66: CELESTIAL CREST ENGINE v2
 * Celestial Crest Engine v2 (E70)
 * 
 * Generate all 28 layers: Crest Base Plate, Twin Royal Crest Pillars, Triple Crest Arches, Supreme Crest Halo, Celestial Crest Rune Band, Crest Spiral Ribbons, Crest Glyph Ring, Orbital Crest Runners, Crest Light Shafts, Crest Flame Shell, Crest Fog Plane, Crest Dust Field, Crest Spiral Matrix, Ascension Crest Rays, Outer Crest Halo, Inner Crest Core, Crest Energy Threads, Dimensional Crest Ripple, Crest Wave Rings, Crest Particle Stream, Supreme Crest Aura Field, Crest Spires, Crest Rune Crown, Crest Lattice Veil, Crest Warp Layer, Bloom Mask Layer, Crown-Crest Interlink Layer, Crest-Sanctum Resonance Layer
 */

import * as THREE from 'three';
import { celestialCrestVertexShader } from './shaders/celestial-crest-vertex';
import { celestialCrestFragmentShader } from './shaders/celestial-crest-fragment';

export interface CelestialCrestEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numTwinPillars?: number;
  numRunes?: number;
  numGlyphs?: number;
  numRunners?: number;
  numLightShafts?: number;
  numSpiralMatrix?: number;
  numParticles?: number;
  numWaveRings?: number;
  numEnergyThreads?: number;
  numCrestSpires?: number;
  numCrestRays?: number;
}

export class CelestialCrestEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialCrestEngineConfig;
  
  private numTwinPillars: number;
  private numRunes: number;
  private numGlyphs: number;
  private numRunners: number;
  private numLightShafts: number;
  private numSpiralMatrix: number;
  private numParticles: number;
  private numWaveRings: number;
  private numEnergyThreads: number;
  private numCrestSpires: number;
  private numCrestRays: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialCrestEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numTwinPillars: config.numTwinPillars || 2,
      numRunes: config.numRunes || 140,
      numGlyphs: config.numGlyphs || 140,
      numRunners: config.numRunners || 16,
      numLightShafts: config.numLightShafts || 16,
      numSpiralMatrix: config.numSpiralMatrix || 22,
      numParticles: config.numParticles || 500,
      numWaveRings: config.numWaveRings || 16,
      numEnergyThreads: config.numEnergyThreads || 55,
      numCrestSpires: config.numCrestSpires || 14,
      numCrestRays: config.numCrestRays || 28,
    };
    
    this.numTwinPillars = this.config.numTwinPillars || 2;
    this.numRunes = this.config.numRunes || 140;
    this.numGlyphs = this.config.numGlyphs || 140;
    this.numRunners = this.config.numRunners || 16;
    this.numLightShafts = this.config.numLightShafts || 16;
    this.numSpiralMatrix = this.config.numSpiralMatrix || 22;
    this.numParticles = this.config.numParticles || 500;
    this.numWaveRings = this.config.numWaveRings || 16;
    this.numEnergyThreads = this.config.numEnergyThreads || 55;
    this.numCrestSpires = this.config.numCrestSpires || 14;
    this.numCrestRays = this.config.numCrestRays || 28;
    
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
      vertexShader: celestialCrestVertexShader,
      fragmentShader: celestialCrestFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Create geometry with all 28 layers
   * Note: This is a simplified version - full implementation would include all 28 layers
   * The shader system is ready to handle all layers, but geometry can be expanded later
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 28 layers
    const crestRadius = 7.5;
    const radialSegments = 64;
    const concentricRings = 64;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Layer A: Crest Base Plate (64×64 grid)
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const u = i / radialSegments;
        const v = j / concentricRings;
        const angle = u * Math.PI * 2.0;
        const radius = v * crestRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 42.6
        );
        uvs.push(u, v);
      }
    }
    
    // Create indices for base plate
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
    const basePlateIndex = new Float32Array(positions.length / 3);
    const twinPillarIndex = new Float32Array(positions.length / 3).fill(-1);
    const tripleArchIndex = new Float32Array(positions.length / 3).fill(-1);
    const supremeHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const runeBandIndex = new Float32Array(positions.length / 3).fill(-1);
    const spiralRibbonIndex = new Float32Array(positions.length / 3).fill(-1);
    const glyphRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const orbitalRunnerIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightShaftIndex = new Float32Array(positions.length / 3).fill(-1);
    const flameShellIndex = new Float32Array(positions.length / 3).fill(-1);
    const fogPlaneIndex = new Float32Array(positions.length / 3).fill(-1);
    const dustFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const spiralMatrixIndex = new Float32Array(positions.length / 3).fill(-1);
    const crestRayIndex = new Float32Array(positions.length / 3).fill(-1);
    const outerHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const innerCoreIndex = new Float32Array(positions.length / 3).fill(-1);
    const energyThreadIndex = new Float32Array(positions.length / 3).fill(-1);
    const rippleIndex = new Float32Array(positions.length / 3).fill(-1);
    const waveRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const particleStreamIndex = new Float32Array(positions.length / 3).fill(-1);
    const auraFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const crestSpireIndex = new Float32Array(positions.length / 3).fill(-1);
    const runeCrownIndex = new Float32Array(positions.length / 3).fill(-1);
    const latticeVeilIndex = new Float32Array(positions.length / 3).fill(-1);
    const warpLayerIndex = new Float32Array(positions.length / 3).fill(-1);
    const bloomIndex = new Float32Array(positions.length / 3).fill(-1);
    const interlinkIndex = new Float32Array(positions.length / 3).fill(-1);
    const resonanceIndex = new Float32Array(positions.length / 3).fill(-1);
    
    // Set base plate indices
    for (let i = 0; i < basePlateIndex.length; i++) {
      basePlateIndex[i] = i;
    }
    
    geometry.setAttribute('basePlateIndex', new THREE.Float32BufferAttribute(basePlateIndex, 1));
    geometry.setAttribute('twinPillarIndex', new THREE.Float32BufferAttribute(twinPillarIndex, 1));
    geometry.setAttribute('tripleArchIndex', new THREE.Float32BufferAttribute(tripleArchIndex, 1));
    geometry.setAttribute('supremeHaloIndex', new THREE.Float32BufferAttribute(supremeHaloIndex, 1));
    geometry.setAttribute('runeBandIndex', new THREE.Float32BufferAttribute(runeBandIndex, 1));
    geometry.setAttribute('spiralRibbonIndex', new THREE.Float32BufferAttribute(spiralRibbonIndex, 1));
    geometry.setAttribute('glyphRingIndex', new THREE.Float32BufferAttribute(glyphRingIndex, 1));
    geometry.setAttribute('orbitalRunnerIndex', new THREE.Float32BufferAttribute(orbitalRunnerIndex, 1));
    geometry.setAttribute('lightShaftIndex', new THREE.Float32BufferAttribute(lightShaftIndex, 1));
    geometry.setAttribute('flameShellIndex', new THREE.Float32BufferAttribute(flameShellIndex, 1));
    geometry.setAttribute('fogPlaneIndex', new THREE.Float32BufferAttribute(fogPlaneIndex, 1));
    geometry.setAttribute('dustFieldIndex', new THREE.Float32BufferAttribute(dustFieldIndex, 1));
    geometry.setAttribute('spiralMatrixIndex', new THREE.Float32BufferAttribute(spiralMatrixIndex, 1));
    geometry.setAttribute('crestRayIndex', new THREE.Float32BufferAttribute(crestRayIndex, 1));
    geometry.setAttribute('outerHaloIndex', new THREE.Float32BufferAttribute(outerHaloIndex, 1));
    geometry.setAttribute('innerCoreIndex', new THREE.Float32BufferAttribute(innerCoreIndex, 1));
    geometry.setAttribute('energyThreadIndex', new THREE.Float32BufferAttribute(energyThreadIndex, 1));
    geometry.setAttribute('rippleIndex', new THREE.Float32BufferAttribute(rippleIndex, 1));
    geometry.setAttribute('waveRingIndex', new THREE.Float32BufferAttribute(waveRingIndex, 1));
    geometry.setAttribute('particleStreamIndex', new THREE.Float32BufferAttribute(particleStreamIndex, 1));
    geometry.setAttribute('auraFieldIndex', new THREE.Float32BufferAttribute(auraFieldIndex, 1));
    geometry.setAttribute('crestSpireIndex', new THREE.Float32BufferAttribute(crestSpireIndex, 1));
    geometry.setAttribute('runeCrownIndex', new THREE.Float32BufferAttribute(runeCrownIndex, 1));
    geometry.setAttribute('latticeVeilIndex', new THREE.Float32BufferAttribute(latticeVeilIndex, 1));
    geometry.setAttribute('warpLayerIndex', new THREE.Float32BufferAttribute(warpLayerIndex, 1));
    geometry.setAttribute('bloomIndex', new THREE.Float32BufferAttribute(bloomIndex, 1));
    geometry.setAttribute('interlinkIndex', new THREE.Float32BufferAttribute(interlinkIndex, 1));
    geometry.setAttribute('resonanceIndex', new THREE.Float32BufferAttribute(resonanceIndex, 1));
    
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
   * Update with celestial crest state
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

