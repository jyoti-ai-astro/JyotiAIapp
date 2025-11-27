/**
 * Memory Stream Fragment Shader
 * 
 * Phase 2 — Section 21: COSMIC MEMORY STREAM ENGINE
 * Memory Stream Engine (E25)
 * 
 * 3-layer memory stream: Thought Particles, Memory Ribbons, Memory Echo Glyphs
 */

export const memoryStreamFragmentShader = `
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
varying float vParticleIndex;
varying float vRibbonIndex;
varying float vGlyphIndex;
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
// LAYER A: THOUGHT PARTICLES
// ============================================
vec3 thoughtParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Particle radius
  float particleRadius = 0.02;
  
  // Distance from particle center
  float particleDist = sdCircle(p, particleRadius);
  float particleGlow = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Particle glow (gold→white)
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 particleColor = mix(goldColor, whiteColor, uBreathStrength);
  
  // High → shimmer flicker on particle edges
  float shimmer = sin(uTime * 20.0 + vParticleIndex * 10.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.4;
  
  // Breath → size modulation (already in vertex)
  
  return particleColor * particleGlow * (1.0 + shimmer);
}

// ============================================
// LAYER B: MEMORY RIBBONS
// ============================================
vec3 memoryRibbons(vec2 uv) {
  if (vRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Ribbon follows spline (approximate as distance from center line)
  float ribbonWidth = 0.015;
  float ribbonDist = abs(p.y); // Distance from center line
  float ribbonMask = 1.0 - smoothstep(0.0, ribbonWidth, ribbonDist);
  
  // Color: gold → white gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = uv.x; // Gradient along ribbon
  vec3 ribbonColor = mix(goldColor, whiteColor, gradientT);
  
  // BlessingWave → bright golden pulse wave traveling along ribbons
  float blessingPulse = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    // Pulse travels along ribbon
    float pulsePos = mod(uTime * 0.5 + uv.x * 2.0, 1.0);
    float pulseDist = abs(pulsePos - uBlessingWaveProgress);
    blessingPulse = 1.0 - smoothstep(0.0, 0.2, pulseDist);
    blessingPulse *= uBlessingWaveProgress * 0.4;
  }
  
  return ribbonColor * ribbonMask * (1.0 + blessingPulse);
}

// ============================================
// LAYER C: MEMORY ECHO GLYPHS
// ============================================
vec3 memoryEchoGlyphs(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph size
  float glyphRadius = 0.08;
  
  // Distance from glyph center
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphGlow = 1.0 - smoothstep(0.0, glyphRadius * 1.5, glyphDist);
  
  // Glyph glow with shimmer flicker
  vec3 glyphColor = vec3(1.0, 0.9, 0.7);
  
  // High → glyph shimmer
  float shimmer = fbm(uv * 8.0 + uTime * 0.5);
  shimmer = smoothstep(0.6, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  
  // Glyph pattern (simple circle with inner pattern)
  float innerPattern = sin(dist * 20.0 + uTime * 2.0) * 0.5 + 0.5;
  innerPattern = smoothstep(0.5, 1.0, innerPattern);
  
  return glyphColor * glyphGlow * (1.0 + shimmer) * (0.7 + innerPattern * 0.3);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Thought Particles
  vec3 layerA = thoughtParticles(uv);
  finalColor += layerA * 0.6;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Memory Ribbons
  vec3 layerB = memoryRibbons(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Memory Echo Glyphs
  vec3 layerC = memoryEchoGlyphs(uv);
  finalColor += layerC * 0.4;
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

