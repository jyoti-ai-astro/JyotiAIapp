/**
 * Celestial Gate v2 Fragment Shader
 * 
 * Phase 2 — Section 62: CELESTIAL GATE ENGINE v2
 * Celestial Gate Engine v2 (E66)
 * 
 * 20-layer cosmic gate: Base Gate Disc, Twin Gate Pillars, Triple Arch Halo, Celestial Spiral Ribbons, Star Glyph Band, Ascension Rings, Orbital Star Runners, Cross-Dimension Threads, Stellar Flame Shell, Gate Light Shafts, Star Dust Spiral, Starfall Rays, Celestial Fog Layer, Outer Halo Crown, Gate Signature Symbols, Cosmic Lattice Field, Energy Thread Matrix, Ascension Spiral, Celestial Particle Field, Bloom Mask Layer
 */

export const celestialGateFragmentShader = `
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
varying float vBaseGateDiscIndex;
varying float vTwinPillarIndex;
varying float vTripleArchIndex;
varying float vSpiralRibbonIndex;
varying float vStarGlyphIndex;
varying float vAscensionRingIndex;
varying float vOrbitalRunnerIndex;
varying float vCrossThreadIndex;
varying float vFlameShellIndex;
varying float vLightShaftIndex;
varying float vStarDustIndex;
varying float vStarfallRayIndex;
varying float vFogLayerIndex;
varying float vOuterHaloIndex;
varying float vSignatureSymbolIndex;
varying float vLatticeFieldIndex;
varying float vEnergyThreadIndex;
varying float vAscensionSpiralIndex;
varying float vParticleFieldIndex;
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

// ============================================
// LAYER A: BASE GATE DISC
// ============================================
vec3 baseGateDisc(vec2 uv) {
  if (vBaseGateDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64 radial × 32 concentric grid
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Scroll → rotation + expansion (already in vertex)
  // Breath → pulsation (already in vertex)
  
  // High → shimmer
  float shimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Grid pattern
  float gridX = sin(vAngle * 64.0) * 0.5 + 0.5;
  float gridY = sin(vRadius * 32.0) * 0.5 + 0.5;
  float gridPattern = (gridX + gridY) * 0.5;
  
  vec3 discColor;
  if (gradientT < 0.5) {
    discColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    discColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return discColor * gridPattern * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: TWIN GATE PILLARS
// ============================================
vec3 twinGatePillars(vec2 uv) {
  if (vTwinPillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2 vertical arc pillars
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along pillar
  
  // Bass → vibration wobble (already in vertex)
  
  // Pillar width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 pillarColor;
  if (gradientT < 0.5) {
    pillarColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    pillarColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return pillarColor * widthFade * 0.6;
}

// ============================================
// LAYER C: TRIPLE ARCH HALO
// ============================================
vec3 tripleArchHalo(vec2 uv) {
  if (vTripleArchIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 rotating arches
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on arch index
  
  // RotationSync → tilt + sync (already in vertex)
  
  // Arch thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 archColor;
  if (gradientT < 0.5) {
    archColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    archColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return archColor * thicknessFade * 0.5;
}

// ============================================
// LAYER D: CELESTIAL SPIRAL RIBBONS
// ============================================
vec3 celestialSpiralRibbons(vec2 uv) {
  if (vSpiralRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3–5 ribbons
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along ribbon
  
  // Scroll → ribbon speed (already in vertex)
  
  // Ribbon width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 ribbonColor;
  if (gradientT < 0.5) {
    ribbonColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    ribbonColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return ribbonColor * widthFade * 0.5;
}

// ============================================
// LAYER E: STAR GLYPH BAND
// ============================================
vec3 starGlyphBand(vec2 uv) {
  if (vStarGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 72–108 glyphs around perimeter
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
// LAYER F: ASCENSION RINGS
// ============================================
vec3 ascensionRings(vec2 uv) {
  if (vAscensionRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 expanding rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring index
  
  // Breath → ring radius pulse (already in vertex)
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    ringColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return ringColor * thicknessFade * 0.5;
}

// ============================================
// LAYER G: ORBITAL STAR RUNNERS
// ============================================
vec3 orbitalStarRunners(vec2 uv) {
  if (vOrbitalRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 6–12 fast runners
  float runnerRadius = 0.15;
  float runnerDist = sdCircle(p, runnerRadius);
  float runnerMask = 1.0 - smoothstep(0.0, runnerRadius * 2.0, runnerDist);
  
  // High → sparkle
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / runnerRadius;
  vec3 runnerColor;
  if (gradientT < 0.33) {
    runnerColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    runnerColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return runnerColor * runnerMask * (1.0 + sparkle) * 0.8;
}

// ============================================
// LAYER H: CROSS-DIMENSION THREADS
// ============================================
vec3 crossDimensionThreads(vec2 uv) {
  if (vCrossThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 24–40 threads
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along thread
  
  // Scroll → velocity (already in vertex)
  
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
// LAYER I: STELLAR FLAME SHELL
// ============================================
vec3 stellarFlameShell(vec2 uv) {
  if (vFlameShellIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm flame pattern
  // Color: White → Orange → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 orangeColor = vec3(1.0, 0.6, 0.2);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on flame density
  
  // Breath → flame height pulse (already in vertex)
  
  // fbm flame pattern
  float flamePattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  vec3 flameColor;
  if (gradientT < 0.5) {
    flameColor = mix(whiteColor, orangeColor, gradientT * 2.0);
  } else {
    flameColor = mix(orangeColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return flameColor * flamePattern * 0.3;
}

// ============================================
// LAYER J: GATE LIGHT SHAFTS
// ============================================
vec3 gateLightShafts(vec2 uv) {
  if (vLightShaftIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8–14 shafts
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along shaft
  
  // BlessingWave → flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 1.0;
  }
  
  // Shaft width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 shaftColor = mix(whiteColor, violetColor, gradientT);
  
  return shaftColor * widthFade * (1.0 + blessingFlash) * 0.6;
}

// ============================================
// LAYER K: STAR DUST SPIRAL
// ============================================
vec3 starDustSpiral(vec2 uv) {
  if (vStarDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 120–200 particles
  float particleRadius = 0.01;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
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
  
  return particleColor * particleMask * 0.7;
}

// ============================================
// LAYER L: STARFALL RAYS
// ============================================
vec3 starfallRays(vec2 uv) {
  if (vStarfallRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12–20 rays
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along ray
  
  // Scroll → rotation accel (already in vertex)
  
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
// LAYER M: CELESTIAL FOG LAYER
// ============================================
vec3 celestialFogLayer(vec2 uv) {
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
// LAYER N: OUTER HALO CROWN
// ============================================
vec3 outerHaloCrown(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Large rotating halo
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring thickness
  
  // RotationSync → tilt (already in vertex)
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return haloColor * thicknessFade * 0.4;
}

// ============================================
// LAYER O: GATE SIGNATURE SYMBOLS
// ============================================
vec3 gateSignatureSymbols(vec2 uv) {
  if (vSignatureSymbolIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 12–20 large symbols
  float symbolRadius = 0.4;
  float symbolDist = sdCircle(p, symbolRadius);
  float symbolMask = 1.0 - smoothstep(0.0, symbolRadius * 2.0, symbolDist);
  
  // High → shimmer
  float shimmer = fbm(uv * 15.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / symbolRadius;
  vec3 symbolColor;
  if (gradientT < 0.5) {
    symbolColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    symbolColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return symbolColor * symbolMask * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER P: COSMIC LATTICE FIELD
// ============================================
vec3 cosmicLatticeField(vec2 uv) {
  if (vLatticeFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm lattice distortion
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on lattice density
  
  // Scroll → drift (already in vertex)
  
  // fbm lattice pattern
  float latticePattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  vec3 latticeColor;
  if (gradientT < 0.5) {
    latticeColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    latticeColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return latticeColor * latticePattern * 0.3;
}

// ============================================
// LAYER Q: ENERGY THREAD MATRIX
// ============================================
vec3 energyThreadMatrix(vec2 uv) {
  if (vEnergyThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20–40 matrix beams
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along thread
  
  // Breath → thickness pulse
  float breathThickness = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // Thread width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 threadColor;
  if (gradientT < 0.5) {
    threadColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    threadColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return threadColor * widthFade * breathThickness * 0.5;
}

// ============================================
// LAYER R: ASCENSION SPIRAL
// ============================================
vec3 ascensionSpiral(vec2 uv) {
  if (vAscensionSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Giant spiral reaching upward
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along spiral
  
  // Scroll → acceleration (already in vertex)
  
  // Spiral width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    spiralColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return spiralColor * widthFade * 0.5;
}

// ============================================
// LAYER S: CELESTIAL PARTICLE FIELD
// ============================================
vec3 celestialParticleField(vec2 uv) {
  if (vParticleFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200–350 particles
  float particleRadius = 0.011;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass + High → sparkle + jitter
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
// LAYER T: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Strong bloom for E12
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 6.5, distFromCenter);
  
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
  
  // Layer A: Base Gate Disc (base layer)
  vec3 layerA = baseGateDisc(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Gate Pillars (additive blending)
  vec3 layerB = twinGatePillars(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Triple Arch Halo (additive blending)
  vec3 layerC = tripleArchHalo(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Celestial Spiral Ribbons (additive blending)
  vec3 layerD = celestialSpiralRibbons(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Star Glyph Band (additive blending)
  vec3 layerE = starGlyphBand(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Ascension Rings (additive blending)
  vec3 layerF = ascensionRings(uv);
  finalColor += layerF * 0.5;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Orbital Star Runners (additive blending)
  vec3 layerG = orbitalStarRunners(uv);
  finalColor += layerG * 0.7;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Cross-Dimension Threads (additive blending)
  vec3 layerH = crossDimensionThreads(uv);
  finalColor += layerH * 0.4;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Stellar Flame Shell (additive blending)
  vec3 layerI = stellarFlameShell(uv);
  finalColor += layerI * 0.3;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Gate Light Shafts (additive blending)
  vec3 layerJ = gateLightShafts(uv);
  finalColor += layerJ * 0.6;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Star Dust Spiral (additive blending)
  vec3 layerK = starDustSpiral(uv);
  finalColor += layerK * 0.6;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Starfall Rays (additive blending)
  vec3 layerL = starfallRays(uv);
  finalColor += layerL * 0.4;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Celestial Fog Layer (additive blending)
  vec3 layerM = celestialFogLayer(uv);
  finalColor += layerM * 0.2;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Outer Halo Crown (additive blending)
  vec3 layerN = outerHaloCrown(uv);
  finalColor += layerN * 0.4;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Gate Signature Symbols (additive blending)
  vec3 layerO = gateSignatureSymbols(uv);
  finalColor += layerO * 0.7;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Cosmic Lattice Field (additive blending)
  vec3 layerP = cosmicLatticeField(uv);
  finalColor += layerP * 0.3;
  bloomMask = max(bloomMask, length(layerP));
  
  // Layer Q: Energy Thread Matrix (additive blending)
  vec3 layerQ = energyThreadMatrix(uv);
  finalColor += layerQ * 0.5;
  bloomMask = max(bloomMask, length(layerQ));
  
  // Layer R: Ascension Spiral (additive blending)
  vec3 layerR = ascensionSpiral(uv);
  finalColor += layerR * 0.5;
  bloomMask = max(bloomMask, length(layerR));
  
  // Layer S: Celestial Particle Field (additive blending)
  vec3 layerS = celestialParticleField(uv);
  finalColor += layerS * 0.6;
  bloomMask = max(bloomMask, length(layerS));
  
  // Layer T: Bloom Mask Layer (additive blending)
  vec3 layerT = bloomMaskLayer(uv);
  finalColor += layerT * 0.5;
  bloomMask = max(bloomMask, length(layerT));
  
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

