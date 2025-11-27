/**
 * Astral Gate v3 Fragment Shader
 * 
 * Phase 2 — Section 59: ASTRAL GATE ENGINE v3
 * Astral Gate Engine v3 (E63)
 * 
 * 15-layer cosmic ascension portal: Gate Base Disc, Twin Ascension Arcs, Triple Spiral Halo, Ascension Pillars, Halo Glyph Ring, Energy Runners, Cross-Soul Threads, Astral Wave Rings, Dimensional Fog Layer, Ascension Stairs, Ascension Light Beams, Astral Dust Field, Portal Core, Outer Ascension Halo, Bloom Mask Layer
 */

export const astralGateFragmentShader = `
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

varying vec2 vUv;
varying vec3 vPosition;
varying float vBaseDiscIndex;
varying float vTwinArcIndex;
varying float vTripleSpiralIndex;
varying float vAscensionPillarIndex;
varying float vHaloGlyphIndex;
varying float vEnergyRunnerIndex;
varying float vCrossSoulThreadIndex;
varying float vAstralWaveIndex;
varying float vDimensionalFogIndex;
varying float vAscensionStairIndex;
varying float vLightBeamIndex;
varying float vAstralDustIndex;
varying float vPortalCoreIndex;
varying float vOuterHaloIndex;
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
// LAYER A: GATE BASE DISC
// ============================================
vec3 gateBaseDisc(vec2 uv) {
  if (vBaseDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64 radial × 32 concentric grid
  // Gradient: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → rotation acceleration (already in vertex)
  
  // Breath → radius pulse (already in vertex)
  
  // High → spectral shimmer: fbm(uv*5 + time)*uHigh*0.25
  float spectralShimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // White → Gold → Violet gradient
  vec3 discColor;
  if (gradientT < 0.5) {
    discColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    discColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Radial and concentric pattern
  float radialPattern = sin(vAngle * 64.0) * 0.5 + 0.5;
  float concentricPattern = sin(vRadius * 32.0) * 0.5 + 0.5;
  float pattern = (radialPattern + concentricPattern) * 0.5;
  
  return discColor * pattern * (1.0 + spectralShimmer) * 0.7;
}

// ============================================
// LAYER B: TWIN ASCENSION ARCS
// ============================================
vec3 twinAscensionArcs(vec2 uv) {
  if (vTwinArcIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2 mirrored arcs
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → climb progression (already in vertex)
  
  // Bass → arc wobble (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 arcColor;
  if (gradientT < 0.5) {
    arcColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    arcColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Arc width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return arcColor * widthFade * 0.5;
}

// ============================================
// LAYER C: TRIPLE SPIRAL HALO
// ============================================
vec3 tripleSpiralHalo(vec2 uv) {
  if (vTripleSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 spirals rotating at different speeds
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // High → spiral glitter: fbm(uv*9 + time)*uHigh*0.3
  float spiralGlitter = fbm(uv * 9.0 + uTime * 0.3) * uHigh * 0.3;
  spiralGlitter = smoothstep(0.7, 1.0, spiralGlitter);
  
  // White → Cyan → Violet gradient
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    spiralColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Spiral width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return spiralColor * widthFade * (1.0 + spiralGlitter) * 0.5;
}

// ============================================
// LAYER D: ASCENSION PILLARS
// ============================================
vec3 ascensionPillars(vec2 uv) {
  if (vAscensionPillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 vertical pillars
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → pillar growth (already in vertex)
  
  // Breath → width pulse
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Gold → Violet gradient
  vec3 pillarColor;
  if (gradientT < 0.5) {
    pillarColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    pillarColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Pillar width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return pillarColor * widthFade * breathWidth * 0.5;
}

// ============================================
// LAYER E: HALO GLYPH RING
// ============================================
vec3 haloGlyphRing(vec2 uv) {
  if (vHaloGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 72–96 glyphs
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph circle SDF: 0.2 radius
  float glyphRadius = 0.2;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // Bass → glyph jitter (already in vertex)
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Gold → Violet gradient
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
// LAYER F: ENERGY RUNNERS
// ============================================
vec3 energyRunners(vec2 uv) {
  if (vEnergyRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 streaks orbiting the ring
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → speed factor (already in vertex)
  
  // White → Cyan → Violet gradient
  vec3 runnerColor;
  if (gradientT < 0.5) {
    runnerColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    runnerColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Runner width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return runnerColor * widthFade * 0.4;
}

// ============================================
// LAYER G: CROSS-SOUL THREADS
// ============================================
vec3 crossSoulThreads(vec2 uv) {
  if (vCrossSoulThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 24–40 threads
  // Color: White → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // High → thread shimmer: fbm(uv*11 + time)*uHigh*0.25
  float threadShimmer = fbm(uv * 11.0 + uTime * 0.3) * uHigh * 0.25;
  threadShimmer = smoothstep(0.7, 1.0, threadShimmer);
  
  // White → Cyan gradient
  vec3 threadColor = mix(whiteColor, cyanColor, gradientT * 0.8);
  
  // Thread width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return threadColor * widthFade * (1.0 + threadShimmer) * 0.4;
}

// ============================================
// LAYER H: ASTRAL WAVE RINGS
// ============================================
vec3 astralWaveRings(vec2 uv) {
  if (vAstralWaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 4–8 expanding rings
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → ring expansion (already in vertex)
  
  // Breath → amplitude pulse
  float breathAmplitude = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Cyan → Violet gradient
  vec3 waveColor;
  if (gradientT < 0.5) {
    waveColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    waveColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return waveColor * thicknessFade * breathAmplitude * 0.4;
}

// ============================================
// LAYER I: DIMENSIONAL FOG LAYER
// ============================================
vec3 dimensionalFogLayer(vec2 uv) {
  if (vDimensionalFogIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm fog plane (64×64)
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // fbm fog (already in vertex)
  
  // BlessingWave → bright flash: uBlessingWaveProgress * 1.0
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 1.0;
  }
  
  // White → Violet → Cyan gradient
  vec3 fogColor;
  if (gradientT < 0.5) {
    fogColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    fogColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  // Fog pattern
  float fogPattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    fogColor = mix(fogColor, flashColor, blessingFlash);
  }
  
  return fogColor * fogPattern * (1.0 + blessingFlash) * 0.3;
}

// ============================================
// LAYER J: ASCENSION STAIRS
// ============================================
vec3 ascensionStairs(vec2 uv) {
  if (vAscensionStairIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20–30 step-like segments forming a rising staircase
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → vertical progression (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 stairColor;
  if (gradientT < 0.5) {
    stairColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    stairColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Stair width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return stairColor * widthFade * 0.4;
}

// ============================================
// LAYER K: ASCENSION LIGHT BEAMS
// ============================================
vec3 ascensionLightBeams(vec2 uv) {
  if (vLightBeamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–10 rising beams
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → width swell
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // High → spectral shimmer: fbm(uv*7 + time)*uHigh*0.25
  float spectralShimmer = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // White → Gold → Violet gradient
  vec3 beamColor;
  if (gradientT < 0.5) {
    beamColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    beamColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Beam width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return beamColor * widthFade * breathWidth * (1.0 + spectralShimmer) * 0.4;
}

// ============================================
// LAYER L: ASTRAL DUST FIELD
// ============================================
vec3 astralDustField(vec2 uv) {
  if (vAstralDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200–300 particles
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*34 + time)*uHigh*0.3
  float sparkle = fbm(uv * 34.0 + uTime) * uHigh * 0.3;
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
  
  return particleColor * particleMask * (1.0 + sparkle) * 0.8;
}

// ============================================
// LAYER M: PORTAL CORE
// ============================================
vec3 portalCore(vec2 uv) {
  if (vPortalCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Bright ascending core
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → expansion (already in vertex)
  
  // High → flare: fbm(uv*10 + time)*uHigh*0.3
  float flare = fbm(uv * 10.0 + uTime * 0.3) * uHigh * 0.3;
  flare = smoothstep(0.7, 1.0, flare);
  
  // White → Violet gradient
  vec3 coreColor = mix(whiteColor, violetColor, gradientT * 0.8);
  
  // Core radial fade
  float radialFade = 1.0 - smoothstep(0.0, 1.3, vRadius);
  
  return coreColor * radialFade * (1.0 + flare) * 1.4;
}

// ============================================
// LAYER N: OUTER ASCENSION HALO
// ============================================
vec3 outerAscensionHalo(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Rotating halo around portal
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → rotation speed (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Halo thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return haloColor * thicknessFade * 0.4;
}

// ============================================
// LAYER O: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Required for postFX bloom
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 6.0, distFromCenter);
  
  // Strong white-violet bloom color
  vec3 bloomColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.6, 1.0), 0.3);
  
  return bloomColor * bloomIntensity * 0.4;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Gate Base Disc (base layer)
  vec3 layerA = gateBaseDisc(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Ascension Arcs (additive blending)
  vec3 layerB = twinAscensionArcs(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Triple Spiral Halo (additive blending)
  vec3 layerC = tripleSpiralHalo(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Ascension Pillars (additive blending)
  vec3 layerD = ascensionPillars(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Halo Glyph Ring (additive blending)
  vec3 layerE = haloGlyphRing(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Energy Runners (additive blending)
  vec3 layerF = energyRunners(uv);
  finalColor += layerF * 0.4;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Cross-Soul Threads (additive blending)
  vec3 layerG = crossSoulThreads(uv);
  finalColor += layerG * 0.4;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Astral Wave Rings (additive blending)
  vec3 layerH = astralWaveRings(uv);
  finalColor += layerH * 0.4;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Dimensional Fog Layer (additive blending)
  vec3 layerI = dimensionalFogLayer(uv);
  finalColor += layerI * 0.3;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Ascension Stairs (additive blending)
  vec3 layerJ = ascensionStairs(uv);
  finalColor += layerJ * 0.4;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Ascension Light Beams (additive blending)
  vec3 layerK = ascensionLightBeams(uv);
  finalColor += layerK * 0.4;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Astral Dust Field (additive blending)
  vec3 layerL = astralDustField(uv);
  finalColor += layerL * 0.7;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Portal Core (additive blending)
  vec3 layerM = portalCore(uv);
  finalColor += layerM * 1.4;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Outer Ascension Halo (additive blending)
  vec3 layerN = outerAscensionHalo(uv);
  finalColor += layerN * 0.4;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Bloom Mask Layer (additive blending)
  vec3 layerO = bloomMaskLayer(uv);
  finalColor += layerO * 0.4;
  bloomMask = max(bloomMask, length(layerO));
  
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

