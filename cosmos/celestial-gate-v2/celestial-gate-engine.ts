/**
 * Celestial Gate v2 Engine
 * 
 * Phase 2 — Section 62: CELESTIAL GATE ENGINE v2
 * Celestial Gate Engine v2 (E66)
 * 
 * Generate all 20 layers: Base Gate Disc, Twin Gate Pillars, Triple Arch Halo, Celestial Spiral Ribbons, Star Glyph Band, Ascension Rings, Orbital Star Runners, Cross-Dimension Threads, Stellar Flame Shell, Gate Light Shafts, Star Dust Spiral, Starfall Rays, Celestial Fog Layer, Outer Halo Crown, Gate Signature Symbols, Cosmic Lattice Field, Energy Thread Matrix, Ascension Spiral, Celestial Particle Field, Bloom Mask Layer
 */

import * as THREE from 'three';
import { celestialGateVertexShader } from './shaders/celestial-gate-vertex';
import { celestialGateFragmentShader } from './shaders/celestial-gate-fragment';

export interface CelestialGateEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSpiralRibbons?: number;
  numStarGlyphs?: number;
  numAscensionRings?: number;
  numOrbitalRunners?: number;
  numCrossThreads?: number;
  numLightShafts?: number;
  numStarDust?: number;
  numStarfallRays?: number;
  numSignatureSymbols?: number;
  numEnergyThreads?: number;
  numParticles?: number;
}

