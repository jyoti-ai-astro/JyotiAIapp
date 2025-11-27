/**
 * Celestial Horizon Fragment Shader
 * 
 * Phase 2 — Section 41: CELESTIAL HORIZON ENGINE
 * Celestial Horizon Engine (E45)
 * 
 * 3-layer celestial horizon: Deep Space Gradient Plane, Horizon Light Band, Star Fog Particles
 */

export const horizonFragmentShader = `
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
varying float vPlaneIndex;
varying float vBandIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
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
// LAYER A: DEEP SPACE GRADIENT PLANE
// ============================================
vec3 deepSpaceGradientPlane(vec2 uv) {
  if (vPlaneIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Infinite horizontal plane behind all engines
  // Gradient: Cosmic Blue → Violet → Near Black
  vec3 cosmicBlue = vec3(0.1, 0.2, 0.4);
  vec3 violet = vec3(0.2, 0.1, 0.3);
  vec3 nearBlack = vec3(0.02, 0.02, 0.05);
  
  float gradientT = vGradientProgress; // Vertical gradient (0-1)
  
  // Breath → slow gradient pulsation (already in vertex)
  
  // Scroll → parallax shift (already in vertex)
  
  // Bass → surface ripple wobble (already in vertex)
  
  // High → subtle noise shimmer (nebula pulses): fbm(uv*4 + time)*uHigh*0.2
  float nebulaShimmer = fbm(uv * 4.0 + uTime * 0.3) * uHigh * 0.2;
  nebulaShimmer = smoothstep(0.6, 1.0, nebulaShimmer);
  
  // BlessingWave → global brightness swell: uBlessingWaveProgress * 0.4
  float blessingSwell = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingSwell = uBlessingWaveProgress * 0.4;
  }
  
  // Blue → Violet → Black cosmic interpolation
  vec3 gradientColor;
  if (gradientT < 0.5) {
    gradientColor = mix(cosmicBlue, violet, gradientT * 2.0);
  } else {
    gradientColor = mix(violet, nearBlack, (gradientT - 0.5) * 2.0);
  }
  
  return gradientColor * (1.0 + nebulaShimmer + blessingSwell) * 0.6;
}

// ============================================
// LAYER B: HORIZON LIGHT BAND
// ============================================
vec3 horizonLightBand(vec2 uv) {
  if (vBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Thin glowing band across the horizontal axis
  float bandThickness = 0.15;
  float bandDist = abs(uv.y - 0.5) * bandThickness * 2.0;
  float bandMask = 1.0 - smoothstep(0.0, bandThickness, bandDist);
  
  // Breath → band thickness pulse (already in vertex)
  
  // Scroll → band vertical drift (already in vertex)
  
  // Bass → band wave distortion (already in vertex)
  
  // High → shimmering edge streaks: fbm(uv*6 + time)*uHigh*0.3
  float edgeShimmer = 0.0;
  if (bandDist > bandThickness * 0.7) {
    float shimmer = fbm(uv * 6.0 + uTime) * uHigh * 0.3;
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer;
  }
  
  // BlessingWave → bright white–violet flash pulse: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Color: Gold → White → Violet gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = uv.x; // Horizontal gradient
  vec3 bandColor;
  if (gradientT < 0.5) {
    bandColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    bandColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Glow falloff
  float glowFalloff = 1.0 - smoothstep(0.0, bandThickness, bandDist);
  
  return bandColor * bandMask * glowFalloff * (1.0 + edgeShimmer + blessingFlash) * 0.5;
}

// ============================================
// LAYER C: STAR FOG PARTICLES
// ============================================
vec3 starFogParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 120-200 micro star specks (mobile: 80)
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Breath → parallax amplitude (already in vertex)
  
  // Scroll → drift speed (already in vertex)
  
  // Bass → flicker noise (already in vertex)
  
  // High → sparkle boost: fbm(uv*10 + time)*uHigh*0.3
  float sparkle = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → momentary flash: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Color: White–Gold tint
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  float gradientT = dist / particleRadius;
  vec3 particleColor = mix(whiteColor, goldColor, gradientT * 0.4);
  
  return particleColor * particleMask * (1.0 + sparkle + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Deep Space Gradient Plane (base layer, no additive)
  vec3 layerA = deepSpaceGradientPlane(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Horizon Light Band (additive blending)
  vec3 layerB = horizonLightBand(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Star Fog Particles (additive blending)
  vec3 layerC = starFogParticles(uv);
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

