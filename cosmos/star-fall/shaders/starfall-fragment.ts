/**
 * StarFall Fragment Shader
 * 
 * Phase 2 — Section 40: STARFALL ENGINE
 * StarFall Engine (E44)
 * 
 * 3-layer starfall: Meteoric Light Streaks, Falling Spark Particles, Impact Glow Bursts
 */

export const starfallFragmentShader = `
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
varying float vStreakIndex;
varying float vSparkIndex;
varying float vGlowIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vStreakProgress;

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
// LAYER A: METEORIC LIGHT STREAKS
// ============================================
vec3 meteoricLightStreaks(vec2 uv) {
  if (vStreakIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Streak thickness: 0.015
  float streakThickness = 0.015;
  float streakDist = abs(uv.x - 0.5) * streakThickness * 2.0;
  float streakMask = 1.0 - smoothstep(0.0, streakThickness, streakDist);
  
  // Breath → streak-length pulse (already in vertex)
  
  // Scroll → fall acceleration (already in vertex)
  
  // Bass → streak jitter wobble (already in vertex)
  
  // High → shimmering trail noise: fbm(uv*8 + time)*uHigh*0.3
  float trailShimmer = fbm(uv * 8.0 + uTime) * uHigh * 0.3;
  trailShimmer = smoothstep(0.7, 1.0, trailShimmer);
  
  // BlessingWave → sudden brightness surge: uBlessingWaveProgress * 0.6
  float blessingSurge = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingSurge = uBlessingWaveProgress * 0.6;
  }
  
  // Color: Gold → White → Blue gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  
  float gradientT = vStreakProgress; // Progress along streak (0-1)
  vec3 streakColor;
  if (gradientT < 0.5) {
    streakColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    streakColor = mix(whiteColor, blueColor, (gradientT - 0.5) * 2.0);
  }
  
  // Fade along streak length
  float fade = 1.0 - smoothstep(0.0, 0.1, abs(uv.y - 0.5));
  
  return streakColor * streakMask * fade * (1.0 + trailShimmer + blessingSurge) * 0.7;
}

// ============================================
// LAYER B: FALLING SPARK PARTICLES
// ============================================
vec3 fallingSparkParticles(vec2 uv) {
  if (vSparkIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Radius: 0.01-0.02
  float sparkRadius = 0.015;
  float sparkDist = sdCircle(p, sparkRadius);
  float sparkMask = 1.0 - smoothstep(0.0, sparkRadius * 2.0, sparkDist);
  
  // Breath → velocity modulation (already in vertex)
  
  // Scroll → drag multiplier (already in vertex)
  
  // Bass → flicker noise (already in vertex)
  
  // High → sparkle texture: fbm(uv*12 + time)*uHigh*0.4
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash-boosted brightness: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Color: White–Gold mini sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  float gradientT = dist / sparkRadius;
  vec3 sparkColor = mix(whiteColor, goldColor, gradientT * 0.5);
  
  return sparkColor * sparkMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

// ============================================
// LAYER C: IMPACT GLOW BURSTS
// ============================================
vec3 impactGlowBursts(vec2 uv) {
  if (vGlowIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glow radius: 0.08-0.16
  float baseGlowRadius = 0.08;
  float maxGlowRadius = 0.16;
  float breathPulse = 1.0 + uBreathStrength * 0.1;
  float glowRadius = baseGlowRadius + (maxGlowRadius - baseGlowRadius) * breathPulse;
  
  // Draw radial glow
  float glowDist = sdCircle(p, glowRadius);
  float glowMask = 1.0 - smoothstep(0.0, glowRadius * 0.5, glowDist);
  
  // Breath → Glow radius pulse (already in vertex)
  
  // Bass → flicker: sin(time*4 + index*2)*uBass*0.2
  float bassFlicker = sin(uTime * 4.0 + vGlowIndex * 2.0) * uBass * 0.2;
  glowMask *= 1.0 + bassFlicker * 0.1;
  
  // High → glow shimmer: fbm(uv*6 + time)*uHigh*0.3
  float glowShimmer = fbm(uv * 6.0 + uTime) * uHigh * 0.3;
  glowShimmer = smoothstep(0.7, 1.0, glowShimmer);
  
  // BlessingWave → flash blast: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = dist / glowRadius;
  vec3 glowColor = mix(whiteColor, violetColor, gradientT);
  
  // Soft radial gradient fade
  float radialFade = 1.0 - smoothstep(0.0, glowRadius, dist);
  
  return glowColor * glowMask * radialFade * (1.0 + glowShimmer + blessingFlash) * 0.6;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Meteoric Light Streaks
  vec3 layerA = meteoricLightStreaks(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Falling Spark Particles
  vec3 layerB = fallingSparkParticles(uv);
  finalColor += layerB * 0.8;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Impact Glow Bursts
  vec3 layerC = impactGlowBursts(uv);
  finalColor += layerC * 0.6;
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