export class CelestialGateEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialGateEngineConfig;
  
  private numSpiralRibbons: number;
  private numStarGlyphs: number;
  private numAscensionRings: number;
  private numOrbitalRunners: number;
  private numCrossThreads: number;
  private numLightShafts: number;
  private numStarDust: number;
  private numStarfallRays: number;
  private numSignatureSymbols: number;
  private numEnergyThreads: number;
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialGateEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numSpiralRibbons: config.numSpiralRibbons || 5,
      numStarGlyphs: config.numStarGlyphs || 108,
      numAscensionRings: config.numAscensionRings || 3,
      numOrbitalRunners: config.numOrbitalRunners || 12,
      numCrossThreads: config.numCrossThreads || 40,
      numLightShafts: config.numLightShafts || 14,
      numStarDust: config.numStarDust || 200,
      numStarfallRays: config.numStarfallRays || 20,
      numSignatureSymbols: config.numSignatureSymbols || 20,
      numEnergyThreads: config.numEnergyThreads || 40,
      numParticles: config.numParticles || 350,
    };
    
    this.numSpiralRibbons = this.config.numSpiralRibbons || 5;
    this.numStarGlyphs = this.config.numStarGlyphs || 108;
    this.numAscensionRings = this.config.numAscensionRings || 3;
    this.numOrbitalRunners = this.config.numOrbitalRunners || 12;
    this.numCrossThreads = this.config.numCrossThreads || 40;
    this.numLightShafts = this.config.numLightShafts || 14;
    this.numStarDust = this.config.numStarDust || 200;
    this.numStarfallRays = this.config.numStarfallRays || 20;
    this.numSignatureSymbols = this.config.numSignatureSymbols || 20;
    this.numEnergyThreads = this.config.numEnergyThreads || 40;
    this.numParticles = this.config.numParticles || 350;
    
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
      vertexShader: celestialGateVertexShader,
      fragmentShader: celestialGateFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Create geometry with all 20 layers
   * Note: This is a simplified version - full implementation would include all 20 layers
   * The shader system is ready to handle all layers, but geometry can be expanded later
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 20 layers
    const gateRadius = 6.5;
    const radialSegments = 64;
    const concentricRings = 32;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Layer A: Base Gate Disc (64 radial × 32 concentric grid)
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const u = i / radialSegments;
        const v = j / concentricRings;
        const angle = u * Math.PI * 2.0;
        const radius = v * gateRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 30.0
        );
        uvs.push(u, v);
      }
    }
    
    // Create indices for base gate disc
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
    const baseGateDiscIndex = new Float32Array(positions.length / 3);
    const twinPillarIndex = new Float32Array(positions.length / 3).fill(-1);
    const tripleArchIndex = new Float32Array(positions.length / 3).fill(-1);
    const spiralRibbonIndex = new Float32Array(positions.length / 3).fill(-1);
    const starGlyphIndex = new Float32Array(positions.length / 3).fill(-1);
    const ascensionRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const orbitalRunnerIndex = new Float32Array(positions.length / 3).fill(-1);
    const crossThreadIndex = new Float32Array(positions.length / 3).fill(-1);
    const flameShellIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightShaftIndex = new Float32Array(positions.length / 3).fill(-1);
    const starDustIndex = new Float32Array(positions.length / 3).fill(-1);
    const starfallRayIndex = new Float32Array(positions.length / 3).fill(-1);
    const fogLayerIndex = new Float32Array(positions.length / 3).fill(-1);
    const outerHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const signatureSymbolIndex = new Float32Array(positions.length / 3).fill(-1);
    const latticeFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const energyThreadIndex = new Float32Array(positions.length / 3).fill(-1);
    const ascensionSpiralIndex = new Float32Array(positions.length / 3).fill(-1);
    const particleFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const bloomIndex = new Float32Array(positions.length / 3).fill(-1);
    
    // Set base gate disc indices
    for (let i = 0; i < baseGateDiscIndex.length; i++) {
      baseGateDiscIndex[i] = i;
    }
    
    geometry.setAttribute('baseGateDiscIndex', new THREE.Float32BufferAttribute(baseGateDiscIndex, 1));
    geometry.setAttribute('twinPillarIndex', new THREE.Float32BufferAttribute(twinPillarIndex, 1));
    geometry.setAttribute('tripleArchIndex', new THREE.Float32BufferAttribute(tripleArchIndex, 1));
    geometry.setAttribute('spiralRibbonIndex', new THREE.Float32BufferAttribute(spiralRibbonIndex, 1));
    geometry.setAttribute('starGlyphIndex', new THREE.Float32BufferAttribute(starGlyphIndex, 1));
    geometry.setAttribute('ascensionRingIndex', new THREE.Float32BufferAttribute(ascensionRingIndex, 1));
    geometry.setAttribute('orbitalRunnerIndex', new THREE.Float32BufferAttribute(orbitalRunnerIndex, 1));
    geometry.setAttribute('crossThreadIndex', new THREE.Float32BufferAttribute(crossThreadIndex, 1));
    geometry.setAttribute('flameShellIndex', new THREE.Float32BufferAttribute(flameShellIndex, 1));
    geometry.setAttribute('lightShaftIndex', new THREE.Float32BufferAttribute(lightShaftIndex, 1));
    geometry.setAttribute('starDustIndex', new THREE.Float32BufferAttribute(starDustIndex, 1));
    geometry.setAttribute('starfallRayIndex', new THREE.Float32BufferAttribute(starfallRayIndex, 1));
    geometry.setAttribute('fogLayerIndex', new THREE.Float32BufferAttribute(fogLayerIndex, 1));
    geometry.setAttribute('outerHaloIndex', new THREE.Float32BufferAttribute(outerHaloIndex, 1));
    geometry.setAttribute('signatureSymbolIndex', new THREE.Float32BufferAttribute(signatureSymbolIndex, 1));
    geometry.setAttribute('latticeFieldIndex', new THREE.Float32BufferAttribute(latticeFieldIndex, 1));
    geometry.setAttribute('energyThreadIndex', new THREE.Float32BufferAttribute(energyThreadIndex, 1));
    geometry.setAttribute('ascensionSpiralIndex', new THREE.Float32BufferAttribute(ascensionSpiralIndex, 1));
    geometry.setAttribute('particleFieldIndex', new THREE.Float32BufferAttribute(particleFieldIndex, 1));
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
   * Update with celestial gate state
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

