/**
 * Celestial Crown v2 Fragment Shader
 * 
 * Phase 2 — Section 65: CELESTIAL CROWN ENGINE v2
 * Celestial Crown Engine v2 (E69)
 * 
 * 26-layer ascended crown: Crown Base Disc, Twin Crown Pillars, Triple Ascension Arches, Royal Crown Halo, Celestial Sigil Band, Spiral Crown Ribbons, Crown Glyph Ring, Orbital Crown Runners, Royal Light Shafts, Crown Flame Shell, Crown Fog Plane, Crown Dust Field, Royal Spiral Matrix, Ascension Crown Rays, Outer Crown Halo, Inner Crown Core, Crown Energy Threads, Dimensional Ripple Veil, Ascension Wave Rings, Crown Particle Stream, Supreme Aura Field, Crown Spires, Royal Rune Band, Crown Lattice Field, Crown Warp Layer, Bloom Mask Layer
 */

export const celestialCrownFragmentShader = `
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
varying float vBaseDiscIndex;
varying float vTwinPillarIndex;
varying float vTripleArchIndex;
varying float vRoyalHaloIndex;
varying float vSigilBandIndex;
varying float vSpiralRibbonIndex;
varying float vGlyphRingIndex;
varying float vOrbitalRunnerIndex;
varying float vLightShaftIndex;
varying float vFlameShellIndex;
varying float vFogPlaneIndex;
varying float vDustFieldIndex;
varying float vSpiralMatrixIndex;
varying float vCrownRayIndex;
varying float vOuterHaloIndex;
varying float vInnerCoreIndex;
varying float vEnergyThreadIndex;
varying float vRippleVeilIndex;
varying float vWaveRingIndex;
varying float vParticleStreamIndex;
varying float vAuraFieldIndex;
varying float vCrownSpireIndex;
varying float vRuneBandIndex;
varying float vLatticeFieldIndex;
varying float vWarpLayerIndex;
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
// LAYER A: CROWN BASE DISC
// ============================================
vec3 crownBaseDisc(vec2 uv) {
  if (vBaseDiscIndex < 0.0) {
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
  
  vec3 discColor;
  if (gradientT < 0.5) {
    discColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    discColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return discColor * gridPattern * 0.7;
}

// ============================================
// LAYER B: TWIN CROWN PILLARS
// ============================================
vec3 twinCrownPillars(vec2 uv) {
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
// LAYER C: TRIPLE ASCENSION ARCHES
// ============================================
vec3 tripleAscensionArches(vec2 uv) {
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
// LAYER D: ROYAL CROWN HALO
// ============================================
vec3 royalCrownHalo(vec2 uv) {
  if (vRoyalHaloIndex < 0.0) {
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
// LAYER E: CELESTIAL SIGIL BAND
// ============================================
vec3 celestialSigilBand(vec2 uv) {
  if (vSigilBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float sigilRadius = 0.26;
  float sigilDist = sdCircle(p, sigilRadius);
  float sigilMask = 1.0 - smoothstep(0.0, sigilRadius * 2.0, sigilDist);
  
  // BlessingWave → sigil flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / sigilRadius;
  vec3 sigilColor;
  if (gradientT < 0.5) {
    sigilColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    sigilColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return sigilColor * sigilMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER F: SPIRAL CROWN RIBBONS
// ============================================
vec3 spiralCrownRibbons(vec2 uv) {
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
// LAYER G: CROWN GLYPH RING
// ============================================
vec3 crownGlyphRing(vec2 uv) {
  if (vGlyphRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float glyphRadius = 0.24;
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
// LAYER H: ORBITAL CROWN RUNNERS
// ============================================
vec3 orbitalCrownRunners(vec2 uv) {
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
  
  float runnerRadius = 0.16;
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
// LAYER I: ROYAL LIGHT SHAFTS
// ============================================
vec3 royalLightShafts(vec2 uv) {
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
// LAYER J: CROWN FLAME SHELL
// ============================================
vec3 crownFlameShell(vec2 uv) {
  if (vFlameShellIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Orange → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 orangeColor = vec3(1.0, 0.6, 0.2);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
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
// LAYER K: CROWN FOG PLANE
// ============================================
vec3 crownFogPlane(vec2 uv) {
  if (vFogPlaneIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  float fogPattern = fbm(uv * 3.0 + uTime * 0.15) * 0.5 + 0.5;
  
  vec3 fogColor = mix(whiteColor, violetColor, gradientT);
  
  return fogColor * fogPattern * breathPulse * 0.2;
}

// ============================================
// LAYER L: CROWN DUST FIELD
// ============================================
vec3 crownDustField(vec2 uv) {
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
// LAYER M: ROYAL SPIRAL MATRIX
// ============================================
vec3 royalSpiralMatrix(vec2 uv) {
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
// LAYER N: ASCENSION CROWN RAYS
// ============================================
vec3 ascensionCrownRays(vec2 uv) {
  if (vCrownRayIndex < 0.0) {
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
// LAYER O: OUTER CROWN HALO
// ============================================
vec3 outerCrownHalo(vec2 uv) {
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
// LAYER P: INNER CROWN CORE
// ============================================
vec3 innerCrownCore(vec2 uv) {
  if (vInnerCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  // White-gold pulsing core
  // Color: White → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress;
  
  // Breath → pulse (already in vertex)
  
  float coreIntensity = 1.0 - smoothstep(0.0, 2.5, vRadius);
  
  vec3 coreColor = mix(whiteColor, goldColor, gradientT);
  
  return coreColor * coreIntensity * 0.8;
}

// ============================================
// LAYER Q: CROWN ENERGY THREADS
// ============================================
vec3 crownEnergyThreads(vec2 uv) {
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
// LAYER R: DIMENSIONAL RIPPLE VEIL
// ============================================
vec3 dimensionalRippleVeil(vec2 uv) {
  if (vRippleVeilIndex < 0.0) {
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
// LAYER S: ASCENSION WAVE RINGS
// ============================================
vec3 ascensionWaveRings(vec2 uv) {
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
// LAYER T: CROWN PARTICLE STREAM
// ============================================
vec3 crownParticleStream(vec2 uv) {
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
// LAYER U: SUPREME AURA FIELD
// ============================================
vec3 supremeAuraField(vec2 uv) {
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
  float auraFade = 1.0 - smoothstep(0.0, 7.5, vRadius);
  
  vec3 auraColor = mix(whiteColor, violetColor, gradientT);
  
  return auraColor * auraFade * breathPulse * 0.2;
}

// ============================================
// LAYER V: CROWN SPIRES
// ============================================
vec3 crownSpires(vec2 uv) {
  if (vCrownSpireIndex < 0.0) {
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
// LAYER W: ROYAL RUNE BAND
// ============================================
vec3 royalRuneBand(vec2 uv) {
  if (vRuneBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float runeRadius = 0.26;
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
// LAYER X: CROWN LATTICE FIELD
// ============================================
vec3 crownLatticeField(vec2 uv) {
  if (vLatticeFieldIndex < 0.0) {
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
// LAYER Y: CROWN WARP LAYER
// ============================================
vec3 crownWarpLayer(vec2 uv) {
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
  float bloomIntensity = 1.0 - smoothstep(0.0, 7.0, distFromCenter);
  
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
  
  // Layer A: Crown Base Disc (base layer)
  vec3 layerA = crownBaseDisc(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Crown Pillars (additive blending)
  vec3 layerB = twinCrownPillars(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Triple Ascension Arches (additive blending)
  vec3 layerC = tripleAscensionArches(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Royal Crown Halo (additive blending)
  vec3 layerD = royalCrownHalo(uv);
  finalColor += layerD * 0.5;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Celestial Sigil Band (additive blending)
  vec3 layerE = celestialSigilBand(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Spiral Crown Ribbons (additive blending)
  vec3 layerF = spiralCrownRibbons(uv);
  finalColor += layerF * 0.5;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Crown Glyph Ring (additive blending)
  vec3 layerG = crownGlyphRing(uv);
  finalColor += layerG * 0.7;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Orbital Crown Runners (additive blending)
  vec3 layerH = orbitalCrownRunners(uv);
  finalColor += layerH * 0.6;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Royal Light Shafts (additive blending)
  vec3 layerI = royalLightShafts(uv);
  finalColor += layerI * 0.6;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Crown Flame Shell (additive blending)
  vec3 layerJ = crownFlameShell(uv);
  finalColor += layerJ * 0.3;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Crown Fog Plane (additive blending)
  vec3 layerK = crownFogPlane(uv);
  finalColor += layerK * 0.2;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Crown Dust Field (additive blending)
  vec3 layerL = crownDustField(uv);
  finalColor += layerL * 0.6;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Royal Spiral Matrix (additive blending)
  vec3 layerM = royalSpiralMatrix(uv);
  finalColor += layerM * 0.5;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Ascension Crown Rays (additive blending)
  vec3 layerN = ascensionCrownRays(uv);
  finalColor += layerN * 0.4;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Outer Crown Halo (additive blending)
  vec3 layerO = outerCrownHalo(uv);
  finalColor += layerO * 0.4;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Inner Crown Core (additive blending)
  vec3 layerP = innerCrownCore(uv);
  finalColor += layerP * 0.7;
  bloomMask = max(bloomMask, length(layerP));
  
  // Layer Q: Crown Energy Threads (additive blending)
  vec3 layerQ = crownEnergyThreads(uv);
  finalColor += layerQ * 0.5;
  bloomMask = max(bloomMask, length(layerQ));
  
  // Layer R: Dimensional Ripple Veil (additive blending)
  vec3 layerR = dimensionalRippleVeil(uv);
  finalColor += layerR * 0.3;
  bloomMask = max(bloomMask, length(layerR));
  
  // Layer S: Ascension Wave Rings (additive blending)
  vec3 layerS = ascensionWaveRings(uv);
  finalColor += layerS * 0.5;
  bloomMask = max(bloomMask, length(layerS));
  
  // Layer T: Crown Particle Stream (additive blending)
  vec3 layerT = crownParticleStream(uv);
  finalColor += layerT * 0.6;
  bloomMask = max(bloomMask, length(layerT));
  
  // Layer U: Supreme Aura Field (additive blending)
  vec3 layerU = supremeAuraField(uv);
  finalColor += layerU * 0.2;
  bloomMask = max(bloomMask, length(layerU));
  
  // Layer V: Crown Spires (additive blending)
  vec3 layerV = crownSpires(uv);
  finalColor += layerV * 0.6;
  bloomMask = max(bloomMask, length(layerV));
  
  // Layer W: Royal Rune Band (additive blending)
  vec3 layerW = royalRuneBand(uv);
  finalColor += layerW * 0.7;
  bloomMask = max(bloomMask, length(layerW));
  
  // Layer X: Crown Lattice Field (additive blending)
  vec3 layerX = crownLatticeField(uv);
  finalColor += layerX * 0.3;
  bloomMask = max(bloomMask, length(layerX));
  
  // Layer Y: Crown Warp Layer (additive blending)
  vec3 layerY = crownWarpLayer(uv);
  finalColor += layerY * 0.3;
  bloomMask = max(bloomMask, length(layerY));
  
  // Layer Z: Bloom Mask Layer (additive blending)
  vec3 layerZ = bloomMaskLayer(uv);
  finalColor += layerZ * 0.5;
  bloomMask = max(bloomMask, length(layerZ));
  
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

