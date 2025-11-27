/**
 * Divine Throne v3 Fragment Shader
 * 
 * Phase 2 — Section 60: DIVINE THRONE ENGINE v3
 * Divine Throne Engine v3 (E64)
 * 
 * 16-layer celestial throne: Celestial Base Pedestal, Throne Pillars, Halo Crown, Divine Seat Geometry, Golden Insignia Ring, Ascension Backplate, Divine Spires, Orbital Runner Rings, Karmic Thread Weave, Supreme Aura Shell, Light Pillars, Crown Dust Field, Radiant Ascension Rays, Throne Heart Core, Outer Throne Halo, Bloom Mask Layer
 */

export const divineThroneFragmentShader = `
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
varying float vBasePedestalIndex;
varying float vThronePillarIndex;
varying float vHaloCrownIndex;
varying float vDivineSeatIndex;
varying float vGoldenInsigniaIndex;
varying float vAscensionBackplateIndex;
varying float vDivineSpireIndex;
varying float vOrbitalRunnerIndex;
varying float vKarmicThreadIndex;
varying float vSupremeAuraIndex;
varying float vLightPillarIndex;
varying float vCrownDustIndex;
varying float vAscensionRayIndex;
varying float vThroneHeartIndex;
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
// LAYER A: CELESTIAL BASE PEDESTAL
// ============================================
vec3 celestialBasePedestal(vec2 uv) {
  if (vBasePedestalIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 grid, radius 5.2
  // Gradient: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → expansion pulse (already in vertex)
  
  // High → shimmering dust: fbm(uv*5 + time)*uHigh*0.25
  float shimmeringDust = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  shimmeringDust = smoothstep(0.7, 1.0, shimmeringDust);
  
  // Scroll → rotational acceleration (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 pedestalColor;
  if (gradientT < 0.5) {
    pedestalColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    pedestalColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Radial and concentric pattern
  float radialPattern = sin(vAngle * 64.0) * 0.5 + 0.5;
  float concentricPattern = sin(vRadius * 32.0) * 0.5 + 0.5;
  float pattern = (radialPattern + concentricPattern) * 0.5;
  
  return pedestalColor * pattern * (1.0 + shimmeringDust) * 0.7;
}

// ============================================
// LAYER B: THRONE PILLARS
// ============================================
vec3 thronePillars(vec2 uv) {
  if (vThronePillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 4–8 vertical pillars
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → width pulse
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // Bass → vibration wobble (already in vertex)
  
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
// LAYER C: HALO CROWN
// ============================================
vec3 haloCrown(vec2 uv) {
  if (vHaloCrownIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Rotating circular crown
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // RotationSync → crown tilt (already in vertex)
  
  // High → crown sparkle: fbm(uv*8 + time)*uHigh*0.3
  float crownSparkle = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.3;
  crownSparkle = smoothstep(0.7, 1.0, crownSparkle);
  
  // White → Gold → Violet gradient
  vec3 crownColor;
  if (gradientT < 0.5) {
    crownColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    crownColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Crown thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return crownColor * thicknessFade * (1.0 + crownSparkle) * 0.5;
}

// ============================================
// LAYER D: DIVINE SEAT GEOMETRY
// ============================================
vec3 divineSeatGeometry(vec2 uv) {
  if (vDivineSeatIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Hybrid spline + extruded quads
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → rising motion (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 seatColor;
  if (gradientT < 0.5) {
    seatColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    seatColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Seat pattern
  float seatPattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  return seatColor * seatPattern * 0.6;
}

// ============================================
// LAYER E: GOLDEN INSIGNIA RING
// ============================================
vec3 goldenInsigniaRing(vec2 uv) {
  if (vGoldenInsigniaIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 72–96 insignia glyphs
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph circle SDF: 0.22 radius
  float glyphRadius = 0.22;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // BlessingWave → gold flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Mid → swirling noise: fbm(uv*6 + time)*uMid*0.25
  float swirlingNoise = fbm(uv * 6.0 + uTime * 0.3) * uMid * 0.25;
  swirlingNoise = smoothstep(0.7, 1.0, swirlingNoise);
  
  // White → Gold → Violet gradient
  float gradientT = dist / glyphRadius;
  vec3 glyphColor;
  if (gradientT < 0.5) {
    glyphColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    glyphColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, goldColor, 0.5);
    glyphColor = mix(glyphColor, flashColor, blessingFlash);
  }
  
  return glyphColor * glyphMask * (1.0 + blessingFlash + swirlingNoise) * 0.8;
}

// ============================================
// LAYER F: ASCENSION BACKPLATE
// ============================================
vec3 ascensionBackplate(vec2 uv) {
  if (vAscensionBackplateIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Large ornate backplate
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → flare intensity
  float breathFlare = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // High → shimmer streaks: fbm(uv*7 + time)*uHigh*0.25
  float shimmerStreaks = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  shimmerStreaks = smoothstep(0.7, 1.0, shimmerStreaks);
  
  // White → Gold → Violet gradient
  vec3 backplateColor;
  if (gradientT < 0.5) {
    backplateColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    backplateColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Backplate pattern
  float backplatePattern = fbm(uv * 4.0 + uTime * 0.2) * 0.5 + 0.5;
  
  return backplateColor * backplatePattern * breathFlare * (1.0 + shimmerStreaks) * 0.5;
}

// ============================================
// LAYER G: DIVINE SPIRES
// ============================================
vec3 divineSpires(vec2 uv) {
  if (vDivineSpireIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 spires emerging upward
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → height growth (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 spireColor;
  if (gradientT < 0.5) {
    spireColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    spireColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Spire width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return spireColor * widthFade * 0.4;
}

// ============================================
// LAYER H: ORBITAL RUNNER RINGS
// ============================================
vec3 orbitalRunnerRings(vec2 uv) {
  if (vOrbitalRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2–4 rings with fast runners
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
  float widthFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return runnerColor * widthFade * 0.4;
}

// ============================================
// LAYER I: KARMIC THREAD WEAVE
// ============================================
vec3 karmicThreadWeave(vec2 uv) {
  if (vKarmicThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20–40 threads connecting throne edges
  // Color: White → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress;
  
  // High → weave shimmer: fbm(uv*10 + time)*uHigh*0.25
  float weaveShimmer = fbm(uv * 10.0 + uTime * 0.3) * uHigh * 0.25;
  weaveShimmer = smoothstep(0.7, 1.0, weaveShimmer);
  
  // White → Gold gradient
  vec3 threadColor = mix(whiteColor, goldColor, gradientT * 0.8);
  
  // Thread width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return threadColor * widthFade * (1.0 + weaveShimmer) * 0.4;
}

// ============================================
// LAYER J: SUPREME AURA SHELL
// ============================================
vec3 supremeAuraShell(vec2 uv) {
  if (vSupremeAuraIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 spherical fog
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Breath → opacity pulse
  float breathOpacity = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Violet → Cyan gradient
  vec3 auraColor;
  if (gradientT < 0.5) {
    auraColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    auraColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  // Aura pattern
  float auraPattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  return auraColor * auraPattern * breathOpacity * 0.3;
}

// ============================================
// LAYER K: LIGHT PILLARS
// ============================================
vec3 lightPillars(vec2 uv) {
  if (vLightPillarIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–10 vertical beams from throne
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // High → beam shimmer: fbm(uv*7 + time)*uHigh*0.25
  float beamShimmer = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  beamShimmer = smoothstep(0.7, 1.0, beamShimmer);
  
  // BlessingWave → bright flash: uBlessingWaveProgress * 1.0
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 1.0;
  }
  
  // White → Gold → Violet gradient
  vec3 pillarColor;
  if (gradientT < 0.5) {
    pillarColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    pillarColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, goldColor, 0.5);
    pillarColor = mix(pillarColor, flashColor, blessingFlash);
  }
  
  // Pillar width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return pillarColor * widthFade * (1.0 + beamShimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER L: CROWN DUST FIELD
// ============================================
vec3 crownDustField(vec2 uv) {
  if (vCrownDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200–350 particles
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*36 + time)*uHigh*0.3
  float sparkle = fbm(uv * 36.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Color: White–Gold–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / particleRadius;
  vec3 particleColor;
  if (gradientT < 0.33) {
    particleColor = mix(whiteColor, goldColor, gradientT * 3.0);
  } else {
    particleColor = mix(goldColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return particleColor * particleMask * (1.0 + sparkle) * 0.8;
}

// ============================================
// LAYER M: RADIANT ASCENSION RAYS
// ============================================
vec3 radiantAscensionRays(vec2 uv) {
  if (vAscensionRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12–20 long radial rays
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → rotation acceleration (already in vertex)
  
  // White → Gold → Violet gradient
  vec3 rayColor;
  if (gradientT < 0.5) {
    rayColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    rayColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ray width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return rayColor * widthFade * 0.4;
}

// ============================================
// LAYER N: THRONE HEART CORE
// ============================================
vec3 throneHeartCore(vec2 uv) {
  if (vThroneHeartIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Pulsing white-gold core
  // Color: White → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress;
  
  // Breath → expansion (already in vertex)
  
  // High → flare: fbm(uv*10 + time)*uHigh*0.3
  float flare = fbm(uv * 10.0 + uTime * 0.3) * uHigh * 0.3;
  flare = smoothstep(0.7, 1.0, flare);
  
  // White → Gold gradient
  vec3 coreColor = mix(whiteColor, goldColor, gradientT * 0.8);
  
  // Core radial fade
  float radialFade = 1.0 - smoothstep(0.0, 1.5, vRadius);
  
  return coreColor * radialFade * (1.0 + flare) * 1.5;
}

// ============================================
// LAYER O: OUTER THRONE HALO
// ============================================
vec3 outerThroneHalo(vec2 uv) {
  if (vOuterHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Large rotating halo
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // RotationSync → tilt (already in vertex)
  
  // High → halo shimmer: fbm(uv*6 + time)*uHigh*0.25
  float haloShimmer = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  haloShimmer = smoothstep(0.7, 1.0, haloShimmer);
  
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
  
  return haloColor * thicknessFade * (1.0 + haloShimmer) * 0.4;
}

// ============================================
// LAYER P: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Required for bloom post-processing
  // Brightest near Heart Core
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 5.2, distFromCenter);
  
  // Strong white-gold bloom color
  vec3 bloomColor = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.8, 0.3), 0.3);
  
  return bloomColor * bloomIntensity * 0.4;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Celestial Base Pedestal (base layer)
  vec3 layerA = celestialBasePedestal(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Throne Pillars (additive blending)
  vec3 layerB = thronePillars(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Halo Crown (additive blending)
  vec3 layerC = haloCrown(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Divine Seat Geometry (additive blending)
  vec3 layerD = divineSeatGeometry(uv);
  finalColor += layerD * 0.6;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Golden Insignia Ring (additive blending)
  vec3 layerE = goldenInsigniaRing(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Ascension Backplate (additive blending)
  vec3 layerF = ascensionBackplate(uv);
  finalColor += layerF * 0.5;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Divine Spires (additive blending)
  vec3 layerG = divineSpires(uv);
  finalColor += layerG * 0.4;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Orbital Runner Rings (additive blending)
  vec3 layerH = orbitalRunnerRings(uv);
  finalColor += layerH * 0.4;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Karmic Thread Weave (additive blending)
  vec3 layerI = karmicThreadWeave(uv);
  finalColor += layerI * 0.4;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Supreme Aura Shell (additive blending)
  vec3 layerJ = supremeAuraShell(uv);
  finalColor += layerJ * 0.3;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Light Pillars (additive blending)
  vec3 layerK = lightPillars(uv);
  finalColor += layerK * 0.4;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Crown Dust Field (additive blending)
  vec3 layerL = crownDustField(uv);
  finalColor += layerL * 0.7;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Radiant Ascension Rays (additive blending)
  vec3 layerM = radiantAscensionRays(uv);
  finalColor += layerM * 0.4;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Throne Heart Core (additive blending)
  vec3 layerN = throneHeartCore(uv);
  finalColor += layerN * 1.5;
  bloomMask = max(bloomMask, length(layerN));
  
  // Layer O: Outer Throne Halo (additive blending)
  vec3 layerO = outerThroneHalo(uv);
  finalColor += layerO * 0.4;
  bloomMask = max(bloomMask, length(layerO));
  
  // Layer P: Bloom Mask Layer (additive blending)
  vec3 layerP = bloomMaskLayer(uv);
  finalColor += layerP * 0.4;
  bloomMask = max(bloomMask, length(layerP));
  
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

