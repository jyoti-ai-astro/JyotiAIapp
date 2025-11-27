/**
 * Celestial Gate Fragment Shader
 * 
 * Phase 2 — Section 32: CELESTIAL GATE ENGINE
 * Celestial Gate Engine (E36)
 * 
 * 3-layer celestial gate: Outer Gate Halo, Inner Gate Sigils, Central Gate Core
 */

export const gateFragmentShader = `
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
varying float vHaloIndex;
varying float vSigilIndex;
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
// LAYER A: OUTER GATE HALO
// ============================================
vec3 outerGateHalo(vec2 uv) {
  if (vHaloIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Massive circular halo
  float haloRadius = 0.8;
  float scrollExpansion = 1.0 + uScroll * 0.3;
  haloRadius *= scrollExpansion;
  
  // Breath → halo thickness pulse: (1.0 + uBreathStrength*0.1)
  float haloThickness = 0.03 * (1.0 + uBreathStrength * 0.1);
  
  // Draw halo ring
  float haloDist = sdRing(p, haloRadius, haloThickness);
  float haloMask = 1.0 - smoothstep(0.0, 0.01, haloDist);
  
  // Bass → halo vibration (already in vertex)
  
  // High → electric shimmer bands: fbm(uv*8 + time*0.5)*uHigh*0.3
  float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: White → Gold → Violet gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / haloRadius;
  vec3 haloColor;
  if (gradientT < 0.5) {
    haloColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    haloColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return haloColor * haloMask * (1.0 + shimmer);
}

// ============================================
// LAYER B: INNER GATE SIGILS
// ============================================
vec3 innerGateSigils(vec2 uv) {
  if (vSigilIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 12-20 rotating sigils (mobile: 8), orbiting inside halo
  float sigilRadius = 0.04;
  float sigilDist = sdCircle(p, sigilRadius);
  float sigilGlow = 1.0 - smoothstep(0.0, sigilRadius * 2.0, sigilDist);
  
  // RotationSync → sigil rotation (already in vertex)
  
  // Scroll → sigils move outward (already in vertex)
  
  // BlessingWave → sigil flash pulse: uBlessingWaveProgress*0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Mid → turbulence wobble (already in vertex)
  
  // Color: gold → violet spectral glyphs
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 sigilColor = mix(goldColor, violetColor, 0.5);
  
  return sigilColor * sigilGlow * (1.0 + blessingFlash) * 0.7;
}

// ============================================
// LAYER C: CENTRAL GATE CORE
// ============================================
vec3 centralGateCore(vec2 uv) {
  if (vCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Pulsating circular core portal behind Guru, radius ~0.35
  float coreRadius = 0.35;
  
  // Breath → scale pulse (already in vertex)
  
  // Bass → radial shock flicker (already in vertex)
  
  // High → shimmering portal texture: fbm(uv*12 + time)*uHigh*0.4
  float portalTexture = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  portalTexture = smoothstep(0.6, 1.0, portalTexture);
  
  // BlessingWave → white/violet portal flash
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Draw core disc
  float coreDist = sdCircle(p, coreRadius);
  float coreMask = 1.0 - smoothstep(0.0, 0.02, coreDist);
  
  // Color: white → violet → cosmic blue gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cosmicBlueColor = vec3(0.4, 0.6, 1.0);
  
  float gradientT = dist / coreRadius;
  vec3 coreColor;
  if (gradientT < 0.5) {
    coreColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    coreColor = mix(violetColor, cosmicBlueColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    coreColor = mix(coreColor, flashColor, blessingFlash);
  }
  
  return coreColor * coreMask * (1.0 + portalTexture + blessingFlash);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Outer Gate Halo
  vec3 layerA = outerGateHalo(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Inner Gate Sigils
  vec3 layerB = innerGateSigils(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Central Gate Core
  vec3 layerC = centralGateCore(uv);
  finalColor += layerC * 0.8;
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

