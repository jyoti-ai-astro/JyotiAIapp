/**
 * Divine Alignment Grid Component
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Divine Alignment Grid Engine (E9)
 * 
 * Creates a divine alignment grid with 3 grid systems:
 * - Layer 1: Sacred Geometry Grid (Flower of Life lattice + triangle tessellation)
 * - Layer 2: Rotational Mandala Grid (16-seg rotational mandala)
 * - Layer 3: Radiant Guideline Grid (straight radial beams + concentric circles)
 * 
 * Features:
 * - Scroll-driven rotation of mandala layer
 * - Bass-driven pulse of grid luminance
 * - High-frequency shimmer on lattice intersections
 * - Subtle animated geometry distortion (FBM)
 * - Parallax for perspective depth
 * - Bloom mask for high-energy intersection points
 * - Smooth blending with all previous World layers
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gridVertexShader } from './shaders/grid-vertex';
import { gridFragmentShader } from './shaders/grid-fragment';
import { useGridUniforms } from './hooks/use-grid-uniforms';
import { useGridAudio } from './hooks/use-grid-audio';
import { useGridScroll } from './hooks/use-grid-scroll';

export interface DivineAlignmentGridProps {
  /** Intensity multiplier */
  intensity?: number;
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Mouse position for parallax */
  mouse?: { x: number; y: number };
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  
  /** Parallax strength */
  parallaxStrength?: number;
}

// Create grid shader material
function createGridMaterial(layerType: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1.0 },
      uParallaxStrength: { value: 1.0 },
      uLayerType: { value: layerType },
    },
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// Individual Grid Layer Component
const GridLayer: React.FC<{
  layerType: number;
  material: THREE.ShaderMaterial;
  props: DivineAlignmentGridProps;
}> = ({ layerType, material, props }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  // Use hooks
  const audioValues = useGridAudio({ audioReactive: props.audioReactive });
  const normalizedScroll = useGridScroll({ scroll: props.scroll });
  
  // Create geometry (plane for grid)
  const geometry = useMemo(() => {
    // Mobile fallback: reduce segments
    const isMobile = size.width < 800;
    const segments = isMobile ? 64 : 128;
    
    // Create plane geometry for grid
    // Different sizes per layer
    let width = 10.0;
    let height = 10.0;
    
    if (layerType < 0.5) {
      // Sacred Geometry - largest
      width = 10.0;
      height = 10.0;
    } else if (layerType < 1.5) {
      // Mandala - medium
      width = 8.0;
      height = 8.0;
    } else {
      // Radiant - largest for beams
      width = 12.0;
      height = 12.0;
    }
    
    return new THREE.PlaneGeometry(width, height, segments, segments);
  }, [layerType, size.width]);
  
  // Update uniforms using hook
  useGridUniforms(material, {
    mouse: props.mouse,
    scroll: normalizedScroll,
    intensity: props.intensity,
    parallaxStrength: props.parallaxStrength,
    layerType,
    audioReactive: {
      bass: audioValues.bass,
      mid: audioValues.mid,
      high: audioValues.high,
    },
  });
  
  // Layer-specific rotation (only mandala rotates)
  useFrame(() => {
    if (meshRef.current) {
      if (layerType < 1.5 && layerType >= 0.5) {
        // Mandala layer: scroll-driven rotation
        const rotationSpeed = props.scroll || 0;
        meshRef.current.rotation.z = rotationSpeed * Math.PI * 2.0;
      } else {
        // Other layers: very slow rotation
        meshRef.current.rotation.z += 0.00002;
      }
    }
  });
  
  // Layer-specific Z position
  let zPosition = -2.4;
  if (layerType < 0.5) {
    zPosition = -2.4;  // Sacred Geometry
  } else if (layerType < 1.5) {
    zPosition = -2.2;  // Mandala
  } else {
    zPosition = -2.0;  // Radiant
  }
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, zPosition]}
      rotation={[0, 0, 0]}
    />
  );
};

// Main Divine Alignment Grid Component
export const DivineAlignmentGrid: React.FC<DivineAlignmentGridProps> = ({
  intensity = 1.0,
  scroll = 0,
  mouse = { x: 0, y: 0 },
  audioReactive,
  parallaxStrength = 1.0,
}) => {
  // Create materials for each layer
  const sacredGeometryMaterial = useMemo(() => createGridMaterial(0), []);
  const mandalaMaterial = useMemo(() => createGridMaterial(1), []);
  const radiantMaterial = useMemo(() => createGridMaterial(2), []);
  
  const props = useMemo(() => ({
    intensity,
    scroll,
    mouse,
    audioReactive,
    parallaxStrength,
  }), [intensity, scroll, mouse, audioReactive, parallaxStrength]);
  
  return (
    <group>
      {/* Layer 1: Sacred Geometry Grid (Flower of Life + Triangles) */}
      <GridLayer
        layerType={0}
        material={sacredGeometryMaterial}
        props={props}
      />
      
      {/* Layer 2: Rotational Mandala Grid (16-seg Mandala) */}
      <GridLayer
        layerType={1}
        material={mandalaMaterial}
        props={props}
      />
      
      {/* Layer 3: Radiant Guideline Grid (Radial Beams + Concentric Circles) */}
      <GridLayer
        layerType={2}
        material={radiantMaterial}
        props={props}
      />
    </group>
  );
};

