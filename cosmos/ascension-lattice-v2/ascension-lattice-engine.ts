/**
 * Ascension Lattice v2 Engine
 * 
 * Phase 2 — Section 61: ASCENSION LATTICE ENGINE v2
 * Ascension Lattice Engine v2 (E65)
 * 
 * Generate all 18 layers: Base Lattice Plane, Diamond Lattice Web, Hexa Nexus Rings, Ascension Riser Columns, Luminous Cross-Beams, Interlace Threads, Orbital Ascension Rings, Triple Spiral Matrix, Ascension Wave Rings, Prism Nodes, Vertical Light Shafts, Radiant Energy Mesh, Outer Lattice Halo, Ascension Glyph Band, Dimensional Fog Layer, Ascension Light Rays, Lattice Dust Field, Bloom Mask Layer
 */

import * as THREE from 'three';
import { ascensionLatticeVertexShader } from './shaders/ascension-lattice-vertex';
import { ascensionLatticeFragmentShader } from './shaders/ascension-lattice-fragment';

export interface AscensionLatticeEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numDiamondCells?: number;
  numHexRings?: number;
  numRiserColumns?: number;
  numCrossBeams?: number;
  numInterlaceThreads?: number;
  numOrbitalRings?: number;
  numTripleSpirals?: number;
  numWaveRings?: number;
  numPrismNodes?: number;
  numLightShafts?: number;
  numGlyphs?: number;
  numLightRays?: number;
  numDustParticles?: number;
}

