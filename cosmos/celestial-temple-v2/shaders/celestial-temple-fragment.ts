/**
 * Celestial Temple v2 Fragment Shader
 * 
 * Phase 2 — Section 63: CELESTIAL TEMPLE ENGINE v2
 * Celestial Temple Engine v2 (E67)
 * 
 * 22-layer divine temple portal: Temple Base Platform, Twin Celestial Staircases, Temple Gate Pillars, Triple Arch Gate, Divine Spiral Halo, Temple Glyph Band, Ascension Columns, Cross-Dimensional Bridges, Orbital Runner Circles, Temple Flame Shell, Celestial Fog Plane, Temple Light Shafts, Energy Spiral Threads, Divine Particle Field, Ascension Rays, Outer Halo Crown, Inner Temple Core, Celestial Lattice Shell, Temple Stair Runners, Radiant Mesh Field, Temple Aura, Ascension Spiral Aura, Bloom Mask Layer
 */

export const celestialTempleFragmentShader = `
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
varying float vBasePlatformIndex;
varying float vTwinStaircaseIndex;
varying float vGatePillarIndex;
varying float vTripleArchIndex;
varying float vSpiralHaloIndex;
varying float vGlyphBandIndex;
varying float vAscensionColumnIndex;
varying float vCrossBridgeIndex;
varying float vOrbitalRunnerIndex;
varying float vFlameShellIndex;
varying float vFogPlaneIndex;
varying float vLightShaftIndex;
varying float vEnergySpiralIndex;
varying float vParticleFieldIndex;
varying float vAscensionRayIndex;
varying float vOuterHaloIndex;
varying float vInnerCoreIndex;
varying float vLatticeShellIndex;
varying float vStairRunnerIndex;
varying float vMeshFieldIndex;
varying float vTempleAuraIndex;
varying float vSpiralAuraIndex;
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
// LAYER A: TEMPLE BASE PLATFORM
// ============================================
vec3 templeBasePlatform(vec2 uv) {
  if (vBasePlatformIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 grid, radius 6.0
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Scroll → rotation accel (already in vertex)
  // Breath → pulsation (already in vertex)
  
  // Grid pattern
  float gridX = sin(vAngle * 64.0) * 0.5 + 0.5;
  float gridY = sin(vRadius * 64.0) * 0.5 + 0.5;
  float gridPattern = (gridX + gridY) * 0.5;
  
  vec3 platformColor;
  if (gradientT < 0.5) {
    platformColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    platformColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return platformColor * gridPattern * 0.7;
}

// ============================================
// LAYER B: TWIN CELESTIAL STAIRCASES
// ============================================
vec3 twinCelestialStaircases(vec2 uv) {
  if (vTwinStaircaseIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2 spiral staircases rising upward
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along staircase
  
  // Scroll → climb motion (already in vertex)
  
  // Staircase width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 stairColor;
  if (gradientT < 0.5) {
    stairColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    stairColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return stairColor * widthFade * 0.6;
}

// ============================================
// LAYER C: TEMPLE GATE PILLARS
// ============================================
vec3 templeGatePillars(vec2 uv) {
  if (vGatePillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 pillars
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
// LAYER D: TRIPLE ARCH GATE
// ============================================
vec3 tripleArchGate(vec2 uv) {
  if (vTripleArchIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 arches with rotation sync tilt
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on arch index
  
  // RotationSync → tilt (already in vertex)
  
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
// LAYER E: DIVINE SPIRAL HALO
// ============================================
vec3 divineSpiralHalo(vec2 uv) {
  if (vSpiralHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2–3 rotating spiral rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on halo index
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return haloColor * thicknessFade * 0.5;
}

// ============================================
// LAYER F: TEMPLE GLYPH BAND
// ============================================
vec3 templeGlyphBand(vec2 uv) {
  if (vGlyphBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 90–120 glyphs around perimeter
  float glyphRadius = 0.22;
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
// LAYER G: ASCENSION COLUMNS
// ============================================
vec3 ascensionColumns(vec2 uv) {
  if (vAscensionColumnIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–10 columns with height swell
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along column
  
  // Height swell (already in vertex)
  
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
// LAYER H: CROSS-DIMENSIONAL BRIDGES
// ============================================
vec3 crossDimensionalBridges(vec2 uv) {
  if (vCrossBridgeIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20–40 beams linking pillars
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along bridge
  
  // Bridge width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 bridgeColor;
  if (gradientT < 0.5) {
    bridgeColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    bridgeColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return bridgeColor * widthFade * 0.4;
}

// ============================================
// LAYER I: ORBITAL RUNNER CIRCLES
// ============================================
vec3 orbitalRunnerCircles(vec2 uv) {
  if (vOrbitalRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2–4 orbit rings with high sparkle
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring index
  
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
// LAYER J: TEMPLE FLAME SHELL
// ============================================
vec3 templeFlameShell(vec2 uv) {
  if (vFlameShellIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm flame pattern around gate
  // Color: White → Orange → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 orangeColor = vec3(1.0, 0.6, 0.2);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on flame density
  
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
// LAYER K: CELESTIAL FOG PLANE
// ============================================
vec3 celestialFogPlane(vec2 uv) {
  if (vFogPlaneIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 fog grid, breath pulse
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on fog density
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // fbm fog pattern
  float fogPattern = fbm(uv * 3.0 + uTime * 0.15) * 0.5 + 0.5;
  
  vec3 fogColor = mix(whiteColor, violetColor, gradientT);
  
  return fogColor * fogPattern * breathPulse * 0.2;
}

// ============================================
// LAYER L: TEMPLE LIGHT SHAFTS
// ============================================
vec3 templeLightShafts(vec2 uv) {
  if (vLightShaftIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8–12 rising vertical shafts
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along shaft
  
  // Shaft width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 shaftColor = mix(whiteColor, violetColor, gradientT);
  
  return shaftColor * widthFade * 0.6;
}

// ============================================
// LAYER M: ENERGY SPIRAL THREADS
// ============================================
vec3 energySpiralThreads(vec2 uv) {
  if (vEnergySpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8–16 spiral lines
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along spiral
  
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
// LAYER N: DIVINE PARTICLE FIELD
// ============================================
vec3 divineParticleField(vec2 uv) {
  if (vParticleFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 250–400 particles
  float particleRadius = 0.01;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
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
// LAYER O: ASCENSION RAYS
// ============================================
vec3 ascensionRays(vec2 uv) {
  if (vAscensionRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12–20 long radial rays
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along ray
  
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
// LAYER P: OUTER HALO CROWN
// ============================================
vec3 outerHaloCrown(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Large halo rotating with rotationSync
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring thickness
  
  // RotationSync → rotation (already in vertex)
  
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
// LAYER Q: INNER TEMPLE CORE
// ============================================
vec3 innerTempleCore(vec2 uv) {
  if (vInnerCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  // White-gold pulsing core
  // Color: White → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Breath → pulse (already in vertex)
  
  // Core intensity
  float coreIntensity = 1.0 - smoothstep(0.0, 2.0, vRadius);
  
  vec3 coreColor = mix(whiteColor, goldColor, gradientT);
  
  return coreColor * coreIntensity * 0.8;
}

// ============================================
// LAYER R: CELESTIAL LATTICE SHELL
// ============================================
vec3 celestialLatticeShell(vec2 uv) {
  if (vLatticeShellIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm lattice with drift
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
// LAYER S: TEMPLE STAIR RUNNERS
// ============================================
vec3 templeStairRunners(vec2 uv) {
  if (vStairRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 fast streaks moving on stairs
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along runner
  
  // Fast movement (already in vertex)
  
  // Runner width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 runnerColor;
  if (gradientT < 0.5) {
    runnerColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    runnerColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return runnerColor * widthFade * 0.5;
}

// ============================================
// LAYER T: RADIANT MESH FIELD
// ============================================
vec3 radiantMeshField(vec2 uv) {
  if (vMeshFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 grid with shimmer
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on grid pattern
  
  // High → shimmer
  float shimmer = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Grid pattern
  float gridPattern = vGradientProgress;
  
  vec3 meshColor;
  if (gradientT < 0.5) {
    meshColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    meshColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return meshColor * gridPattern * (1.0 + shimmer) * 0.3;
}

// ============================================
// LAYER U: TEMPLE AURA
// ============================================
vec3 templeAura(vec2 uv) {
  if (vTempleAuraIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Breath → opacity pulse
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // Aura fade
  float auraFade = 1.0 - smoothstep(0.0, 6.5, vRadius);
  
  vec3 auraColor = mix(whiteColor, violetColor, gradientT);
  
  return auraColor * auraFade * breathPulse * 0.2;
}

// ============================================
// LAYER V: ASCENSION SPIRAL AURA
// ============================================
vec3 ascensionSpiralAura(vec2 uv) {
  if (vSpiralAuraIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Rotational aura around core
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along spiral
  
  // Spiral width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    spiralColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return spiralColor * widthFade * 0.4;
}

// ============================================
// LAYER W: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Required for E12 bloom
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
  
  // Layer A: Temple Base Platform (base layer)
  vec3 layerA = templeBasePlatform(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Celestial Staircases (additive blending)
  vec3 layerB = twinCelestialStaircases(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Temple Gate Pillars (additive blending)
  vec3 layerC = templeGatePillars(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Triple Arch Gate (additive blending)
  vec3 layerD = tripleArchGate(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Divine Spiral Halo (additive blending)
  vec3 layerE = divineSpiralHalo(uv);
  finalColor += layerE * 0.5;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Temple Glyph Band (additive blending)
  vec3 layerF = templeGlyphBand(uv);
  finalColor += layerF * 0.7;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Ascension Columns (additive blending)
  vec3 layerG = ascensionColumns(uv);
  finalColor += layerG * 0.5;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Cross-Dimensional Bridges (additive blending)
  vec3 layerH = crossDimensionalBridges(uv);
  finalColor += layerH * 0.4;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Orbital Runner Circles (additive blending)
  vec3 layerI = orbitalRunnerCircles(uv);
  finalColor += layerI * 0.5;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Temple Flame Shell (additive blending)
  vec3 layerJ = templeFlameShell(uv);
  finalColor += layerJ * 0.3;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Celestial Fog Plane (additive blending)
  vec3 layerK = celestialFogPlane(uv);
  finalColor += layerK * 0.2;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Temple Light Shafts (additive blending)
  vec3 layerL = templeLightShafts(uv);
  finalColor += layerL * 0.6;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Energy Spiral Threads (additive blending)
  vec3 layerM = energySpiralThreads(uv);
  finalColor += layerM * 0.5;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Divine Particle Field (additive blending)
  vec3 layerN = divineParticleField(uv);
  finalColor += layerN * 0.6;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Ascension Rays (additive blending)
  vec3 layerO = ascensionRays(uv);
  finalColor += layerO * 0.4;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Outer Halo Crown (additive blending)
  vec3 layerP = outerHaloCrown(uv);
  finalColor += layerP * 0.4;
  bloomMask = max(bloomMask, length(layerP));
  
  // Layer Q: Inner Temple Core (additive blending)
  vec3 layerQ = innerTempleCore(uv);
  finalColor += layerQ * 0.7;
  bloomMask = max(bloomMask, length(layerQ));
  
  // Layer R: Celestial Lattice Shell (additive blending)
  vec3 layerR = celestialLatticeShell(uv);
  finalColor += layerR * 0.3;
  bloomMask = max(bloomMask, length(layerR));
  
  // Layer S: Temple Stair Runners (additive blending)
  vec3 layerS = templeStairRunners(uv);
  finalColor += layerS * 0.5;
  bloomMask = max(bloomMask, length(layerS));
  
  // Layer T: Radiant Mesh Field (additive blending)
  vec3 layerT = radiantMeshField(uv);
  finalColor += layerT * 0.3;
  bloomMask = max(bloomMask, length(layerT));
  
  // Layer U: Temple Aura (additive blending)
  vec3 layerU = templeAura(uv);
  finalColor += layerU * 0.2;
  bloomMask = max(bloomMask, length(layerU));
  
  // Layer V: Ascension Spiral Aura (additive blending)
  vec3 layerV = ascensionSpiralAura(uv);
  finalColor += layerV * 0.4;
  bloomMask = max(bloomMask, length(layerV));
  
  // Layer W: Bloom Mask Layer (additive blending)
  vec3 layerW = bloomMaskLayer(uv);
  finalColor += layerW * 0.5;
  bloomMask = max(bloomMask, length(layerW));
  
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

