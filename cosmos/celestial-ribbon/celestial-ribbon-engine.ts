/**
 * Celestial Ribbon Engine
 * 
 * Phase 2 — Section 38: CELESTIAL RIBBON ENGINE
 * Celestial Ribbon Engine (E42)
 * 
 * Generate bezier ribbons, spiral ribbons, traveling particles, manage uniforms
 */

import * as THREE from 'three';
import { ribbonVertexShader } from './shaders/ribbon-vertex';
import { ribbonFragmentShader } from './shaders/ribbon-fragment';

export interface CelestialRibbonEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numRibbons?: number;
  numParticles?: number;
  pointsPerRibbon?: number;
}

export interface RibbonData {
  ribbonIndex: number;
  controlPoints: [[number, number], [number, number], [number, number], [number, number]];
  thickness: number;
  points: number;
}

export interface SpiralData {
  spiralIndex: number;
  phase: number;
}

export interface ParticleData {
  particleIndex: number;
  linkedRibbon: number;
  travelSpeed: number;
}

export class CelestialRibbonEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialRibbonEngineConfig;
  
  private ribbons: RibbonData[] = [];
  private spirals: SpiralData[] = [];
  private particles: ParticleData[] = [];
  
  private numRibbons: number;
  private numParticles: number;
  private pointsPerRibbon: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialRibbonEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numRibbons: config.numRibbons || 4,
      numParticles: config.numParticles || 60,
      pointsPerRibbon: config.pointsPerRibbon || 24,
    };
    
    this.numRibbons = this.config.numRibbons || 4;
    this.numParticles = this.config.numParticles || 60;
    this.pointsPerRibbon = this.config.pointsPerRibbon || 24;
    
    // Generate bezier ribbons
    this.generateRibbons();
    
    // Generate spiral ribbons
    this.generateSpirals();
    
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
      vertexShader: ribbonVertexShader,
      fragmentShader: ribbonFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate bezier ribbons (3-5)
   */
  private generateRibbons(): void {
    this.ribbons = [];
    
    for (let i = 0; i < this.numRibbons; i++) {
      const ribbonOffset = i * 0.3;
      const controlPoints: [vec2, vec2, vec2, vec2] = [
        [-0.8, -0.5 + ribbonOffset],
        [-0.2, 0.0 + ribbonOffset],
        [0.2, 0.0 + ribbonOffset],
        [0.8, -0.5 + ribbonOffset],
      ];
      
      this.ribbons.push({
        ribbonIndex: i,
        controlPoints,
        thickness: 0.032, // 0.025-0.04 range
        points: this.pointsPerRibbon,
      });
    }
  }

  /**
   * Generate spiral ribbons (2)
   */
  private generateSpirals(): void {
    this.spirals = [];
    
    for (let i = 0; i < 2; i++) {
      this.spirals.push({
        spiralIndex: i,
        phase: i * Math.PI, // 180° phase difference
      });
    }
  }

  /**
   * Generate particles (40-80)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const linkedRibbon = i % this.numRibbons;
      const travelSpeed = 0.3 + (i % 3) * 0.1; // Varying speeds
      
      this.particles.push({
        particleIndex: i,
        linkedRibbon,
        travelSpeed,
      });
    }
  }

  /**
   * Evaluate bezier curve
   */
  private bezier(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], t: number): [number, number] {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1.0 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return [
      mt3 * p0[0] + 3.0 * mt2 * t * p1[0] + 3.0 * mt * t2 * p2[0] + t3 * p3[0],
      mt3 * p0[1] + 3.0 * mt2 * t * p1[1] + 3.0 * mt * t2 * p2[1] + t3 * p3[1],
    ];
  }

  /**
   * Create geometry with ribbons, spirals, and particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const ribbonIndices: number[] = [];
    const spiralIndices: number[] = [];
    const particleIndices: number[] = [];
    
    // ============================================
    // RIBBONS (Layer A)
    // ============================================
    const ribbonThickness = 0.032;
    
    for (let i = 0; i < this.numRibbons; i++) {
      const ribbon = this.ribbons[i];
      
      for (let j = 0; j < ribbon.points; j++) {
        const t = j / ribbon.points;
        const [p0, p1, p2, p3] = ribbon.controlPoints;
        const [x, y] = this.bezier(p0, p1, p2, p3, t);
        const z = -5.0;
        
        // Create quad for ribbon segment
        positions.push(
          x - ribbonThickness, y - ribbonThickness, z, // Bottom-left
          x + ribbonThickness, y - ribbonThickness, z, // Bottom-right
          x - ribbonThickness, y + ribbonThickness, z, // Top-left
          x + ribbonThickness, y + ribbonThickness, z  // Top-right
        );
        
        // UVs (x = progress along ribbon, y = thickness)
        uvs.push(t, 0, t, 0, t, 1, t, 1);
        
        // Indices
        ribbonIndices.push(i, i, i, i);
        spiralIndices.push(-1, -1, -1, -1);
        particleIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // SPIRAL RIBBONS (Layer B)
    // ============================================
    const spiralThickness = 0.02;
    const spiralPoints = 48;
    
    for (let i = 0; i < 2; i++) {
      const spiral = this.spirals[i];
      
      for (let j = 0; j < spiralPoints; j++) {
        const t = j / spiralPoints;
        const spiralAngle = t * Math.PI * 4.0 + spiral.phase; // 2 full rotations
        const spiralRadius = 0.4 + t * 0.3;
        const spiralHeight = (t - 0.5) * 0.6;
        
        const x = Math.cos(spiralAngle) * spiralRadius;
        const y = Math.sin(spiralAngle) * spiralRadius + spiralHeight;
        const z = -5.0;
        
        // Create quad for spiral segment
        positions.push(
          x - spiralThickness, y - spiralThickness, z, // Bottom-left
          x + spiralThickness, y - spiralThickness, z, // Bottom-right
          x - spiralThickness, y + spiralThickness, z, // Top-left
          x + spiralThickness, y + spiralThickness, z  // Top-right
        );
        
        // UVs
        uvs.push(t, 0, t, 0, t, 1, t, 1);
        
        // Indices
        ribbonIndices.push(-1, -1, -1, -1);
        spiralIndices.push(i, i, i, i);
        particleIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // PARTICLES (Layer C)
    // ============================================
    const particleSize = 0.015;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      const ribbon = this.ribbons[particle.linkedRibbon];
      
      // Initial position along ribbon (will be animated in shader)
      const t = (i / this.numParticles) * 0.5; // Spread particles
      const [p0, p1, p2, p3] = ribbon.controlPoints;
      const [x, y] = this.bezier(p0, p1, p2, p3, t);
      const z = -5.0;
      
      // Create quad for each particle
      positions.push(
        x - particleSize, y - particleSize, z, // Bottom-left
        x + particleSize, y - particleSize, z, // Bottom-right
        x - particleSize, y + particleSize, z, // Top-left
        x + particleSize, y + particleSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      ribbonIndices.push(-1, -1, -1, -1);
      spiralIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('ribbonIndex', new THREE.Float32BufferAttribute(ribbonIndices, 1));
    geometry.setAttribute('spiralIndex', new THREE.Float32BufferAttribute(spiralIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Ribbons (quads)
    for (let i = 0; i < this.numRibbons; i++) {
      for (let j = 0; j < this.ribbons[i].points; j++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Spiral ribbons (quads)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < spiralPoints; j++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
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
   * Update with celestial ribbon state
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

