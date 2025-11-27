/**
 * Dharma Wheel v2 Fragment Shader
 * 
 * Phase 2 — Section 55: DHARMA WHEEL ENGINE v2
 * Dharma Wheel Engine v2 (E59)
 * 
 * 7-layer rotational karmic mandala: Core Mandala Disk, Rotating Karmic Spokes, Outer Chakra Ring, Karmic Glyphs, Rotating Mantra Bands, Aura Flame Shell, Mandala Dust Field
 */

export const dharmaWheelFragmentShader = `
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
varying float vMandalaIndex;
varying float vSpokeIndex;
varying float vChakraRingIndex;
varying float vGlyphIndex;
varying float vMantraBandIndex;
varying float vFlameIndex;
varying float vDustIndex;
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
// LAYER A: CORE MANDALA DISK
// ============================================
vec3 coreMandalaDisk(vec2 uv) {
  if (vMandalaIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Circular disk subdivided into 64 radial + 32 concentric rings
  // Gradient: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Scroll → rotation acceleration (already in vertex)
  
  // Breath → radius expansion pulse (already in vertex)
  
  // High → shimmer pulse: fbm(uv*5 + time)*uHigh*0.25
  float shimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → white-gold flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Gold → Violet gradient
  vec3 diskColor;
  if (gradientT < 0.5) {
    diskColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    diskColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, goldColor, 0.5);
    diskColor = mix(diskColor, flashColor, blessingFlash);
  }
  
  // Radial and concentric ring pattern
  float radialPattern = sin(vAngle * 64.0) * 0.5 + 0.5;
  float concentricPattern = sin(vRadius * 32.0) * 0.5 + 0.5;
  float pattern = (radialPattern + concentricPattern) * 0.5;
  
  return diskColor * pattern * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: ROTATING KARMIC SPOKES
// ============================================
vec3 rotatingKarmicSpokes(vec2 uv) {
  if (vSpokeIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8, 12, or 16 spokes depending on screen size
  // Color: Gold → Violet
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along spoke
  
  // Spokes rotate at speed = base + scroll*0.5 (already in vertex)
  
  // Bass → vibration wobble (already in vertex)
  
  // High → streak shimmer: fbm(uv*6 + time)*uHigh*0.25
  float streakShimmer = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  streakShimmer = smoothstep(0.7, 1.0, streakShimmer);
  
  // Gold → Violet gradient
  vec3 spokeColor = mix(goldColor, violetColor, gradientT * 0.8);
  
  // Spoke width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return spokeColor * widthFade * (1.0 + streakShimmer) * 0.5;
}

// ============================================
// LAYER C: OUTER CHAKRA RING
// ============================================
vec3 outerChakraRing(vec2 uv) {
  if (vChakraRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 nested chakra rings
  // Color: Cyan → Blue → Indigo
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Based on ring index
  
  // RotationSync → ring tilt + sync (already in vertex)
  
  // Breath → ring radius modulation (already in vertex)
  
  // High → spectral scatter: fbm(uv*7 + time)*uHigh*0.25
  float spectralScatter = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  spectralScatter = smoothstep(0.7, 1.0, spectralScatter);
  
  // Cyan → Blue → Indigo gradient
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(cyanColor, blueColor, gradientT * 2.0);
  } else {
    ringColor = mix(blueColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return ringColor * thicknessFade * (1.0 + spectralScatter) * 0.4;
}

// ============================================
// LAYER D: KARMIC GLYPHS
// ============================================
vec3 karmicGlyphs(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 32–48 glyph nodes arranged circularly
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph circle SDF
  float glyphRadius = 0.18;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // Glyph pulse equation: sin(time*2.4 + index*0.3)*0.15 (already in vertex)
  
  // Bass → glyph jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*22 + time)*uHigh*0.3
  float sparkle = fbm(uv * 22.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → glyph flash pulse: uBlessingWaveProgress * 0.9
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
  
  return glyphColor * glyphMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

// ============================================
// LAYER E: ROTATING MANTRA BANDS
// ============================================
vec3 rotatingMantraBands(vec2 uv) {
  if (vMantraBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2 rotating bands of mantra-like symbols
  // Color: White → Violet → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  float gradientT = vGradientProgress; // Based on band index
  
  // Bands scroll at rate = scroll*0.3 + 0.05 (already in vertex)
  
  // Breath → band scale pulse (already in vertex)
  
  // High → shimmer dust: fbm(uv*9 + time)*uHigh*0.25
  float shimmerDust = fbm(uv * 9.0 + uTime * 0.3) * uHigh * 0.25;
  shimmerDust = smoothstep(0.7, 1.0, shimmerDust);
  
  // White → Violet → Gold gradient
  vec3 bandColor;
  if (gradientT < 0.5) {
    bandColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    bandColor = mix(violetColor, goldColor, (gradientT - 0.5) * 2.0);
  }
  
  // Mantra-like symbol pattern
  float symbolPattern = sin(vAngle * 8.0 + uTime * 1.0) * 0.5 + 0.5;
  
  // Band thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return bandColor * symbolPattern * thicknessFade * (1.0 + shimmerDust) * 0.4;
}

// ============================================
// LAYER F: AURA FLAME SHELL
// ============================================
vec3 auraFlameShell(vec2 uv) {
  if (vFlameIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 1.5 unit thick shell
  // Color: Violet → Cyan
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on flame height
  
  // Flame equation: sin(angle*6.0 + time*2.2)*0.25 (already in vertex)
  
  // Breath → flame height swell (already in vertex)
  
  // Scroll → upward drift (already in vertex)
  
  // Violet → Cyan gradient
  vec3 flameColor = mix(violetColor, cyanColor, gradientT * 0.8);
  
  // Flame shell thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return flameColor * thicknessFade * 0.3;
}

// ============================================
// LAYER G: MANDALA DUST FIELD
// ============================================
vec3 mandalaDustField(vec2 uv) {
  if (vDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200–260 drifting dust particulates
  // Radius: 0.01-0.015
  float dustRadius = 0.0125;
  float dustDist = sdCircle(p, dustRadius);
  float dustMask = 1.0 - smoothstep(0.0, dustRadius * 2.0, dustDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*26 + time)*uHigh*0.3
  float sparkle = fbm(uv * 26.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → mandala burst flash: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / dustRadius;
  vec3 dustColor;
  if (gradientT < 0.33) {
    dustColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    dustColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return dustColor * dustMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Core Mandala Disk (base layer)
  vec3 layerA = coreMandalaDisk(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Rotating Karmic Spokes (additive blending)
  vec3 layerB = rotatingKarmicSpokes(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Outer Chakra Ring (additive blending)
  vec3 layerC = outerChakraRing(uv);
  finalColor += layerC * 0.4;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Karmic Glyphs (additive blending)
  vec3 layerD = karmicGlyphs(uv);
  finalColor += layerD * 0.7;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Rotating Mantra Bands (additive blending)
  vec3 layerE = rotatingMantraBands(uv);
  finalColor += layerE * 0.4;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Aura Flame Shell (additive blending)
  vec3 layerF = auraFlameShell(uv);
  finalColor += layerF * 0.3;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Mandala Dust Field (additive blending)
  vec3 layerG = mandalaDustField(uv);
  finalColor += layerG * 0.7;
  bloomMask = max(bloomMask, length(layerG));
  
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

