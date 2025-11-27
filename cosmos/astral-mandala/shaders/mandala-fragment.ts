/**
 * Astral Mandala Fragment Shader
 * 
 * Phase 2 — Section 34: ASTRAL MANDALA ENGINE
 * Astral Mandala Engine (E38)
 * 
 * 3-layer astral mandala: Rotating Sacred Rings, Mandala Glyph Layer, Cosmic Seed Core
 */

export const mandalaFragmentShader = `
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
varying float vRingIndex;
varying float vGlyphIndex;
varying float vCoreIndex;
varying float vDistance;
varying float vRadialDistance;

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

float sdRing(vec2 p, float r, float thickness) {
  return abs(length(p) - r) - thickness;
}

// ============================================
// LAYER A: ROTATING SACRED RINGS
// ============================================
vec3 rotatingSacredRings(vec2 uv) {
  if (vRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 3-5 concentric rings with geometric subdivisions
  float ringRadius = 0.4 + vRingIndex * 0.15; // 0.4, 0.55, 0.7, 0.85
  float breathPulse = 1.0 + uBreathStrength * 0.12;
  ringRadius *= breathPulse;
  
  // Ring thickness
  float ringThickness = 0.02;
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Scroll → rotation speed (already in vertex)
  
  // Bass → harmonic wobble (already in vertex)
  
  // High → shimmering golden nodes: fbm(uv*10 + time)*uHigh*0.3
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: Gold → White gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / ringRadius;
  vec3 ringColor = mix(goldColor, whiteColor, gradientT * 0.5);
  
  return ringColor * ringMask * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: MANDALA GLYPH LAYER
// ============================================
vec3 mandalaGlyphLayer(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 12-24 glyph symbols placed radially (mobile: 12)
  float glyphRadius = 0.1;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, 0.015, glyphDist);
  
  // RotationSync → global mandala rotation (already in vertex)
  
  // BlessingWave → glyph glow burst: uBlessingWaveProgress * 0.6
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.6;
  }
  
  // Mid → glyph turbulence jitter (already in vertex)
  
  // Color: White → Violet spectral glyphs
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = dist / glyphRadius;
  vec3 glyphColor = mix(whiteColor, violetColor, gradientT * 0.5);
  
  return glyphColor * glyphMask * (1.0 + blessingGlow) * 0.8;
}

// ============================================
// LAYER C: COSMIC SEED CORE
// ============================================
vec3 cosmicSeedCore(vec2 uv) {
  if (vCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Central seed-of-life sphere
  float coreRadius = 0.1;
  float breathPulse = 1.0 + uBreathStrength * 0.18;
  coreRadius *= breathPulse;
  
  // Bass → radial flicker (already in vertex)
  
  // High → shimmer texture: fbm(uv*12 + time)*uHigh*0.4
  float shimmer = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → flash surge: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Draw core disc
  float coreDist = sdCircle(p, coreRadius);
  float coreMask = 1.0 - smoothstep(0.0, 0.01, coreDist);
  
  // Color: White → Gold → Violet core gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / coreRadius;
  vec3 coreColor;
  if (gradientT < 0.5) {
    coreColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    coreColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    coreColor = mix(coreColor, flashColor, blessingFlash);
  }
  
  return coreColor * coreMask * (1.0 + shimmer + blessingFlash);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Rotating Sacred Rings
  vec3 layerA = rotatingSacredRings(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Mandala Glyph Layer
  vec3 layerB = mandalaGlyphLayer(uv);
  finalColor += layerB * 0.8;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Cosmic Seed Core
  vec3 layerC = cosmicSeedCore(uv);
  finalColor += layerC * 0.9;
  bloomMask = max(bloomMask, length(layerC));
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.9);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

