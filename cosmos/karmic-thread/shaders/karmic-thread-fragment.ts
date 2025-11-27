/**
 * Karmic Thread Fragment Shader
 * 
 * Phase 2 — Section 25: COSMIC KARMIC THREAD ENGINE
 * Karmic Thread Engine (E29)
 * 
 * 3-layer karmic thread: Root Karmic Thread, Parallel Destiny Threads, Karmic Knot Glyphs
 */

export const karmicThreadFragmentShader = `
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
varying float vRootThreadIndex;
varying float vParallelThreadIndex;
varying float vGlyphIndex;
varying float vThreadT;
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

// ============================================
// LAYER A: ROOT KARMIC THREAD
// ============================================
vec3 rootKarmicThread(vec2 uv) {
  if (vRootThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Smooth golden root thread
  float threadWidth = 0.01;
  
  // Breath → pulsating thickness: baseThickness * (1.0 + uBreathStrength * 0.2)
  float breathThickness = threadWidth * (1.0 + uBreathStrength * 0.2);
  
  // Distance from thread center line
  float threadDist = abs(p.x);
  float threadMask = 1.0 - smoothstep(0.0, breathThickness, threadDist);
  
  // Color: Gold → White gradient along thread
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = vThreadT; // 0 to 1 along thread
  vec3 threadColor = mix(goldColor, whiteColor, gradientT);
  
  return threadColor * threadMask;
}

// ============================================
// LAYER B: PARALLEL DESTINY THREADS
// ============================================
vec3 parallelDestinyThreads(vec2 uv) {
  if (vParallelThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Thinner secondary threads
  float threadWidth = 0.008;
  float threadDist = abs(p.x);
  float threadMask = 1.0 - smoothstep(0.0, threadWidth, threadDist);
  
  // Thread color: Pale gold with violet pulse highlights
  vec3 paleGold = vec3(1.0, 0.9, 0.7);
  vec3 violetPulse = vec3(0.8, 0.6, 1.0);
  
  // BlessingWave → luminous pulse traveling upward
  // pulse = abs(sin(time*4.0 + uBlessingWaveProgress * 6.28))
  float pulse = abs(sin(uTime * 4.0 + vThreadT * 6.28318));
  pulse = smoothstep(0.7, 1.0, pulse);
  pulse *= uBlessingWaveProgress;
  
  vec3 threadColor = mix(paleGold, violetPulse, pulse);
  
  return threadColor * threadMask * 0.6;
}

// ============================================
// LAYER C: KARMIC KNOT GLYPHS
// ============================================
vec3 karmicKnotGlyphs(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Small glyphs ("knots of fate")
  float glyphRadius = 0.04;
  
  // Distance from glyph center
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphGlow = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // High → shimmer sparkles: fbm(uv*15 + time) * uHigh * 0.3
  float shimmer = fbm(uv * 15.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → glyph bloom (size + glow surge)
  float blessingBloom = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingBloom = uBlessingWaveProgress * 0.4;
  }
  
  // Color: Gold with blessing glow
  vec3 glyphColor = vec3(1.0, 0.9, 0.7);
  vec3 blessingGlow = vec3(1.0, 0.95, 0.9);
  glyphColor = mix(glyphColor, blessingGlow, blessingBloom);
  
  return glyphColor * glyphGlow * (1.0 + shimmer + blessingBloom);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Root Karmic Thread
  vec3 layerA = rootKarmicThread(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Parallel Destiny Threads
  vec3 layerB = parallelDestinyThreads(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Karmic Knot Glyphs
  vec3 layerC = karmicKnotGlyphs(uv);
  finalColor += layerC * 0.6;
  bloomMask = max(bloomMask, length(layerC));
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.85);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

