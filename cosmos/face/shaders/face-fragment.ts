/**
 * Face Fragment Shader
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * Skin-tone gradient, eye-glow intensification, expression glow boost, shimmer sparkles, blessing-wave radiance
 */

export const faceFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBreathPhase;
uniform float uBlinkPhase;
uniform float uBrow;
uniform float uEye;
uniform float uCheek;
uniform float uMouthCurve;
uniform float uGlow;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uBlessingWaveProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistance;
varying float vExpressionIntensity;

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
  
  // ============================================
  // SKIN-TONE GRADIENT
  // ============================================
  // Warm golden skin tone
  vec3 baseSkin = vec3(0.95, 0.85, 0.75);
  
  // Gradient from center (lighter) to edges (darker)
  float distFromCenter = length(uv - vec2(0.5, 0.5));
  float gradient = 1.0 - smoothstep(0.0, 0.5, distFromCenter);
  
  vec3 skinColor = mix(
    baseSkin * 0.8,  // Darker at edges
    baseSkin * 1.1,  // Lighter at center
    gradient
  );
  
  // ============================================
  // EYE-GLOW INTENSIFICATION
  // ============================================
  // Eye position (center-top of face)
  vec2 eyeCenter = vec2(0.5, 0.6);
  float eyeDist = length(uv - eyeCenter);
  
  // Eye glow (circular)
  float eyeGlowMask = 1.0 - smoothstep(0.0, 0.1, eyeDist);
  eyeGlowMask *= uEye; // Expression-based eye open
  eyeGlowMask *= (1.0 - uBlinkPhase); // Blink closes eyes
  
  // Eye glow color (divine blue-white)
  vec3 eyeGlowColor = vec3(0.70, 0.85, 1.0);
  skinColor = mix(skinColor, eyeGlowColor, eyeGlowMask * 0.4);
  
  // ============================================
  // EXPRESSION GLOW BOOST
  // ============================================
  float expressionGlow = uGlow * 0.3;
  vec3 glowColor = vec3(1.0, 0.95, 0.85);
  skinColor += glowColor * expressionGlow;
  
  // ============================================
  // SHIMMER SPARKLES (uHigh)
  // ============================================
  float shimmer = fbm(uv * 10.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh;
  
  skinColor += vec3(1.0) * shimmer * 0.3;
  
  // ============================================
  // BLESSING-WAVE RADIANCE (if waveProgress > 0)
  // ============================================
  if (uBlessingWaveProgress > 0.0) {
    float blessingRadiance = uBlessingWaveProgress * 0.5;
    vec3 blessingColor = mix(
      vec3(1.0, 0.9, 0.7),  // Gold
      vec3(1.0, 1.0, 1.0),  // White
      uBlessingWaveProgress
    );
    skinColor += blessingColor * blessingRadiance;
  }
  
  // ============================================
  // IDLE SHIMMER (high-frequency based)
  // ============================================
  float idleShimmer = sin(uTime * 8.0 + uv.x * 5.0 + uv.y * 5.0) * 0.5 + 0.5;
  idleShimmer = smoothstep(0.5, 1.0, idleShimmer);
  idleShimmer *= uHigh * 0.2;
  skinColor += vec3(1.0) * idleShimmer * 0.2;
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  vec3 finalColor = skinColor * uIntensity;
  float alpha = 1.0;
  
  // Edge fade
  float edgeFade = 1.0 - smoothstep(0.85, 1.0, distFromCenter);
  alpha *= edgeFade;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

