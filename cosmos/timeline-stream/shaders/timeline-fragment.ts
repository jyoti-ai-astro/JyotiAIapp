/**
 * Timeline Stream Fragment Shader
 * 
 * Phase 2 — Section 23: COSMIC TIMELINE STREAM ENGINE
 * Timeline Stream Engine (E27)
 * 
 * 3-layer timeline stream: Past Echo Particles, Present Moment Ribbon, Future Glimmer Lines
 */

export const timelineFragmentShader = `
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
varying float vLineIndex;
varying float vTimeIndex;
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
// LAYER A: PAST ECHO PARTICLES
// ============================================
vec3 pastEchoParticles(vec2 uv) {
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
  
  // Color gradient: ancient gold → soft white (based on timeIndex)
  vec3 ancientGold = vec3(1.0, 0.8, 0.5);
  vec3 softWhite = vec3(1.0, 1.0, 0.95);
  vec3 particleColor = mix(ancientGold, softWhite, vTimeIndex);
  
  // High → shimmer noise
  float shimmer = fbm(uv * 8.0 + uTime * 0.5);
  shimmer = smoothstep(0.6, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  
  return particleColor * particleGlow * (1.0 + shimmer);
}

// ============================================
// LAYER B: PRESENT MOMENT RIBBON
// ============================================
vec3 presentMomentRibbon(vec2 uv) {
  if (vRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Thin horizontal ribbon
  float ribbonWidth = 0.015;
  float ribbonDist = abs(p.y);
  float ribbonMask = 1.0 - smoothstep(0.0, ribbonWidth, ribbonDist);
  
  // Color: Bright white with blessing violet
  vec3 baseColor = vec3(1.0, 1.0, 1.0);
  
  // BlessingWave pulse (white → violet flash)
  vec3 blessingColor = mix(
    vec3(1.0, 1.0, 1.0),  // White
    vec3(0.8, 0.6, 1.0),  // Violet
    uBlessingWaveProgress
  );
  
  // Mid-frequency audio (vibration)
  float midVibration = sin(uTime * 5.0 + uv.x * 10.0) * uMid * 0.1;
  ribbonMask *= (1.0 + midVibration);
  
  // Breath phase affects intensity
  float breathIntensity = 0.8 + uBreathStrength * 0.2;
  
  vec3 ribbonColor = mix(baseColor, blessingColor, uBlessingWaveProgress);
  
  return ribbonColor * ribbonMask * breathIntensity;
}

// ============================================
// LAYER C: FUTURE GLIMMER LINES
// ============================================
vec3 futureGlimmerLines(vec2 uv) {
  if (vLineIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Only visible when scroll > 0.4
  if (uScroll < 0.4) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Faint vertical lines
  float lineWidth = 0.008;
  float lineDist = abs(p.x);
  float lineMask = 1.0 - smoothstep(0.0, lineWidth, lineDist);
  
  // Fade in/out based on scroll depth
  float scrollFade = smoothstep(0.4, 0.6, uScroll) * (1.0 - smoothstep(0.8, 1.0, uScroll));
  
  // High → shimmer flicker
  float shimmer = fbm(uv * 12.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.4;
  
  // BlessingWave → intensity boost
  float blessingBoost = uBlessingWaveProgress * 0.3;
  
  // Color: Violet → white shimmer
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 lineColor = mix(violetColor, whiteColor, shimmer);
  
  return lineColor * lineMask * scrollFade * (0.4 + blessingBoost);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Past Echo Particles
  vec3 layerA = pastEchoParticles(uv);
  finalColor += layerA * 0.6;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Present Moment Ribbon
  vec3 layerB = presentMomentRibbon(uv);
  finalColor += layerB * 0.7;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Future Glimmer Lines
  vec3 layerC = futureGlimmerLines(uv);
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

