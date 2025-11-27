/**
 * Fate Ripple Fragment Shader
 * 
 * Phase 2 — Section 30: FATE RIPPLE ENGINE
 * Fate Ripple Engine (E34)
 * 
 * 3-layer fate ripple: Destiny Ripple Rings, Karmic Shockwave Pulses, Past-Life Echo Fragments
 */

export const rippleFragmentShader = `
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
varying float vRippleRingIndex;
varying float vShockwaveIndex;
varying float vFragmentIndex;
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
// LAYER A: DESTINY RIPPLE RINGS
// ============================================
vec3 destinyRippleRings(vec2 uv) {
  if (vRippleRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 5-9 expanding rings
  float baseRadius = 0.2 + vRippleRingIndex * 0.15;
  float expansionSpeed = uScroll * 0.4 + sin(uTime * 0.5) * 0.05;
  float ringRadius = baseRadius + expansionSpeed;
  
  // Breath → ring thickness pulse: thickness*(1.0 + uBreathStrength*0.15)
  float ringThickness = 0.02 * (1.0 + uBreathStrength * 0.15);
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // BlessingWave → white flash wave passing along ring edges
  float whiteFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    float flashAngle = atan(p.y, p.x);
    float flashProgress = (flashAngle / 6.28318 + 0.5) + uTime * 0.2;
    flashProgress = mod(flashProgress, 1.0);
    float flashDist = abs(flashProgress - uBlessingWaveProgress);
    whiteFlash = smoothstep(0.1, 0.0, flashDist) * uBlessingWaveProgress * 0.6;
  }
  
  // Color: Gold → White gradient with soft edges
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / ringRadius;
  vec3 ringColor = mix(goldColor, whiteColor, gradientT * 0.5);
  
  // Add white flash
  ringColor = mix(ringColor, whiteColor, whiteFlash);
  
  return ringColor * ringMask;
}

// ============================================
// LAYER B: KARMIC SHOCKWAVE PULSES
// ============================================
vec3 karmicShockwavePulses(vec2 uv) {
  if (vShockwaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Circular shock pulses
  // Shockwave expansion: radius += time*0.8
  float shockwaveRadius = 0.1 + uTime * 0.8;
  float shockwaveThickness = 0.03;
  
  // Draw shockwave ring
  float shockwaveDist = sdRing(p, shockwaveRadius, shockwaveThickness);
  float shockwaveMask = 1.0 - smoothstep(0.0, 0.01, shockwaveDist);
  
  // Mid → turbulence distortion on edges (already in vertex)
  
  // High → shimmer spikes along circumference
  float shimmer = 0.0;
  if (abs(dist - shockwaveRadius) < shockwaveThickness) {
    float shimmerAngle = atan(p.y, p.x);
    float shimmerValue = fbm(vec2(shimmerAngle * 10.0, uTime * 0.5));
    shimmer = smoothstep(0.7, 1.0, shimmerValue) * uHigh * 0.3;
  }
  
  // Color: white-violet spectral band
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = dist / shockwaveRadius;
  vec3 shockwaveColor = mix(whiteColor, violetColor, gradientT * 0.3);
  
  return shockwaveColor * shockwaveMask * (1.0 + shimmer);
}

// ============================================
// LAYER C: PAST-LIFE ECHO FRAGMENTS
// ============================================
vec3 pastLifeEchoFragments(vec2 uv) {
  if (vFragmentIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Floating fragments drifting outward
  float fragmentRadius = 0.04;
  float fragmentDist = sdCircle(p, fragmentRadius);
  float fragmentGlow = 1.0 - smoothstep(0.0, fragmentRadius * 2.0, fragmentDist);
  
  // BlessingWave → fragment glow burst
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.5;
  }
  
  // High → shimmer
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.2;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // Color: gold-violet ghost fragments
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 fragmentColor = mix(goldColor, violetColor, 0.5);
  
  return fragmentColor * fragmentGlow * (1.0 + blessingGlow + shimmer) * 0.6;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Destiny Ripple Rings
  vec3 layerA = destinyRippleRings(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Karmic Shockwave Pulses
  vec3 layerB = karmicShockwavePulses(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Past-Life Echo Fragments
  vec3 layerC = pastLifeEchoFragments(uv);
  finalColor += layerC * 0.5;
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