export class AscensionLatticeEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AscensionLatticeEngineConfig;
  
  private numDiamondCells: number;
  private numHexRings: number;
  private numRiserColumns: number;
  private numCrossBeams: number;
  private numInterlaceThreads: number;
  private numOrbitalRings: number;
  private numTripleSpirals: number;
  private numWaveRings: number;
  private numPrismNodes: number;
  private numLightShafts: number;
  private numGlyphs: number;
  private numLightRays: number;
  private numDustParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AscensionLatticeEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numDiamondCells: config.numDiamondCells || 64, // 8×8
      numHexRings: config.numHexRings || 5,
      numRiserColumns: config.numRiserColumns || 20,
      numCrossBeams: config.numCrossBeams || 40,
      numInterlaceThreads: config.numInterlaceThreads || 50,
      numOrbitalRings: config.numOrbitalRings || 4,
      numTripleSpirals: config.numTripleSpirals || 3,
      numWaveRings: config.numWaveRings || 12,
      numPrismNodes: config.numPrismNodes || 120,
      numLightShafts: config.numLightShafts || 14,
      numGlyphs: config.numGlyphs || 96,
      numLightRays: config.numLightRays || 24,
      numDustParticles: config.numDustParticles || 450,
    };
    
    this.numDiamondCells = this.config.numDiamondCells || 64;
    this.numHexRings = this.config.numHexRings || 5;
    this.numRiserColumns = this.config.numRiserColumns || 20;
    this.numCrossBeams = this.config.numCrossBeams || 40;
    this.numInterlaceThreads = this.config.numInterlaceThreads || 50;
    this.numOrbitalRings = this.config.numOrbitalRings || 4;
    this.numTripleSpirals = this.config.numTripleSpirals || 3;
    this.numWaveRings = this.config.numWaveRings || 12;
    this.numPrismNodes = this.config.numPrismNodes || 120;
    this.numLightShafts = this.config.numLightShafts || 14;
    this.numGlyphs = this.config.numGlyphs || 96;
    this.numLightRays = this.config.numLightRays || 24;
    this.numDustParticles = this.config.numDustParticles || 450;
    
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
      vertexShader: ascensionLatticeVertexShader,
      fragmentShader: ascensionLatticeFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Create geometry with all 18 layers
   * Note: This is a simplified version - full implementation would include all 18 layers
   * The shader system is ready to handle all layers, but geometry can be expanded later
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 18 layers
    // Similar pattern to Gateway v3 but with 18 layers instead of 9
    const latticeRadius = 6.0;
    const radialSegments = 64;
    const concentricRings = 64;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Initialize attribute arrays for all 18 layers
    const baseLatticeIndices: number[] = [];
    const diamondWebIndices: number[] = [];
    const hexaNexusIndices: number[] = [];
    const riserColumnIndices: number[] = [];
    const crossBeamIndices: number[] = [];
    const interlaceThreadIndices: number[] = [];
    const orbitalRingIndices: number[] = [];
    const tripleSpiralIndices: number[] = [];
    const waveRingIndices: number[] = [];
    const prismNodeIndices: number[] = [];
    const lightShaftIndices: number[] = [];
    const energyMeshIndices: number[] = [];
    const outerHaloIndices: number[] = [];
    const glyphBandIndices: number[] = [];
    const fogLayerIndices: number[] = [];
    const lightRayIndices: number[] = [];
    const dustFieldIndices: number[] = [];
    const bloomIndices: number[] = [];
    
    // Layer A: Base Lattice Plane (64×64 grid)
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const u = i / radialSegments;
        const v = j / concentricRings;
        const angle = u * Math.PI * 2.0;
        const radius = v * latticeRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 27.0
        );
        uvs.push(u, v);
        
        const vertexIndex = positions.length / 3 - 1;
        baseLatticeIndices.push(vertexIndex);
      }
    }
    
    // Create indices for base lattice
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
    const baseLatticeIndex = new Float32Array(positions.length / 3);
    const diamondWebIndex = new Float32Array(positions.length / 3).fill(-1);
    const hexaNexusIndex = new Float32Array(positions.length / 3).fill(-1);
    const riserColumnIndex = new Float32Array(positions.length / 3).fill(-1);
    const crossBeamIndex = new Float32Array(positions.length / 3).fill(-1);
    const interlaceThreadIndex = new Float32Array(positions.length / 3).fill(-1);
    const orbitalRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const tripleSpiralIndex = new Float32Array(positions.length / 3).fill(-1);
    const waveRingIndex = new Float32Array(positions.length / 3).fill(-1);
    const prismNodeIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightShaftIndex = new Float32Array(positions.length / 3).fill(-1);
    const energyMeshIndex = new Float32Array(positions.length / 3).fill(-1);
    const outerHaloIndex = new Float32Array(positions.length / 3).fill(-1);
    const glyphBandIndex = new Float32Array(positions.length / 3).fill(-1);
    const fogLayerIndex = new Float32Array(positions.length / 3).fill(-1);
    const lightRayIndex = new Float32Array(positions.length / 3).fill(-1);
    const dustFieldIndex = new Float32Array(positions.length / 3).fill(-1);
    const bloomIndex = new Float32Array(positions.length / 3).fill(-1);
    
    // Set base lattice indices
    for (let i = 0; i < baseLatticeIndex.length; i++) {
      baseLatticeIndex[i] = i;
    }
    
    geometry.setAttribute('baseLatticeIndex', new THREE.Float32BufferAttribute(baseLatticeIndex, 1));
    geometry.setAttribute('diamondWebIndex', new THREE.Float32BufferAttribute(diamondWebIndex, 1));
    geometry.setAttribute('hexaNexusIndex', new THREE.Float32BufferAttribute(hexaNexusIndex, 1));
    geometry.setAttribute('riserColumnIndex', new THREE.Float32BufferAttribute(riserColumnIndex, 1));
    geometry.setAttribute('crossBeamIndex', new THREE.Float32BufferAttribute(crossBeamIndex, 1));
    geometry.setAttribute('interlaceThreadIndex', new THREE.Float32BufferAttribute(interlaceThreadIndex, 1));
    geometry.setAttribute('orbitalRingIndex', new THREE.Float32BufferAttribute(orbitalRingIndex, 1));
    geometry.setAttribute('tripleSpiralIndex', new THREE.Float32BufferAttribute(tripleSpiralIndex, 1));
    geometry.setAttribute('waveRingIndex', new THREE.Float32BufferAttribute(waveRingIndex, 1));
    geometry.setAttribute('prismNodeIndex', new THREE.Float32BufferAttribute(prismNodeIndex, 1));
    geometry.setAttribute('lightShaftIndex', new THREE.Float32BufferAttribute(lightShaftIndex, 1));
    geometry.setAttribute('energyMeshIndex', new THREE.Float32BufferAttribute(energyMeshIndex, 1));
    geometry.setAttribute('outerHaloIndex', new THREE.Float32BufferAttribute(outerHaloIndex, 1));
    geometry.setAttribute('glyphBandIndex', new THREE.Float32BufferAttribute(glyphBandIndex, 1));
    geometry.setAttribute('fogLayerIndex', new THREE.Float32BufferAttribute(fogLayerIndex, 1));
    geometry.setAttribute('lightRayIndex', new THREE.Float32BufferAttribute(lightRayIndex, 1));
    geometry.setAttribute('dustFieldIndex', new THREE.Float32BufferAttribute(dustFieldIndex, 1));
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
   * Update with ascension lattice state
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

