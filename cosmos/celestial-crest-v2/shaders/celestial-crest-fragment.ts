/**
 * Celestial Crest v2 Fragment Shader
 * 
 * Phase 2 — Section 66: CELESTIAL CREST ENGINE v2
 * Celestial Crest Engine v2 (E70)
 * 
 * 28-layer ultimate crest: Crest Base Plate, Twin Royal Crest Pillars, Triple Crest Arches, Supreme Crest Halo, Celestial Crest Rune Band, Crest Spiral Ribbons, Crest Glyph Ring, Orbital Crest Runners, Crest Light Shafts, Crest Flame Shell, Crest Fog Plane, Crest Dust Field, Crest Spiral Matrix, Ascension Crest Rays, Outer Crest Halo, Inner Crest Core, Crest Energy Threads, Dimensional Crest Ripple, Crest Wave Rings, Crest Particle Stream, Supreme Crest Aura Field, Crest Spires, Crest Rune Crown, Crest Lattice Veil, Crest Warp Layer, Bloom Mask Layer, Crown-Crest Interlink Layer, Crest-Sanctum Resonance Layer
 */

export const celestialCrestFragmentShader = `
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
varying float vBasePlateIndex;
varying float vTwinPillarIndex;
varying float vTripleArchIndex;
varying float vSupremeHaloIndex;
varying float vRuneBandIndex;
varying float vSpiralRibbonIndex;
varying float vGlyphRingIndex;
varying float vOrbitalRunnerIndex;
varying float vLightShaftIndex;
varying float vFlameShellIndex;
varying float vFogPlaneIndex;
varying float vDustFieldIndex;
varying float vSpiralMatrixIndex;
varying float vCrestRayIndex;
varying float vOuterHaloIndex;
varying float vInnerCoreIndex;
varying float vEnergyThreadIndex;
varying float vRippleIndex;
varying float vWaveRingIndex;
varying float vParticleStreamIndex;
varying float vAuraFieldIndex;
varying float vCrestSpireIndex;
varying float vRuneCrownIndex;
varying float vLatticeVeilIndex;
varying float vWarpLayerIndex;
varying float vBloomIndex;
varying float vInterlinkIndex;
varying float vResonanceIndex;
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
// LAYER A: CREST BASE PLATE
// ============================================
vec3 crestBasePlate(vec2 uv) {
  if (vBasePlateIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Grid pattern
  float gridX = sin(vAngle * 64.0) * 0.5 + 0.5;
  float gridY = sin(vRadius * 64.0) * 0.5 + 0.5;
  float gridPattern = (gridX + gridY) * 0.5;
  
  vec3 plateColor;
  if (gradientT < 0.5) {
    plateColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    plateColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return plateColor * gridPattern * 0.7;
}

// ============================================
// LAYER B: TWIN ROYAL CREST PILLARS
// ============================================
vec3 twinRoyalCrestPillars(vec2 uv) {
  if (vTwinPillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER C: TRIPLE CREST ARCHES
// ============================================
vec3 tripleCrestArches(vec2 uv) {
  if (vTripleArchIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER D: SUPREME CREST HALO
// ============================================
vec3 supremeCrestHalo(vec2 uv) {
  if (vSupremeHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER E: CELESTIAL CREST RUNE BAND
// ============================================
vec3 celestialCrestRuneBand(vec2 uv) {
  if (vRuneBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float runeRadius = 0.28;
  float runeDist = sdCircle(p, runeRadius);
  float runeMask = 1.0 - smoothstep(0.0, runeRadius * 2.0, runeDist);
  
  // BlessingWave → rune flash + distortion
  float blessingFlash = 0.0;
  float blessingDistortion = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
    blessingDistortion = sin(uTime * 3.0 + dist * 10.0) * uBlessingWaveProgress * 0.1;
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / runeRadius;
  vec3 runeColor;
  if (gradientT < 0.5) {
    runeColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    runeColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return runeColor * runeMask * (1.0 + blessingFlash) * (1.0 + blessingDistortion) * 0.8;
}

// ============================================
// LAYER F: CREST SPIRAL RIBBONS
// ============================================
vec3 crestSpiralRibbons(vec2 uv) {
  if (vSpiralRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER G: CREST GLYPH RING
// ============================================
vec3 crestGlyphRing(vec2 uv) {
  if (vGlyphRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float glyphRadius = 0.26;
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
// LAYER H: ORBITAL CREST RUNNERS
// ============================================
vec3 orbitalCrestRunners(vec2 uv) {
  if (vOrbitalRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // High → sparkle
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float runnerRadius = 0.18;
  float runnerDist = sdCircle(p, runnerRadius);
  float runnerMask = 1.0 - smoothstep(0.0, runnerRadius * 2.0, runnerDist);
  
  vec3 runnerColor;
  if (gradientT < 0.5) {
    runnerColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    runnerColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return runnerColor * runnerMask * (1.0 + sparkle) * 0.6;
}

// ============================================
// LAYER I: CREST LIGHT SHAFTS
// ============================================
vec3 crestLightShafts(vec2 uv) {
  if (vLightShaftIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 shaftColor = mix(whiteColor, violetColor, gradientT);
  
  return shaftColor * widthFade * 0.6;
}

// ============================================
// LAYER J: CREST FLAME SHELL
// ============================================
vec3 crestFlameShell(vec2 uv) {
  if (vFlameShellIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Orange → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 orangeColor = vec3(1.0, 0.6, 0.2);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Ascension flame shimmer
  float flamePattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  float flameShimmer = sin(uTime * 2.0 + vRadius * 5.0) * 0.3 + 0.7;
  flamePattern *= flameShimmer;
  
  vec3 flameColor;
  if (gradientT < 0.5) {
    flameColor = mix(whiteColor, orangeColor, gradientT * 2.0);
  } else {
    flameColor = mix(orangeColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return flameColor * flamePattern * 0.3;
}

// ============================================
// LAYER K: CREST FOG PLANE
// ============================================
vec3 crestFogPlane(vec2 uv) {
  if (vFogPlaneIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // Crest fog + warp
  float fogPattern = fbm(uv * 3.0 + uTime * 0.15) * 0.5 + 0.5;
  float fogWarp = sin(uTime * 1.5 + vRadius * 4.0) * 0.2 + 0.8;
  fogPattern *= fogWarp;
  
  vec3 fogColor = mix(whiteColor, violetColor, gradientT);
  
  return fogColor * fogPattern * breathPulse * 0.2;
}

// ============================================
// LAYER L: CREST DUST FIELD
// ============================================
vec3 crestDustField(vec2 uv) {
  if (vDustFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
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
// LAYER M: CREST SPIRAL MATRIX
// ============================================
vec3 crestSpiralMatrix(vec2 uv) {
  if (vSpiralMatrixIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER N: ASCENSION CREST RAYS
// ============================================
vec3 ascensionCrestRays(vec2 uv) {
  if (vCrestRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER O: OUTER CREST HALO
// ============================================
vec3 outerCrestHalo(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER P: INNER CREST CORE
// ============================================
vec3 innerCrestCore(vec2 uv) {
  if (vInnerCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  // White-gold pulsing core
  // Color: White → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse (already in vertex)
  
  float coreIntensity = 1.0 - smoothstep(0.0, 2.8, vRadius);
  
  vec3 coreColor = mix(whiteColor, goldColor, gradientT);
  
  return coreColor * coreIntensity * 0.8;
}

// ============================================
// LAYER Q: CREST ENERGY THREADS
// ============================================
vec3 crestEnergyThreads(vec2 uv) {
  if (vEnergyThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → thickness pulse
  float breathThickness = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
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
// LAYER R: DIMENSIONAL CREST RIPPLE
// ============================================
vec3 dimensionalCrestRipple(vec2 uv) {
  if (vRippleIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Scroll → ripple drift (already in vertex)
  
  float ripplePattern = fbm(uv * 2.8 + uTime * 0.16) * 0.5 + 0.5;
  
  vec3 rippleColor;
  if (gradientT < 0.5) {
    rippleColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    rippleColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return rippleColor * ripplePattern * 0.3;
}

// ============================================
// LAYER S: CREST WAVE RINGS
// ============================================
vec3 crestWaveRings(vec2 uv) {
  if (vWaveRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Mid → turbulence jitter (already in vertex)
  
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
  
  return waveColor * thicknessFade * wavePattern * 0.5;
}

// ============================================
// LAYER T: CREST PARTICLE STREAM
// ============================================
vec3 crestParticleStream(vec2 uv) {
  if (vParticleStreamIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
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
// LAYER U: SUPREME CREST AURA FIELD
// ============================================
vec3 supremeCrestAuraField(vec2 uv) {
  if (vAuraFieldIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Breath → pulse
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // Aura fade
  float auraFade = 1.0 - smoothstep(0.0, 8.0, vRadius);
  
  vec3 auraColor = mix(whiteColor, violetColor, gradientT);
  
  return auraColor * auraFade * breathPulse * 0.2;
}

// ============================================
// LAYER V: CREST SPIRES
// ============================================
vec3 crestSpires(vec2 uv) {
  if (vCrestSpireIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  vec3 spireColor;
  if (gradientT < 0.5) {
    spireColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    spireColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return spireColor * widthFade * 0.6;
}

// ============================================
// LAYER W: CREST RUNE CROWN
// ============================================
vec3 crestRuneCrown(vec2 uv) {
  if (vRuneCrownIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float runeRadius = 0.28;
  float runeDist = sdCircle(p, runeRadius);
  float runeMask = 1.0 - smoothstep(0.0, runeRadius * 2.0, runeDist);
  
  // BlessingWave → rune flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / runeRadius;
  vec3 runeColor;
  if (gradientT < 0.5) {
    runeColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    runeColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return runeColor * runeMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER X: CREST LATTICE VEIL
// ============================================
vec3 crestLatticeVeil(vec2 uv) {
  if (vLatticeVeilIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Scroll → drift (already in vertex)
  
  float latticePattern = fbm(uv * 3.0 + uTime * 0.15) * 0.5 + 0.5;
  
  vec3 latticeColor;
  if (gradientT < 0.5) {
    latticeColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    latticeColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return latticeColor * latticePattern * 0.3;
}

// ============================================
// LAYER Y: CREST WARP LAYER
// ============================================
vec3 crestWarpLayer(vec2 uv) {
  if (vWarpLayerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Scroll → warp drift (already in vertex)
  
  float warpPattern = fbm(uv * 2.4 + uTime * 0.19) * 0.5 + 0.5;
  
  vec3 warpColor;
  if (gradientT < 0.5) {
    warpColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    warpColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return warpColor * warpPattern * 0.3;
}

// ============================================
// LAYER Z: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Required for E12 bloom
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 7.5, distFromCenter);
  
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

// ============================================
// LAYER AA: CROWN-CREST INTERLINK LAYER
// ============================================
vec3 crownCrestInterlinkLayer(vec2 uv) {
  if (vInterlinkIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Gold → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Crown-crest resonance shimmer
  float resonanceShimmer = sin(uTime * 2.5 + vRadius * 6.0) * 0.4 + 0.6;
  resonanceShimmer += sin(uTime * 1.8 + vAngle * 8.0) * 0.3;
  resonanceShimmer = clamp(resonanceShimmer, 0.3, 1.0);
  
  // Scroll → interlink drift (already in vertex)
  
  float interlinkPattern = fbm(uv * 2.6 + uTime * 0.17) * 0.5 + 0.5;
  interlinkPattern *= resonanceShimmer;
  
  vec3 interlinkColor;
  if (gradientT < 0.5) {
    interlinkColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    interlinkColor = mix(goldColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return interlinkColor * interlinkPattern * 0.4;
}

// ============================================
// LAYER AB: CREST-SANCTUM RESONANCE LAYER
// ============================================
vec3 crestSanctumResonanceLayer(vec2 uv) {
  if (vResonanceIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Crest-sanctum resonance shimmer
  float resonanceShimmer = sin(uTime * 2.8 + vRadius * 7.0) * 0.4 + 0.6;
  resonanceShimmer += sin(uTime * 2.0 + vAngle * 9.0) * 0.3;
  resonanceShimmer = clamp(resonanceShimmer, 0.3, 1.0);
  
  // Scroll → resonance drift (already in vertex)
  
  float resonancePattern = fbm(uv * 2.7 + uTime * 0.18) * 0.5 + 0.5;
  resonancePattern *= resonanceShimmer;
  
  vec3 resonanceColor;
  if (gradientT < 0.5) {
    resonanceColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    resonanceColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  return resonanceColor * resonancePattern * 0.4;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Crest Base Plate (base layer)
  vec3 layerA = crestBasePlate(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Royal Crest Pillars (additive blending)
  vec3 layerB = twinRoyalCrestPillars(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Triple Crest Arches (additive blending)
  vec3 layerC = tripleCrestArches(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Supreme Crest Halo (additive blending)
  vec3 layerD = supremeCrestHalo(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Celestial Crest Rune Band (additive blending)
  vec3 layerE = celestialCrestRuneBand(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Crest Spiral Ribbons (additive blending)
  vec3 layerF = crestSpiralRibbons(uv);
  finalColor += layerF * 0.5;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Crest Glyph Ring (additive blending)
  vec3 layerG = crestGlyphRing(uv);
  finalColor += layerG * 0.7;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Orbital Crest Runners (additive blending)
  vec3 layerH = orbitalCrestRunners(uv);
  finalColor += layerH * 0.6;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Crest Light Shafts (additive blending)
  vec3 layerI = crestLightShafts(uv);
  finalColor += layerI * 0.6;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Crest Flame Shell (additive blending)
  vec3 layerJ = crestFlameShell(uv);
  finalColor += layerJ * 0.3;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Crest Fog Plane (additive blending)
  vec3 layerK = crestFogPlane(uv);
  finalColor += layerK * 0.2;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Crest Dust Field (additive blending)
  vec3 layerL = crestDustField(uv);
  finalColor += layerL * 0.6;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Crest Spiral Matrix (additive blending)
  vec3 layerM = crestSpiralMatrix(uv);
  finalColor += layerM * 0.5;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Ascension Crest Rays (additive blending)
  vec3 layerN = ascensionCrestRays(uv);
  finalColor += layerN * 0.4;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Outer Crest Halo (additive blending)
  vec3 layerO = outerCrestHalo(uv);
  finalColor += layerO * 0.4;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Inner Crest Core (additive blending)
  vec3 layerP = innerCrestCore(uv);
  finalColor += layerP * 0.7;
  bloomMask = max(bloomMask, length(layerP));
  
  // Layer Q: Crest Energy Threads (additive blending)
  vec3 layerQ = crestEnergyThreads(uv);
  finalColor += layerQ * 0.5;
  bloomMask = max(bloomMask, length(layerQ));
  
  // Layer R: Dimensional Crest Ripple (additive blending)
  vec3 layerR = dimensionalCrestRipple(uv);
  finalColor += layerR * 0.3;
  bloomMask = max(bloomMask, length(layerR));
  
  // Layer S: Crest Wave Rings (additive blending)
  vec3 layerS = crestWaveRings(uv);
  finalColor += layerS * 0.5;
  bloomMask = max(bloomMask, length(layerS));
  
  // Layer T: Crest Particle Stream (additive blending)
  vec3 layerT = crestParticleStream(uv);
  finalColor += layerT * 0.6;
  bloomMask = max(bloomMask, length(layerT));
  
  // Layer U: Supreme Crest Aura Field (additive blending)
  vec3 layerU = supremeCrestAuraField(uv);
  finalColor += layerU * 0.2;
  bloomMask = max(bloomMask, length(layerU));
  
  // Layer V: Crest Spires (additive blending)
  vec3 layerV = crestSpires(uv);
  finalColor += layerV * 0.6;
  bloomMask = max(bloomMask, length(layerV));
  
  // Layer W: Crest Rune Crown (additive blending)
  vec3 layerW = crestRuneCrown(uv);
  finalColor += layerW * 0.7;
  bloomMask = max(bloomMask, length(layerW));
  
  // Layer X: Crest Lattice Veil (additive blending)
  vec3 layerX = crestLatticeVeil(uv);
  finalColor += layerX * 0.3;
  bloomMask = max(bloomMask, length(layerX));
  
  // Layer Y: Crest Warp Layer (additive blending)
  vec3 layerY = crestWarpLayer(uv);
  finalColor += layerY * 0.3;
  bloomMask = max(bloomMask, length(layerY));
  
  // Layer Z: Bloom Mask Layer (additive blending)
  vec3 layerZ = bloomMaskLayer(uv);
  finalColor += layerZ * 0.5;
  bloomMask = max(bloomMask, length(layerZ));
  
  // Layer AA: Crown-Crest Interlink Layer (additive blending)
  vec3 layerAA = crownCrestInterlinkLayer(uv);
  finalColor += layerAA * 0.4;
  bloomMask = max(bloomMask, length(layerAA));
  
  // Layer AB: Crest-Sanctum Resonance Layer (additive blending)
  vec3 layerAB = crestSanctumResonanceLayer(uv);
  finalColor += layerAB * 0.4;
  bloomMask = max(bloomMask, length(layerAB));
  
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

