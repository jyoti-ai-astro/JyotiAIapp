/**
 * Cosmic Fracture Fragment Shader
 * 
 * Phase 2 — Section 50: COSMIC FRACTURE ENGINE
 * Cosmic Fracture Engine (E54)
 * 
 * 3-layer cosmic fracture: Primary Fractal Shatter Plane, Secondary Prism Refraction Shards, Crystal Dust & Refracted Particles
 */

export const cosmicFractureFragmentShader = `
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
varying float vFractureIndex;
varying float vShardIndex;
varying float vCrystalIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vFractureHeight;
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
// LAYER A: PRIMARY FRACTAL SHATTER PLANE
// ============================================
vec3 primaryFractalShatterPlane(vec2 uv) {
  if (vFractureIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 22 × 14 units, 48×48 grid
  // Gradient: White → Blue → Indigo (crystal tone)
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Based on fracture height
  
  // Breath → fracture amplitude pulse (already in vertex)
  
  // Scroll → fracture spread outward (already in vertex)
  
  // Bass → shatter jitter (already in vertex)
  
  // High → sparkle refraction noise: fbm(uv*6 + time)*uHigh*0.3
  float sparkle = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.3;
  sparkle = smoothstep(0.7, 1.0, sparkle);
  
  // BlessingWave → bright white-violet crystalline flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Blue → Indigo gradient
  vec3 fractureColor;
  if (gradientT < 0.5) {
    fractureColor = mix(whiteColor, blueColor, gradientT * 2.0);
  } else {
    fractureColor = mix(blueColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash (white-violet)
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, vec3(0.8, 0.6, 1.0), 0.6);
    fractureColor = mix(fractureColor, flashColor, blessingFlash);
  }
  
  // Radial fade from center
  float radialFade = 1.0 - smoothstep(0.0, 11.0, vRadialDistance);
  
  return fractureColor * radialFade * (1.0 + sparkle) * 0.6;
}

// ============================================
// LAYER B: SECONDARY PRISM REFRACTION SHARDS
// ============================================
vec3 secondaryPrismRefractionShards(vec2 uv) {
  if (vShardIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8-14 shards, sharp triangular prisms
  // Prismatic colors: Cyan → Blue → Violet
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on prism height
  
  // RotationSync → directional shard tilt (already in vertex)
  
  // Breath → shard scale expansion (already in vertex)
  
  // Mid → turbulence injection (already in vertex)
  
  // High → spectral refraction shimmer: fbm(vec2(angle*3, radius*1.2)+time)*uHigh*0.25
  float spectralShimmer = fbm(vec2(vAngle * 3.0, vRadius * 1.2) + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // BlessingWave → shard flash pulse (cyan → violet): uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Cyan → Blue → Violet gradient
  vec3 shardColor;
  if (gradientT < 0.5) {
    shardColor = mix(cyanColor, blueColor, gradientT * 2.0);
  } else {
    shardColor = mix(blueColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Shard thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return shardColor * thicknessFade * (1.0 + spectralShimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER C: CRYSTAL DUST & REFRACTED PARTICLES
// ============================================
vec3 crystalDustRefractedParticles(vec2 uv) {
  if (vCrystalIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200-320 micro-crystal particles (mobile: 150)
  // Radius: 0.01-0.015
  float crystalRadius = 0.0125;
  float crystalDist = sdCircle(p, crystalRadius);
  float crystalMask = 1.0 - smoothstep(0.0, crystalRadius * 2.0, crystalDist);
  
  // Breath → radial expansion (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → spectral sparkle noise: fbm(uv*22 + time)*uHigh*0.3
  float sparkle = fbm(uv * 22.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → bright flash: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Color: White–Cyan–Violet crystal sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / crystalRadius;
  vec3 crystalColor;
  if (gradientT < 0.33) {
    crystalColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    crystalColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return crystalColor * crystalMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Fractal Shatter Plane (base layer)
  vec3 layerA = primaryFractalShatterPlane(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Secondary Prism Refraction Shards (additive blending)
  vec3 layerB = secondaryPrismRefractionShards(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Crystal Dust & Refracted Particles (additive blending)
  vec3 layerC = crystalDustRefractedParticles(uv);
  finalColor += layerC * 0.7;
  bloomMask = max(bloomMask, length(layerC));
  
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

