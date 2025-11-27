/**
 * Astral Bloom Fragment Shader
 * 
 * Phase 2 — Section 39: ASTRAL BLOOM ENGINE
 * Astral Bloom Engine (E43)
 * 
 * 3-layer astral bloom: Radial Bloom Burst, Shockwave Ring, Bloom Dust Particles
 */

export const bloomFragmentShader = `
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
varying float vDiscIndex;
varying float vRingIndex;
varying float vParticleIndex;
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
// LAYER A: RADIAL BLOOM BURST
// ============================================
vec3 radialBloomBurst(vec2 uv) {
  if (vDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Expanding radial disc
  // Base radius: 0.3 → expands to 2.0
  float baseRadius = 0.3;
  float maxRadius = 2.0;
  float scrollExpansion = uScroll * 0.5;
  float bloomRadius = baseRadius + (maxRadius - baseRadius) * scrollExpansion;
  
  // Breath → bloom intensity pulse
  float breathPulse = 1.0 + uBreathStrength * 0.15;
  bloomRadius *= breathPulse;
  
  // Triggered by scroll thresholds + blessingWave
  float trigger = max(uScroll, uBlessingWaveProgress);
  bloomRadius *= 1.0 + trigger * 0.3;
  
  // Draw disc
  float discDist = sdCircle(p, bloomRadius);
  float discMask = 1.0 - smoothstep(0.0, 0.02, discDist);
  
  // Bass → shockwave ripple jitter (already in vertex)
  
  // High → sparkle bloom halo: fbm(uv*10 + time)*uHigh*0.4
  float sparkle = fbm(uv * 10.0 + uTime) * uHigh * 0.4;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Multi-octave shimmer
  float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: Gold → White → Violet gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / bloomRadius;
  vec3 discColor;
  if (gradientT < 0.5) {
    discColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    discColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Breath intensity boost
  float breathIntensity = 1.0 + uBreathStrength * 0.2;
  
  return discColor * discMask * breathIntensity * (1.0 + sparkle + shimmer) * 0.8;
}

// ============================================
// LAYER B: SHOCKWAVE RING
// ============================================
vec3 shockwaveRing(vec2 uv) {
  if (vRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Expanding thin ring
  // Thickness: 0.02
  float ringThickness = 0.02;
  float breathWidth = 1.0 + uBreathStrength * 0.1;
  ringThickness *= breathWidth;
  
  // Radius loops with mod()
  float trigger = max(uScroll, uBlessingWaveProgress);
  float ringRadius = 0.3 + trigger * 1.5;
  ringRadius = mod(ringRadius, 2.0);
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Breath → ring width pulse (already in vertex)
  
  // Bass → ring vibration (already in vertex)
  
  // High → shimmering edges: fbm(uv*8 + time)*uHigh*0.3
  float edgeShimmer = 0.0;
  if (ringDist > -0.01 && ringDist < 0.02) {
    float shimmer = fbm(uv * 8.0 + uTime) * uHigh * 0.3;
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer;
  }
  
  // BlessingWave pulse
  float blessingPulse = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingPulse = uBlessingWaveProgress * 0.5;
  }
  
  // Color: White → Blue → Violet spectral ring
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / ringRadius;
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, blueColor, gradientT * 2.0);
  } else {
    ringColor = mix(blueColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return ringColor * ringMask * (1.0 + edgeShimmer + blessingPulse) * 0.6;
}

// ============================================
// LAYER C: BLOOM DUST PARTICLES
// ============================================
vec3 bloomDustParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 100-160 particles (mobile: 60)
  // Particle radius: 0.01-0.02
  float particleRadius = 0.015;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Breath → acceleration (already in vertex)
  
  // Scroll → outward drag (already in vertex)
  
  // Bass → flicker (already in vertex)
  
  // High → sparkle noise: fbm(uv*12 + time)*uHigh*0.4
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash white-violet surge: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Color: White–Gold sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  float gradientT = dist / particleRadius;
  vec3 particleColor = mix(whiteColor, goldColor, gradientT * 0.5);
  
  // Add blessing flash
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    particleColor = mix(particleColor, flashColor, blessingFlash);
  }
  
  return particleColor * particleMask * (1.0 + sparkle + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Radial Bloom Burst
  vec3 layerA = radialBloomBurst(uv);
  finalColor += layerA * 0.8;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Shockwave Ring
  vec3 layerB = shockwaveRing(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Bloom Dust Particles
  vec3 layerC = bloomDustParticles(uv);
  finalColor += layerC * 0.7;
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

