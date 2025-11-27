/**
 * Quantum Halo Fragment Shader
 * 
 * Phase 2 — Section 48: QUANTUM HALO ENGINE
 * Quantum Halo Engine (E52)
 * 
 * 3-layer quantum halo: Primary Quantum Rings, Quantum Phase Echo Rings, Quantum Halo Sparks
 */

export const quantumHaloFragmentShader = `
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
varying float vRingIndex;
varying float vEchoRingIndex;
varying float vSparkIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vRingPulse;
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
// LAYER A: PRIMARY QUANTUM RINGS
// ============================================
vec3 primaryQuantumRings(vec2 uv) {
  if (vRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3-5 concentric luminous rings
  // Gradient: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring pulse
  
  // Breath → ring expansion (already in vertex)
  
  // Scroll → rotational drift (already in vertex)
  
  // Bass → jitter vibration (already in vertex)
  
  // High → shimmer scattering: fbm(vec2(angle*3, radius*1.2)+time)*uHigh*0.3
  float shimmer = fbm(vec2(vAngle * 3.0, vRadius * 1.2) + uTime * 0.3) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → halo flash (white → violet): uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // White → Cyan → Violet gradient
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    ringColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash (white → violet)
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.6);
    ringColor = mix(ringColor, flashColor, blessingFlash);
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0; // Fade at edges
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return ringColor * thicknessFade * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: QUANTUM PHASE ECHO RINGS
// ============================================
vec3 quantumPhaseEchoRings(vec2 uv) {
  if (vEchoRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Secondary delayed rings behind primary
  // Color: Blue → Indigo → Purple
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  vec3 purpleColor = vec3(0.6, 0.3, 0.8);
  
  float gradientT = vGradientProgress; // Based on echo ring pulse
  
  // RotationSync → skew offset (already in vertex)
  
  // Breath → echo broadening (already in vertex)
  
  // Mid → turbulence injection (already in vertex)
  
  // High → quantum flicker: fbm(vec2(radius*0.9, angle*4)+time)*uHigh*0.25
  float flicker = fbm(vec2(vRadius * 0.9, vAngle * 4.0) + uTime * 0.3) * uHigh * 0.25;
  flicker = smoothstep(0.7, 1.0, flicker);
  
  // BlessingWave → violet breathing haze: uBlessingWaveProgress * 0.5
  float blessingHaze = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingHaze = uBlessingWaveProgress * 0.5;
  }
  
  // Blue → Indigo → Purple gradient
  vec3 echoColor;
  if (gradientT < 0.5) {
    echoColor = mix(blueColor, indigoColor, gradientT * 2.0);
  } else {
    echoColor = mix(indigoColor, purpleColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add violet breathing haze
  if (blessingHaze > 0.0) {
    vec3 violetHaze = vec3(0.7, 0.5, 0.9);
    echoColor = mix(echoColor, violetHaze, blessingHaze * 0.4);
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return echoColor * thicknessFade * (1.0 + flicker) * 0.4;
}

// ============================================
// LAYER C: QUANTUM HALO SPARKS
// ============================================
vec3 quantumHaloSparks(vec2 uv) {
  if (vSparkIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200-320 micro sparks (mobile: 150)
  // Radius: 0.01-0.015
  float sparkRadius = 0.0125;
  float sparkDist = sdCircle(p, sparkRadius);
  float sparkMask = 1.0 - smoothstep(0.0, sparkRadius * 2.0, sparkDist);
  
  // Breath → radial expansion (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → spark noise: fbm(uv*18 + time)*uHigh*0.3
  float sparkNoise = fbm(uv * 18.0 + uTime) * uHigh * 0.3;
  sparkNoise = smoothstep(0.6, 1.0, sparkNoise);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Color: White–Cyan–Violet sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / sparkRadius;
  vec3 sparkColor;
  if (gradientT < 0.33) {
    sparkColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    sparkColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return sparkColor * sparkMask * (1.0 + sparkNoise + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Quantum Rings (base layer)
  vec3 layerA = primaryQuantumRings(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Quantum Phase Echo Rings (additive blending)
  vec3 layerB = quantumPhaseEchoRings(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Quantum Halo Sparks (additive blending)
  vec3 layerC = quantumHaloSparks(uv);
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

