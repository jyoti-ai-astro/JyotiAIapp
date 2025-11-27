/**
 * Guru Fragment Shader
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Facial light simulation, eye glow mask, aura glow, breath highlight pulse, micro-sparkles
 */

export const guruFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBreathProgress;
uniform float uBreathStrength;
uniform float uEyeOpen;
uniform float uEyeGlow;
uniform float uEyeShimmer;
uniform float uHaloPulse;
uniform float uGlowIntensity;
uniform float uTurbulence;
uniform float uShimmer;
uniform float uSparkles;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistance;
varying float vBreathPhase;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
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

void main() {
  vec2 uv = vUv;
  vec3 normal = normalize(vNormal);
  
  // ============================================
  // BASE GURU COLOR (Golden-Divine)
  // ============================================
  vec3 baseColor = vec3(1.0, 0.90, 0.75); // Golden
  
  // ============================================
  // FACIAL LIGHT SIMULATION (Soft Banded Glow)
  // ============================================
  // Simulate facial features with soft bands
  float faceBand = sin(uv.y * 3.14159 * 2.0) * 0.5 + 0.5;
  faceBand = smoothstep(0.3, 0.7, faceBand);
  
  vec3 faceGlow = vec3(1.0, 0.95, 0.85);
  baseColor = mix(baseColor, faceGlow, faceBand * 0.3);
  
  // ============================================
  // EYE GLOW MASK
  // ============================================
  // Eye position (center-top of face)
  vec2 eyeCenter = vec2(0.5, 0.7);
  float eyeDist = length(uv - eyeCenter);
  
  // Eye glow (circular)
  float eyeGlowMask = 1.0 - smoothstep(0.0, 0.15, eyeDist);
  eyeGlowMask *= uEyeOpen;
  
  // Eye glow color (divine blue-white)
  vec3 eyeGlowColor = vec3(0.70, 0.85, 1.0);
  baseColor = mix(baseColor, eyeGlowColor, eyeGlowMask * uEyeGlow);
  
  // Eye shimmer (high-frequency)
  float eyeShimmer = sin(uTime * 20.0 + eyeDist * 20.0) * 0.5 + 0.5;
  eyeShimmer = smoothstep(0.6, 1.0, eyeShimmer);
  baseColor += vec3(1.0) * eyeShimmer * uEyeShimmer * 0.5;
  
  // ============================================
  // AURA GLOW INTEGRATION
  // ============================================
  // Radiant halo pulses
  float haloGlow = uHaloPulse * 0.3;
  
  // Bass-driven glow intensity
  float glow = uGlowIntensity * 0.5;
  
  // Combine glow
  vec3 auraColor = vec3(1.0, 0.88, 0.60); // Golden aura
  baseColor += auraColor * (haloGlow + glow);
  
  // ============================================
  // BREATH HIGHLIGHT PULSE
  // ============================================
  float breathHighlight = sin(vBreathPhase * 3.14159 * 2.0) * 0.5 + 0.5;
  breathHighlight = smoothstep(0.4, 0.6, breathHighlight);
  breathHighlight *= uBreathStrength;
  
  vec3 breathColor = vec3(1.0, 0.95, 0.80);
  baseColor += breathColor * breathHighlight * 0.2;
  
  // ============================================
  // MICRO-SPARKLES
  // ============================================
  float sparkle = fbm(uv * 10.0 + uTime * 0.5);
  sparkle = smoothstep(0.7, 1.0, sparkle);
  sparkle *= uSparkles;
  
  baseColor += vec3(1.0) * sparkle * 0.6;
  
  // ============================================
  // SHIMMER EFFECT
  // ============================================
  float shimmer = sin(uTime * 8.0 + uv.x * 5.0 + uv.y * 5.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.5, 1.0, shimmer);
  baseColor += vec3(1.0) * shimmer * uShimmer * 0.3;
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  vec3 finalColor = baseColor * uIntensity;
  float alpha = 1.0;
  
  // Edge fade
  float edgeFade = 1.0 - smoothstep(0.8, 1.0, length(uv - vec2(0.5)));
  alpha *= edgeFade;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

