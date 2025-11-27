/**
 * Karma Wheel Fragment Shader
 * 
 * Phase 2 — Section 36: KARMA WHEEL ENGINE
 * Karma Wheel Engine (E40)
 * 
 * 3-layer karma wheel: Outer Wheel of Intent, Middle Wheel of Action, Inner Wheel of Consequence
 */

export const karmaFragmentShader = `
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
varying float vOuterRingIndex;
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
// LAYER A: OUTER WHEEL OF INTENT
// ============================================
vec3 outerWheelOfIntent(vec2 uv) {
  if (vOuterRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Large 32-48 segment ring
  float ringRadius = 0.9;
  float breathExpansion = 1.0 + uBreathStrength * 0.12;
  ringRadius *= breathExpansion;
  
  // Thickness: 0.025
  float ringThickness = 0.025;
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Scroll → rotation speed (already in vertex)
  
  // Bass → harmonic wobble (already in vertex)
  
  // High → shimmer nodes along edge: fbm(uv*10 + time)*uHigh*0.3
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
// LAYER B: MIDDLE WHEEL OF ACTION
// ============================================
vec3 middleWheelOfAction(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 12-20 rotating glyph icons (mobile: 10)
  float glyphRadius = 0.08;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, 0.015, glyphDist);
  
  // RotationSync → glyph rotation (already in vertex)
  
  // Scroll → spiral outward (already in vertex)
  
  // Mid → turbulence jitter (already in vertex)
  
  // BlessingWave → flash pulse on glyphs: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = dist / glyphRadius;
  vec3 glyphColor = mix(whiteColor, violetColor, gradientT * 0.5);
  
  return glyphColor * glyphMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER C: INNER WHEEL OF CONSEQUENCE
// ============================================
vec3 innerWheelOfConsequence(vec2 uv) {
  if (vCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Central mandala disc (seed-like)
  float coreRadius = 0.22;
  float breathPulse = 1.0 + uBreathStrength * 0.18;
  coreRadius *= breathPulse;
  
  // Bass → flicker (already in vertex)
  
  // High → shimmering texture: fbm(uv*12 + time)*uHigh*0.4
  float shimmer = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → bright white/violet flash: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Draw core disc
  float coreDist = sdCircle(p, coreRadius);
  float coreMask = 1.0 - smoothstep(0.0, 0.01, coreDist);
  
  // Color: White → Gold → Violet gradient
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
  
  // Layer A: Outer Wheel of Intent
  vec3 layerA = outerWheelOfIntent(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Middle Wheel of Action
  vec3 layerB = middleWheelOfAction(uv);
  finalColor += layerB * 0.8;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Inner Wheel of Consequence
  vec3 layerC = innerWheelOfConsequence(uv);
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

