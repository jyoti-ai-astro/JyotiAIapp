/**
 * Blessing Wave Fragment Shader
 * 
 * Phase 2 — Section 13: ACCESSIBILITY & MOTION SAFETY LAYER v1.0
 * Blessing Wave Engine (E16)
 * 
 * 3-layer blessing wave: Inner Gold Core, Outer White Shockwave, Pink-Violet Divine Fade
 */

export const blessingFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uWaveProgress;
uniform float uBass;
uniform float uMid;
uniform float uHigh;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;
varying float vWavePhase;

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
  float dist = vRadialDistance;
  
  // ============================================
  // LAYER A: INNER GOLD CORE RING
  // ============================================
  // Gold core ring at expanding radius
  float coreRadius = uWaveProgress * 0.3;
  float coreDist = abs(dist - coreRadius);
  float coreRing = 1.0 - smoothstep(0.0, 0.08, coreDist);
  
  // Gold color
  vec3 goldCore = vec3(1.0, 0.85, 0.50);
  
  // Bass amplitude boost
  coreRing *= (1.0 + uBass * 0.4);
  
  vec3 finalColor = goldCore * coreRing;
  float alpha = coreRing * 0.8;
  
  // ============================================
  // LAYER B: OUTER WHITE SHOCKWAVE RING
  // ============================================
  // White shockwave ring (slightly ahead of core)
  float shockwaveRadius = uWaveProgress * 0.5;
  float shockwaveDist = abs(dist - shockwaveRadius);
  float shockwaveRing = 1.0 - smoothstep(0.0, 0.12, shockwaveDist);
  
  // White color
  vec3 whiteShockwave = vec3(1.0, 1.0, 1.0);
  
  // High-frequency shimmer at ring edges
  float shimmer = sin(uTime * 20.0 + dist * 30.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  shimmer *= uHigh;
  
  whiteShockwave += vec3(1.0) * shimmer * 0.5;
  
  finalColor += whiteShockwave * shockwaveRing;
  alpha += shockwaveRing * 0.6;
  
  // ============================================
  // LAYER C: PINK-VIOLET DIVINE FADE RING
  // ============================================
  // Pink-violet fade ring (outermost)
  float fadeRadius = uWaveProgress * 0.7;
  float fadeDist = abs(dist - fadeRadius);
  float fadeRing = 1.0 - smoothstep(0.0, 0.15, fadeDist);
  
  // Pink-violet color
  vec3 pinkViolet = mix(
    vec3(1.0, 0.60, 0.80),  // Pink
    vec3(0.80, 0.60, 1.0),  // Violet
    fadeDist * 2.0
  );
  
  finalColor += pinkViolet * fadeRing;
  alpha += fadeRing * 0.4;
  
  // ============================================
  // BLOOM MASK FOR RINGS
  // ============================================
  float bloom = max(coreRing, max(shockwaveRing, fadeRing));
  bloom = smoothstep(0.7, 1.0, bloom);
  alpha += bloom * 0.3;
  
  // ============================================
  // FADE-OUT USING (1 - waveProgress)
  // ============================================
  float fadeOut = 1.0 - uWaveProgress;
  fadeOut = smoothstep(0.0, 0.3, fadeOut); // Fade out in last 30%
  
  finalColor *= fadeOut;
  alpha *= fadeOut;
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  alpha *= uIntensity;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

