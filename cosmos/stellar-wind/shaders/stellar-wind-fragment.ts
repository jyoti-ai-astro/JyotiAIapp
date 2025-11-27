/**
 * Stellar Wind Fragment Shader
 * 
 * Phase 2 — Section 46: STELLAR WIND SHEAR ENGINE
 * Stellar Wind Engine (E50)
 * 
 * 3-layer stellar wind: High-Altitude Wind Sheets, Cross-Wind Ribbons, Wind Dust Streams
 */

export const stellarWindFragmentShader = `
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
varying float vWindSheetIndex;
varying float vRibbonIndex;
varying float vDustIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWindHeight;
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
// LAYER A: HIGH-ALTITUDE WIND SHEETS
// ============================================
vec3 highAltitudeWindSheets(vec2 uv) {
  if (vWindSheetIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Two massive diagonal wind sheets
  // Color: Cyan → White streaks
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  
  float gradientT = vGradientProgress; // Based on wind height
  
  // Breath → amplitude boost (already in vertex)
  
  // Scroll → directional speed-up (already in vertex)
  
  // Bass → jitter vibration (already in vertex)
  
  // High → shimmer pulses: fbm(uv*5 + time)*uHigh*0.3
  float shimmer = fbm(uv * 5.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → bright wind surge (white–violet): uBlessingWaveProgress * 0.7
  float blessingSurge = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingSurge = uBlessingWaveProgress * 0.7;
  }
  
  // Cyan → White gradient
  vec3 gradientColor = mix(cyanColor, whiteColor, gradientT);
  
  // Add white-violet surge
  if (blessingSurge > 0.0) {
    vec3 surgeColor = mix(whiteColor, vec3(0.8, 0.6, 1.0), 0.5);
    gradientColor = mix(gradientColor, surgeColor, blessingSurge);
  }
  
  // Wind streak pattern
  float streakPattern = sin(uv.x * 4.0 + uv.y * 2.0 + uTime * 1.0) * 0.5 + 0.5;
  gradientColor *= streakPattern;
  
  return gradientColor * (1.0 + shimmer) * 0.6;
}

// ============================================
// LAYER B: CROSS-WIND RIBBONS
// ============================================
vec3 crossWindRibbons(vec2 uv) {
  if (vRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Fast-moving thin ribbons
  // Color: White → Blue → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ribbon height
  
  // RotationSync → directional skew (already in vertex)
  
  // Breath → amplitude broadening (already in vertex)
  
  // Mid → turbulence via fbm (already in vertex)
  
  // High → spectral shimmer: fbm(uv*6 + time)*uHigh*0.3
  float spectralShimmer = fbm(uv * 6.0 + uTime * 0.5) * uHigh * 0.3;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // BlessingWave → ribbon flash: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // White → Blue → Violet gradient
  vec3 ribbonColor;
  if (gradientT < 0.5) {
    ribbonColor = mix(whiteColor, blueColor, gradientT * 2.0);
  } else {
    ribbonColor = mix(blueColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ribbon pattern
  float ribbonPattern = sin((uv.x + uv.y) * 6.0 + uTime * 2.0) * 0.5 + 0.5;
  ribbonColor *= ribbonPattern;
  
  return ribbonColor * (1.0 + spectralShimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER C: WIND DUST STREAMS
// ============================================
vec3 windDustStreams(vec2 uv) {
  if (vDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 160-260 micro dust particles (mobile: 110)
  // Radius: 0.01-0.015
  float dustRadius = 0.0125;
  float dustDist = sdCircle(p, dustRadius);
  float dustMask = 1.0 - smoothstep(0.0, dustRadius * 2.0, dustDist);
  
  // Breath → vertical modulation (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*12 + time)*uHigh*0.3
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Color: White–Cyan micro sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  float gradientT = dist / dustRadius;
  vec3 dustColor = mix(whiteColor, cyanColor, gradientT * 0.4);
  
  return dustColor * dustMask * (1.0 + sparkle + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: High-Altitude Wind Sheets (base layer)
  vec3 layerA = highAltitudeWindSheets(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Cross-Wind Ribbons (additive blending)
  vec3 layerB = crossWindRibbons(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Wind Dust Streams (additive blending)
  vec3 layerC = windDustStreams(uv);
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

