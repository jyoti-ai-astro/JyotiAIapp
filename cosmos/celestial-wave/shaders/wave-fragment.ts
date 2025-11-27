/**
 * Celestial Wave Fragment Shader
 * 
 * Phase 2 — Section 42: CELESTIAL WAVE ENGINE
 * Celestial Wave Engine (E46)
 * 
 * 3-layer celestial wave: Primary Astral Wave Field, Secondary Cross-Wave Layer, Wave Mist Particles
 */

export const waveFragmentShader = `
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
varying float vWaveIndex;
varying float vCrossWaveIndex;
varying float vMistIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWaveHeight;
varying float vGradientProgress;

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
// LAYER A: PRIMARY ASTRAL WAVE FIELD
// ============================================
vec3 primaryAstralWaveField(vec2 uv) {
  if (vWaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Massive plane: 20 × 12 units
  // Gradient: Blue → Violet → Black
  vec3 blueColor = vec3(0.1, 0.2, 0.4);
  vec3 violetColor = vec3(0.2, 0.1, 0.3);
  vec3 blackColor = vec3(0.02, 0.02, 0.05);
  
  float gradientT = vGradientProgress; // Based on wave height
  
  // Breath → wave amplitude pulse (already in vertex)
  
  // Scroll → wave direction drift (already in vertex)
  
  // Bass → wave ripple vibration (already in vertex)
  
  // High → shimmer noise: fbm(uv*6 + time)*uHigh*0.25
  float shimmer = fbm(uv * 6.0 + uTime * 0.4) * uHigh * 0.25;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → brightness bloom over crests: uBlessingWaveProgress * 0.5
  float blessingBloom = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    // Bloom stronger on wave crests (higher wave height)
    float crestFactor = smoothstep(0.0, 0.2, vWaveHeight);
    blessingBloom = uBlessingWaveProgress * 0.5 * crestFactor;
  }
  
  // Blue → Violet → Black gradient
  vec3 gradientColor;
  if (gradientT < 0.5) {
    gradientColor = mix(blueColor, violetColor, gradientT * 2.0);
  } else {
    gradientColor = mix(violetColor, blackColor, (gradientT - 0.5) * 2.0);
  }
  
  return gradientColor * (1.0 + shimmer + blessingBloom) * 0.7;
}

// ============================================
// LAYER B: SECONDARY CROSS-WAVE LAYER
// ============================================
vec3 secondaryCrossWaveLayer(vec2 uv) {
  if (vCrossWaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Perpendicular wave pattern
  // Violet spectral glow
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  
  // RotationSync → wave rotation offset (already in vertex)
  
  // Breath → mild amplitude boost (already in vertex)
  
  // Mid → turbulence noise (fbm) (already in vertex)
  
  // High → shimmer pulses: fbm(uv*8 + time)*uHigh*0.3
  float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → wave-wide flash pulse: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Cross-wave glow streaks
  float waveIntensity = abs(vWaveHeight) * 2.0; // Intensity based on wave height
  vec3 crossColor = mix(violetColor, whiteColor, waveIntensity * 0.5);
  
  return crossColor * (1.0 + shimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER C: WAVE MIST PARTICLES
// ============================================
vec3 waveMistParticles(vec2 uv) {
  if (vMistIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 80-140 floating mist sprites (mobile: 60)
  // Radius: 0.02
  float mistRadius = 0.02;
  float mistDist = sdCircle(p, mistRadius);
  float mistMask = 1.0 - smoothstep(0.0, mistRadius * 2.0, mistDist);
  
  // Breath → drift amplitude (already in vertex)
  
  // Scroll → drift speed (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → sparkle mist noise: fbm(uv*10 + time)*uHigh*0.3
  float sparkle = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → mist flash: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Color: White–Blue–Violet haze
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / mistRadius;
  vec3 mistColor;
  if (gradientT < 0.5) {
    mistColor = mix(whiteColor, blueColor, gradientT * 2.0);
  } else {
    mistColor = mix(blueColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return mistColor * mistMask * (1.0 + sparkle + blessingFlash) * 0.6;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Astral Wave Field (base layer)
  vec3 layerA = primaryAstralWaveField(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Secondary Cross-Wave Layer (additive blending)
  vec3 layerB = secondaryCrossWaveLayer(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Wave Mist Particles (additive blending)
  vec3 layerC = waveMistParticles(uv);
  finalColor += layerC * 0.6;
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

