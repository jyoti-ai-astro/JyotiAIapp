/**
 * Ascension Lattice v2 Fragment Shader
 * 
 * Phase 2 — Section 61: ASCENSION LATTICE ENGINE v2
 * Ascension Lattice Engine v2 (E65)
 * 
 * 18-layer hyper-lattice ascension: Base Lattice Plane, Diamond Lattice Web, Hexa Nexus Rings, Ascension Riser Columns, Luminous Cross-Beams, Interlace Threads, Orbital Ascension Rings, Triple Spiral Matrix, Ascension Wave Rings, Prism Nodes, Vertical Light Shafts, Radiant Energy Mesh, Outer Lattice Halo, Ascension Glyph Band, Dimensional Fog Layer, Ascension Light Rays, Lattice Dust Field, Bloom Mask Layer
 */

export const ascensionLatticeFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBreathPhase;
uniform float uBreathStrength;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform float uBlessingWaveProgress;
uniform float uRotationSync;

varying vec2 vUv;
varying vec3 vPosition;
varying float vBaseLatticeIndex;
varying float vDiamondWebIndex;
varying float vHexaNexusIndex;
varying float vRiserColumnIndex;
varying float vCrossBeamIndex;
varying float vInterlaceThreadIndex;
varying float vOrbitalRingIndex;
varying float vTripleSpiralIndex;
varying float vWaveRingIndex;
varying float vPrismNodeIndex;
varying float vLightShaftIndex;
varying float vEnergyMeshIndex;
varying float vOuterHaloIndex;
varying float vGlyphBandIndex;
varying float vFogLayerIndex;
varying float vLightRayIndex;
varying float vDustFieldIndex;
varying float vBloomIndex;
varying float vRadialSegment;
varying float vConcentricRing;
varying float vDistance;
varying float vRadialDistance;
varying float vGradientProgress;
varying float vAngle;
varying float vRadius;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// SDF functions
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdDiamond(vec2 p, float r) {
  return abs(p.x) + abs(p.y) - r;
}

