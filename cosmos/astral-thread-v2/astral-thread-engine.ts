/**
 * Astral Thread v2 Engine
 * 
 * Phase 2 — Section 54: ASTRAL THREAD ENGINE v2
 * Astral Thread Engine v2 (E58)
 * 
 * Generate all 5 layers: primary astral beams, cross-lattice connectors, energy packets, ether strands, quantum dust nodes
 */

import * as THREE from 'three';
import { astralThreadVertexShader } from './shaders/astral-thread-vertex';
import { astralThreadFragmentShader } from './shaders/astral-thread-fragment';

export interface AstralThreadEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numBeams?: number;
  numLattice?: number;
  numPackets?: number;
  numStrands?: number;
  numDust?: number;
}

export interface BeamData {
  beamIndex: number;
  angle: number; // 0 to 2π
  baseRadius: number; // 2.0
  maxRadius: number; // 8.0
}

export interface LatticeData {
  latticeIndex: number;
  beam1Index: number;
  beam2Index: number;
}

export interface PacketData {
  packetIndex: number;
  beamIndex: number;
  baseT: number; // Base position along beam
}

export interface StrandData {
  strandIndex: number;
  baseX: number;
}

export class AstralThreadEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AstralThreadEngineConfig;
  
  private beams: BeamData[] = [];
  private lattice: LatticeData[] = [];
  private packets: PacketData[] = [];
  private strands: StrandData[] = [];
  
  private numBeams: number;
  private numLattice: number;
  private numPackets: number;
  private numStrands: number;
  private numDust: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AstralThreadEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numBeams: config.numBeams || 12,
      numLattice: config.numLattice || 40,
      numPackets: config.numPackets || 20,
      numStrands: config.numStrands || 60,
      numDust: config.numDust || 220,
    };
    
    this.numBeams = this.config.numBeams || 12;
    this.numLattice = this.config.numLattice || 40;
    this.numPackets = this.config.numPackets || 20;
    this.numStrands = this.config.numStrands || 60;
    this.numDust = this.config.numDust || 220;
    
    // Generate beams (6-12)
    this.generateBeams();
    
    // Generate lattice connectors (24-40)
    this.generateLattice();
    
    // Generate packets (12-20)
    this.generatePackets();
    
    // Generate strands (40-60)
    this.generateStrands();
    
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
      vertexShader: astralThreadVertexShader,
      fragmentShader: astralThreadFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate beam spline position (center → radial points)
   */
  private beamSplinePosition(t: number, beamIndex: number): THREE.Vector3 {
    const numBeams = this.numBeams;
    const angle = (beamIndex / numBeams) * Math.PI * 2.0;
    
    const baseRadius = 2.0;
    const maxRadius = 8.0;
    const radius = baseRadius + t * (maxRadius - baseRadius);
    
    // Curved hybrid spline (straight + curved)
    const curveAmount = Math.sin(t * Math.PI) * 0.3; // Slight curve
    const x = Math.cos(angle + curveAmount) * radius;
    const z = Math.sin(angle + curveAmount) * radius;
    const y = Math.sin(t * Math.PI * 2.0) * 0.2; // Vertical variation
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Generate beams (6-12)
   */
  private generateBeams(): void {
    this.beams = [];
    
    for (let i = 0; i < this.numBeams; i++) {
      const angle = (i / this.numBeams) * Math.PI * 2.0;
      this.beams.push({
        beamIndex: i,
        angle,
        baseRadius: 2.0,
        maxRadius: 8.0,
      });
    }
  }

  /**
   * Generate lattice connectors (24-40)
   */
  private generateLattice(): void {
    this.lattice = [];
    
    for (let i = 0; i < this.numLattice; i++) {
      const beam1Index = i % this.numBeams;
      const beam2Index = Math.floor((i * 1.618) % this.numBeams); // Golden ratio spacing
      this.lattice.push({
        latticeIndex: i,
        beam1Index,
        beam2Index,
      });
    }
  }

  /**
   * Generate packets (12-20)
   */
  private generatePackets(): void {
    this.packets = [];
    
    for (let i = 0; i < this.numPackets; i++) {
      const beamIndex = i % this.numBeams;
      const baseT = (i / this.numPackets) * 0.8 + 0.1; // 0.1 to 0.9
      this.packets.push({
        packetIndex: i,
        beamIndex,
        baseT,
      });
    }
  }

  /**
   * Generate strands (40-60)
   */
  private generateStrands(): void {
    this.strands = [];
    
    for (let i = 0; i < this.numStrands; i++) {
      const baseX = (i / this.numStrands) * 16.0 - 8.0; // -8 to 8
      this.strands.push({
        strandIndex: i,
        baseX,
      });
    }
  }

  /**
   * Create geometry with all 5 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const beamIndices: number[] = [];
    const latticeIndices: number[] = [];
    const packetIndices: number[] = [];
    const strandIndices: number[] = [];
    const dustIndices: number[] = [];
    const beamProgresses: number[] = [];
    const beamSegments: number[] = [];
    
    // ============================================
    // BEAMS (Layer A - 6-12 beams)
    // ============================================
    const beamWidth = 0.06; // Beam width (mobile: 0.04)
    const beamSegmentsPerBeam = 64;
    
    for (let beam = 0; beam < this.numBeams; beam++) {
      for (let i = 0; i < beamSegmentsPerBeam; i++) {
        const t = i / beamSegmentsPerBeam; // 0 to 1
        const tNext = (i + 1) / beamSegmentsPerBeam;
        
        const pos1 = this.beamSplinePosition(t, beam);
        const pos2 = this.beamSplinePosition(tNext, beam);
        
        // Create quad for beam segment
        const tangent = new THREE.Vector3().subVectors(pos2, pos1).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        
        // 4 vertices for quad
        const offset1 = normal.clone().multiplyScalar(-beamWidth * 0.5);
        const offset2 = normal.clone().multiplyScalar(beamWidth * 0.5);
        
        positions.push(
          pos1.x + offset1.x, pos1.y + offset1.y, pos1.z + offset1.z, // Bottom-left
          pos1.x + offset2.x, pos1.y + offset2.y, pos1.z + offset2.z, // Bottom-right
          pos2.x + offset1.x, pos2.y + offset1.y, pos2.z + offset1.z, // Top-left
          pos2.x + offset2.x, pos2.y + offset2.y, pos2.z + offset2.z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        beamIndices.push(beam, beam, beam, beam);
        latticeIndices.push(-1, -1, -1, -1);
        packetIndices.push(-1, -1, -1, -1);
        strandIndices.push(-1, -1, -1, -1);
        dustIndices.push(-1, -1, -1, -1);
        beamProgresses.push(t, t, tNext, tNext);
        beamSegments.push(i, i, i, i);
      }
    }
    
    // ============================================
    // LATTICE CONNECTORS (Layer B - 24-40)
    // ============================================
    const connectorWidth = 0.03;
    
    for (let i = 0; i < this.numLattice; i++) {
      const lattice = this.lattice[i];
      const pos1 = this.beamSplinePosition(0.5, lattice.beam1Index); // Midpoint
      const pos2 = this.beamSplinePosition(0.5, lattice.beam2Index); // Midpoint
      
      // Create quad for connector
      const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
      const normal = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
      
      const offset1 = normal.clone().multiplyScalar(-connectorWidth * 0.5);
      const offset2 = normal.clone().multiplyScalar(connectorWidth * 0.5);
      
      positions.push(
        pos1.x + offset1.x, pos1.y + offset1.y, pos1.z + offset1.z, // Bottom-left
        pos1.x + offset2.x, pos1.y + offset2.y, pos1.z + offset2.z, // Bottom-right
        pos2.x + offset1.x, pos2.y + offset1.y, pos2.z + offset1.z, // Top-left
        pos2.x + offset2.x, pos2.y + offset2.y, pos2.z + offset2.z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      beamIndices.push(-1, -1, -1, -1);
      latticeIndices.push(i, i, i, i);
      packetIndices.push(-1, -1, -1, -1);
      strandIndices.push(-1, -1, -1, -1);
      dustIndices.push(-1, -1, -1, -1);
      beamProgresses.push(0, 0, 1, 1);
      beamSegments.push(0, 0, 0, 0);
    }
    
    // ============================================
    // PACKETS (Layer C - 12-20)
    // ============================================
    const packetSize = 0.22;
    
    for (let i = 0; i < this.numPackets; i++) {
      const packet = this.packets[i];
      const position = this.beamSplinePosition(packet.baseT, packet.beamIndex);
      const x = position.x;
      const y = position.y;
      const z = position.z;
      
      // Create quad for each packet
      positions.push(
        x - packetSize, y - packetSize, z, // Bottom-left
        x + packetSize, y - packetSize, z, // Bottom-right
        x - packetSize, y + packetSize, z, // Top-left
        x + packetSize, y + packetSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      beamIndices.push(-1, -1, -1, -1);
      latticeIndices.push(-1, -1, -1, -1);
      packetIndices.push(i, i, i, i);
      strandIndices.push(-1, -1, -1, -1);
      dustIndices.push(-1, -1, -1, -1);
      beamProgresses.push(packet.baseT, packet.baseT, packet.baseT, packet.baseT);
      beamSegments.push(0, 0, 0, 0);
    }
    
    // ============================================
    // STRANDS (Layer D - 40-60)
    // ============================================
    const strandLength = 1.5;
    
    for (let i = 0; i < this.numStrands; i++) {
      const strand = this.strands[i];
      const baseX = strand.baseX;
      const baseZ = -6.4;
      
      // Create quad for strand (vertical)
      positions.push(
        baseX - 0.02, -strandLength * 0.5, baseZ, // Bottom-left
        baseX + 0.02, -strandLength * 0.5, baseZ, // Bottom-right
        baseX - 0.02, strandLength * 0.5, baseZ, // Top-left
        baseX + 0.02, strandLength * 0.5, baseZ  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      beamIndices.push(-1, -1, -1, -1);
      latticeIndices.push(-1, -1, -1, -1);
      packetIndices.push(-1, -1, -1, -1);
      strandIndices.push(i, i, i, i);
      dustIndices.push(-1, -1, -1, -1);
      beamProgresses.push(0, 0, 1, 1);
      beamSegments.push(0, 0, 0, 0);
    }
    
    // ============================================
    // DUST NODES (Layer E - 180-260)
    // ============================================
    const dustRadius = 0.0125;
    
    for (let i = 0; i < this.numDust; i++) {
      // Distribute around beam intersections
      const angle = (i / this.numDust) * Math.PI * 2.0 * 3.0; // 3 full rotations
      const baseRadius = 2.0 + (i / this.numDust) * 6.0; // 2.0 to 8.0
      const radius = baseRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2.0) * 0.12; // Vertical variation
      
      // Create quad for each dust particle
      positions.push(
        x - dustRadius, y - dustRadius, z - 6.4, // Bottom-left
        x + dustRadius, y - dustRadius, z - 6.4, // Bottom-right
        x - dustRadius, y + dustRadius, z - 6.4, // Top-left
        x + dustRadius, y + dustRadius, z - 6.4  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      beamIndices.push(-1, -1, -1, -1);
      latticeIndices.push(-1, -1, -1, -1);
      packetIndices.push(-1, -1, -1, -1);
      strandIndices.push(-1, -1, -1, -1);
      dustIndices.push(i, i, i, i);
      beamProgresses.push(0, 0, 0, 0);
      beamSegments.push(0, 0, 0, 0);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('beamIndex', new THREE.Float32BufferAttribute(beamIndices, 1));
    geometry.setAttribute('latticeIndex', new THREE.Float32BufferAttribute(latticeIndices, 1));
    geometry.setAttribute('packetIndex', new THREE.Float32BufferAttribute(packetIndices, 1));
    geometry.setAttribute('strandIndex', new THREE.Float32BufferAttribute(strandIndices, 1));
    geometry.setAttribute('dustIndex', new THREE.Float32BufferAttribute(dustIndices, 1));
    geometry.setAttribute('beamProgress', new THREE.Float32BufferAttribute(beamProgresses, 1));
    geometry.setAttribute('beamSegment', new THREE.Float32BufferAttribute(beamSegments, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Beams (quads) - 6-12 beams
    for (let beam = 0; beam < this.numBeams; beam++) {
      for (let i = 0; i < beamSegmentsPerBeam; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Lattice connectors (quads)
    for (let i = 0; i < this.numLattice; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Packets (quads)
    for (let i = 0; i < this.numPackets; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Strands (quads)
    for (let i = 0; i < this.numStrands; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Dust nodes (quads)
    for (let i = 0; i < this.numDust; i++) {
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
   * Update with astral thread state
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

