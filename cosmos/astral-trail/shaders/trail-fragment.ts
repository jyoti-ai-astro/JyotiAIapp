/**
 * Astral Trail Fragment Shader
 * 
 * Phase 2 — Section 28: ASTRAL TRAIL ENGINE
 * Astral Trail Engine (E32)
 * 
 * 3-layer astral trail: Astral Particles Trail, Astral Ribbon Stream, Quantum Echo Lines
 */

export const trailFragmentShader = `
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
varying float vEchoLineIndex;
varying float vTrailT;
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
// LAYER A: ASTRAL PARTICLES TRAIL
// ============================================
vec3 astralParticlesTrail(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Gold-white luminescent particles
  float particleRadius = 0.03;
  float particleDist = sdCircle(p, particleRadius);
  float particleGlow = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // High → shimmer flicker on particle edges
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // Color: Gold-white luminescent
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 particleColor = mix(goldColor, whiteColor, vTrailT);
  
  return particleColor * particleGlow * (1.0 + shimmer);
}

// ============================================
// LAYER B: ASTRAL RIBBON STREAM
// ============================================
vec3 astralRibbonStream(vec2 uv) {
  if (vRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Fluid ribbon
  float ribbonWidth = 0.02;
  float ribbonDist = abs(p.x);
  float ribbonMask = 1.0 - smoothstep(0.0, ribbonWidth, ribbonDist);
  
  // BlessingWave → strong white flash through ribbon
  float whiteFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    float flashProgress = abs(sin(vTrailT * 6.28318 + uTime * 2.0));
    whiteFlash = flashProgress * uBlessingWaveProgress * 0.8;
  }
  
  // Mid → turbulence wobble (already in vertex)
  
  // Color: Gold → White → Violet gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec3 ribbonColor;
  if (vTrailT < 0.5) {
    ribbonColor = mix(goldColor, whiteColor, vTrailT * 2.0);
  } else {
    ribbonColor = mix(whiteColor, violetColor, (vTrailT - 0.5) * 2.0);
  }
  
  // Add white flash
  ribbonColor = mix(ribbonColor, whiteColor, whiteFlash);
  
  return ribbonColor * ribbonMask * 0.7;
}

// ============================================
// LAYER C: QUANTUM ECHO LINES
// ============================================
vec3 quantumEchoLines(vec2 uv) {
  if (vEchoLineIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Faint lines that show past motion trajectory
  float lineWidth = 0.01;
  float lineDist = abs(p.x);
  float lineMask = 1.0 - smoothstep(0.0, lineWidth, lineDist);
  
  // Fade based on scroll: visible only when uScroll > 0.25
  float scrollFade = smoothstep(0.25, 0.45, uScroll);
  
  // High → shimmer pulses along line
  float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.2;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: Violet-white subtle glow
  vec3 violetColor = vec3(0.7, 0.5, 1.0);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 lineColor = mix(violetColor, whiteColor, vTrailT * 0.5);
  
  return lineColor * lineMask * scrollFade * (1.0 + shimmer) * 0.4;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Astral Particles Trail
  vec3 layerA = astralParticlesTrail(uv);
  finalColor += layerA * 0.6;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Astral Ribbon Stream
  vec3 layerB = astralRibbonStream(uv);
  finalColor += layerB * 0.7;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Quantum Echo Lines
  vec3 layerC = quantumEchoLines(uv);
  finalColor += layerC * 0.5;
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