// ============================================
// LAYER A: BASE LATTICE PLANE
// ============================================
vec3 baseLatticePlane(vec2 uv) {
  if (vBaseLatticeIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 grid, radius 6.0
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Breath → pulsating lattice expansion (already in vertex)
  
  // High → shimmer noise
  float shimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Scroll → rotation acceleration (already in vertex)
  
  // Grid pattern
  float gridX = sin(vAngle * 64.0) * 0.5 + 0.5;
  float gridY = sin(vRadius * 64.0) * 0.5 + 0.5;
  float gridPattern = (gridX + gridY) * 0.5;
  
  // White → Gold → Violet gradient
  vec3 latticeColor;
  if (gradientT < 0.5) {
    latticeColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    latticeColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return latticeColor * gridPattern * (1.0 + shimmer) * 0.6;
}

// ============================================
// LAYER B: DIAMOND LATTICE WEB
// ============================================
vec3 diamondLatticeWeb(vec2 uv) {
  if (vDiamondWebIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8×8 interconnected diamond cells
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Diamond SDF
  float diamondSize = 0.5;
  float diamondDist = sdDiamond(p, diamondSize);
  float diamondMask = 1.0 - smoothstep(0.0, diamondSize * 0.1, diamondDist);
  
  // High → sparkle jitter
  float sparkle = fbm(uv * 15.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → crystalline flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  float gradientT = vGradientProgress;
  vec3 diamondColor;
  if (gradientT < 0.5) {
    diamondColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    diamondColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return diamondColor * diamondMask * (1.0 + sparkle + blessingFlash) * 0.7;
}

// ============================================
// LAYER C: HEXA NEXUS RINGS
// ============================================
vec3 hexaNexusRings(vec2 uv) {
  if (vHexaNexusIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3–5 hex rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring index
  
  // RotationSync → hex tilt (already in vertex)
  
  // Breath → radius modulation (already in vertex)
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  // Hex pattern
  float hexPattern = sin(vAngle * 6.0) * 0.5 + 0.5;
  
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    ringColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return ringColor * thicknessFade * hexPattern * 0.5;
}

// ============================================
// LAYER D: ASCENSION RISER COLUMNS
// ============================================
vec3 ascensionRiserColumns(vec2 uv) {
  if (vRiserColumnIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12–20 vertical columns
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along column
  
  // Scroll → upward movement (already in vertex)
  
  // Bass → vibration wobble (already in vertex)
  
  // Column width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 columnColor;
  if (gradientT < 0.5) {
    columnColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    columnColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return columnColor * widthFade * 0.6;
}

// ============================================
// LAYER E: LUMINOUS CROSS-BEAMS
// ============================================
vec3 luminousCrossBeams(vec2 uv) {
  if (vCrossBeamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 24–40 horizontal beams
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along beam
  
  // High → beam shimmer
  float beamShimmer = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.25;
  beamShimmer = smoothstep(0.7, 1.0, beamShimmer);
  
  // Breath → width modulation (already in vertex)
  
  // Beam width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 beamColor;
  if (gradientT < 0.5) {
    beamColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    beamColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return beamColor * widthFade * (1.0 + beamShimmer) * 0.5;
}

// ============================================
// LAYER F: INTERLACE THREADS
// ============================================
vec3 interlaceThreads(vec2 uv) {
  if (vInterlaceThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 30–50 threads weaving lattice
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along thread
  
  // Scroll → travel speed increase (already in vertex)
  
  // Thread width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 threadColor;
  if (gradientT < 0.5) {
    threadColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    threadColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return threadColor * widthFade * 0.4;
}

// ============================================
// LAYER G: ORBITAL ASCENSION RINGS
// ============================================
vec3 orbitalAscensionRings(vec2 uv) {
  if (vOrbitalRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2–4 rotating rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring index
  
  // RotationSync → synchronized tilt (already in vertex)
  
  // High → sparkle
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    ringColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return ringColor * thicknessFade * (1.0 + sparkle) * 0.5;
}

// ============================================
// LAYER H: TRIPLE SPIRAL MATRIX
// ============================================
vec3 tripleSpiralMatrix(vec2 uv) {
  if (vTripleSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 spirals intertwined
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along spiral
  
  // Scroll → spiral speed (already in vertex)
  
  // Breath → spiral thickness pulse
  float breathThickness = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // Spiral width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    spiralColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return spiralColor * widthFade * breathThickness * 0.5;
}

// ============================================
// LAYER I: ASCENSION WAVE RINGS
// ============================================
vec3 ascensionWaveRings(vec2 uv) {
  if (vWaveRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 expanding ripple rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on wave radius
  
  // Mid → turbulence jitter (already in vertex)
  
  // BlessingWave → highlight flare
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  // Wave pattern
  float wavePattern = sin(vRadius * 8.0 - uTime * 2.0) * 0.5 + 0.5;
  
  vec3 waveColor;
  if (gradientT < 0.5) {
    waveColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    waveColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return waveColor * thicknessFade * wavePattern * (1.0 + blessingFlash) * 0.5;
}

// ============================================
// LAYER J: PRISM NODES
// ============================================
vec3 prismNodes(vec2 uv) {
  if (vPrismNodeIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 60–120 glowing nodes
  float nodeRadius = 0.18;
  float nodeDist = sdCircle(p, nodeRadius);
  float nodeMask = 1.0 - smoothstep(0.0, nodeRadius * 2.0, nodeDist);
  
  // High → crystal sparkle
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Bass → node jitter (already in vertex)
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / nodeRadius;
  vec3 nodeColor;
  if (gradientT < 0.33) {
    nodeColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    nodeColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return nodeColor * nodeMask * (1.0 + sparkle) * 0.8;
}

// ============================================
// LAYER K: VERTICAL LIGHT SHAFTS
// ============================================
vec3 verticalLightShafts(vec2 uv) {
  if (vLightShaftIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8–14 shafts
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along shaft
  
  // Breath → beam strength
  float breathStrength = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // BlessingWave → white-violet flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 1.0;
  }
  
  // Shaft width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 shaftColor = mix(whiteColor, violetColor, gradientT);
  
  return shaftColor * widthFade * breathStrength * (1.0 + blessingFlash) * 0.6;
}

// ============================================
// LAYER L: RADIANT ENERGY MESH
// ============================================
vec3 radiantEnergyMesh(vec2 uv) {
  if (vEnergyMeshIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm field projected across lattice
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on energy density
  
  // Scroll → distortion drift (already in vertex)
  
  // fbm energy pattern
  float energyPattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  vec3 meshColor;
  if (gradientT < 0.5) {
    meshColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    meshColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return meshColor * energyPattern * 0.3;
}

// ============================================
// LAYER M: OUTER LATTICE HALO
// ============================================
vec3 outerLatticeHalo(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Large halo ring around lattice
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring thickness
  
  // RotationSync → tilt (already in vertex)
  
  // High → halo shimmer
  float haloShimmer = fbm(uv * 10.0 + uTime * 0.3) * uHigh * 0.25;
  haloShimmer = smoothstep(0.7, 1.0, haloShimmer);
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return haloColor * thicknessFade * (1.0 + haloShimmer) * 0.4;
}

// ============================================
// LAYER N: ASCENSION GLYPH BAND
// ============================================
vec3 ascensionGlyphBand(vec2 uv) {
  if (vGlyphBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 64–96 glyphs around perimeter
  float glyphRadius = 0.2;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // BlessingWave → glyph flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / glyphRadius;
  vec3 glyphColor;
  if (gradientT < 0.5) {
    glyphColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    glyphColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return glyphColor * glyphMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER O: DIMENSIONAL FOG LAYER
// ============================================
vec3 dimensionalFogLayer(vec2 uv) {
  if (vFogLayerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 fog grid
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on fog density
  
  // Breath → opacity pulse
  float breathOpacity = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // fbm fog pattern
  float fogPattern = fbm(uv * 3.0 + uTime * 0.15) * 0.5 + 0.5;
  
  vec3 fogColor = mix(whiteColor, violetColor, gradientT);
  
  return fogColor * fogPattern * breathOpacity * 0.2;
}

// ============================================
// LAYER P: ASCENSION LIGHT RAYS
// ============================================
vec3 ascensionLightRays(vec2 uv) {
  if (vLightRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 16–24 rays projecting outward
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along ray
  
  // Scroll → rotation acceleration (already in vertex)
  
  // Ray width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 rayColor;
  if (gradientT < 0.5) {
    rayColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    rayColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return rayColor * widthFade * 0.4;
}

// ============================================
// LAYER Q: LATTICE DUST FIELD
// ============================================
vec3 latticeDustField(vec2 uv) {
  if (vDustFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 300–450 particles
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle
  float sparkle = fbm(uv * 28.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / particleRadius;
  vec3 particleColor;
  if (gradientT < 0.33) {
    particleColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    particleColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return particleColor * particleMask * (1.0 + sparkle) * 0.7;
}

// ============================================
// LAYER R: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Strong bloom around lattice center
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 6.0, distFromCenter);
  
  // Intensifies with blessingWaveProgress
  float blessingIntensity = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingIntensity = uBlessingWaveProgress * 0.7;
  }
  
  bloomIntensity = min(bloomIntensity + blessingIntensity, 1.0);
  
  // Soft white-violet bloom color
  vec3 bloomColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.6, 1.0), 0.4);
  
  return bloomColor * bloomIntensity * 0.3;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Base Lattice Plane (base layer)
  vec3 layerA = baseLatticePlane(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Diamond Lattice Web (additive blending)
  vec3 layerB = diamondLatticeWeb(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Hexa Nexus Rings (additive blending)
  vec3 layerC = hexaNexusRings(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Ascension Riser Columns (additive blending)
  vec3 layerD = ascensionRiserColumns(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Luminous Cross-Beams (additive blending)
  vec3 layerE = luminousCrossBeams(uv);
  finalColor += layerE * 0.5;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Interlace Threads (additive blending)
  vec3 layerF = interlaceThreads(uv);
  finalColor += layerF * 0.4;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Orbital Ascension Rings (additive blending)
  vec3 layerG = orbitalAscensionRings(uv);
  finalColor += layerG * 0.5;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Triple Spiral Matrix (additive blending)
  vec3 layerH = tripleSpiralMatrix(uv);
  finalColor += layerH * 0.5;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Ascension Wave Rings (additive blending)
  vec3 layerI = ascensionWaveRings(uv);
  finalColor += layerI * 0.5;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Prism Nodes (additive blending)
  vec3 layerJ = prismNodes(uv);
  finalColor += layerJ * 0.7;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Vertical Light Shafts (additive blending)
  vec3 layerK = verticalLightShafts(uv);
  finalColor += layerK * 0.6;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Radiant Energy Mesh (additive blending)
  vec3 layerL = radiantEnergyMesh(uv);
  finalColor += layerL * 0.3;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Outer Lattice Halo (additive blending)
  vec3 layerM = outerLatticeHalo(uv);
  finalColor += layerM * 0.4;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Ascension Glyph Band (additive blending)
  vec3 layerN = ascensionGlyphBand(uv);
  finalColor += layerN * 0.7;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Dimensional Fog Layer (additive blending)
  vec3 layerO = dimensionalFogLayer(uv);
  finalColor += layerO * 0.2;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Ascension Light Rays (additive blending)
  vec3 layerP = ascensionLightRays(uv);
  finalColor += layerP * 0.4;
  bloomMask = max(bloomMask, length(layerP));
  
  // Layer Q: Lattice Dust Field (additive blending)
  vec3 layerQ = latticeDustField(uv);
  finalColor += layerQ * 0.6;
  bloomMask = max(bloomMask, length(layerQ));
  
  // Layer R: Bloom Mask Layer (additive blending)
  vec3 layerR = bloomMaskLayer(uv);
  finalColor += layerR * 0.5;
  bloomMask = max(bloomMask, length(layerR));
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.95);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

