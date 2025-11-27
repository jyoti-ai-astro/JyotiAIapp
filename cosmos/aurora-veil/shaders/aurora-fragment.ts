/**
 * Aurora Veil Fragment Shader
 * 
 * Phase 2 — Section 44: AURORA VEIL ENGINE
 * Aurora Veil Engine (E48)
 * 
 * 3-layer aurora veil: Primary Aurora Curtains, Reverse Aurora Veils, Aurora Dust Particles
 */

export const auroraFragmentShader = `
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
varying float vPrimaryIndex;
varying float vReverseIndex;
varying float vDustIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vAuroraHeight;
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
// LAYER A: PRIMARY AURORA CURTAINS
// ============================================
vec3 primaryAuroraCurtains(vec2 uv) {
  if (vPrimaryIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Two massive vertical curtains
  // Colors: Blue → Cyan → Violet aurora gradient
  vec3 blueColor = vec3(0.1, 0.3, 0.6);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.6, 0.3, 0.8);
  
  float gradientT = vGradientProgress; // Based on aurora height
  
  // Breath → amplitude boost (already in vertex)
  
  // Scroll → lateral drift (already in vertex)
  
  // Bass → curtain flicker ripple (already in vertex)
  
  // Breath shimmer: fbm(uv*3 + time*0.3)*uBreathStrength*0.2
  float breathShimmer = fbm(uv * 3.0 + uTime * 0.3) * uBreathStrength * 0.2;
  breathShimmer = smoothstep(0.6, 1.0, breathShimmer);
  
  // High → shimmer streaks: fbm(uv*6 + time)*uHigh*0.3
  float streakShimmer = fbm(uv * 6.0 + uTime * 0.5) * uHigh * 0.3;
  streakShimmer = smoothstep(0.7, 1.0, streakShimmer);
  
  // BlessingWave → bright vertical flash stripes: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    // Vertical stripes pattern
    float stripePattern = sin(uv.x * 8.0 + uTime * 2.0) * 0.5 + 0.5;
    blessingFlash = uBlessingWaveProgress * 0.7 * stripePattern;
  }
  
  // Blue → Cyan → Violet gradient
  vec3 gradientColor;
  if (gradientT < 0.5) {
    gradientColor = mix(blueColor, cyanColor, gradientT * 2.0);
  } else {
    gradientColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(vec3(1.0, 1.0, 1.0), violetColor, 0.3);
    gradientColor = mix(gradientColor, flashColor, blessingFlash);
  }
  
  return gradientColor * (1.0 + breathShimmer + streakShimmer) * 0.7;
}

// ============================================
// LAYER B: REVERSE AURORA VEILS
// ============================================
vec3 reverseAuroraVeils(vec2 uv) {
  if (vReverseIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Two back-facing auroras behind Layer A
  // Colors: Pink → Magenta → Gold
  vec3 pinkColor = vec3(1.0, 0.5, 0.8);
  vec3 magentaColor = vec3(0.9, 0.2, 0.7);
  vec3 goldColor = vec3(1.0, 0.8, 0.4);
  
  float gradientT = vGradientProgress; // Based on reverse wave height
  
  // RotationSync → gentle horizontal swing (already in vertex)
  
  // Breath → turbulence boost (already in vertex)
  
  // RotationSync shimmer: fbm(uv*4 + rotationSync*0.5 + time)*uRotationSync*0.2
  float rotationShimmer = fbm(uv * 4.0 + uTime * 0.4) * abs(uRotationSync) * 0.2;
  rotationShimmer = smoothstep(0.6, 1.0, rotationShimmer);
  
  // Bass → ribbon pulse: sin(time*3 + uv.y*2)*uBass*0.2
  float ribbonPulse = sin(uTime * 3.0 + uv.y * 2.0) * uBass * 0.2;
  ribbonPulse = smoothstep(0.5, 1.0, ribbonPulse);
  
  // High → edge sparkle: fbm(uv*8 + time)*uHigh*0.25
  float edgeSparkle = 0.0;
  if (uv.x < 0.1 || uv.x > 0.9 || uv.y < 0.1 || uv.y > 0.9) {
    float sparkle = fbm(uv * 8.0 + uTime) * uHigh * 0.25;
    sparkle = smoothstep(0.7, 1.0, sparkle);
    edgeSparkle = sparkle;
  }
  
  // BlessingWave → soft glow haze: uBlessingWaveProgress * 0.4
  float blessingHaze = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingHaze = uBlessingWaveProgress * 0.4;
  }
  
  // Pink → Magenta → Gold gradient
  vec3 gradientColor;
  if (gradientT < 0.5) {
    gradientColor = mix(pinkColor, magentaColor, gradientT * 2.0);
  } else {
    gradientColor = mix(magentaColor, goldColor, (gradientT - 0.5) * 2.0);
  }
  
  return gradientColor * (1.0 + rotationShimmer + ribbonPulse + edgeSparkle + blessingHaze) * 0.5;
}

// ============================================
// LAYER C: AURORA DUST PARTICLES
// ============================================
vec3 auroraDustParticles(vec2 uv) {
  if (vDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 120-200 floating aurora dust points (mobile: 80)
  // Radius: 0.01-0.015
  float dustRadius = 0.0125;
  float dustDist = sdCircle(p, dustRadius);
  float dustMask = 1.0 - smoothstep(0.0, dustRadius * 2.0, dustDist);
  
  // Breath → vertical amplitude (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*10 + time)*uHigh*0.3
  float sparkle = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash-up pulses: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Color: White–Cyan–Violet glints
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.6, 0.3, 0.8);
  
  float gradientT = dist / dustRadius;
  vec3 dustColor;
  if (gradientT < 0.5) {
    dustColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    dustColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return dustColor * dustMask * (1.0 + sparkle + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Aurora Curtains (base layer)
  vec3 layerA = primaryAuroraCurtains(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Reverse Aurora Veils (additive blending)
  vec3 layerB = reverseAuroraVeils(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Aurora Dust Particles (additive blending)
  vec3 layerC = auroraDustParticles(uv);
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

