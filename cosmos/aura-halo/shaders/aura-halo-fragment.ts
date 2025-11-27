/**
 * Aura Halo Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Aura Halo Engine (E7)
 * 
 * Creates divine golden-blue halo with:
 * - Soft multi-layer glow
 * - Bloom mask layer
 * - Audio-reactive shimmer
 * - 3 distinct layers
 */

export const auraHaloFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uLayerType;  // 0: Base Halo, 1: Inner Pulse, 2: Divine Veil

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;
varying float vWavePhase;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
}

float fbm(float p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(0.5, 0.5);
  float dist = vRadialDistance;
  
  // ============================================
  // LAYER 1: BASE HALO (Soft Glow)
  // ============================================
  if (uLayerType < 0.5) {
    // Divine golden-blue gradient
    vec3 gold = vec3(1.0, 0.85, 0.50);      // Golden
    vec3 blue = vec3(0.40, 0.70, 1.0);     // Divine Blue
    
    // Radial gradient
    float gradientMix = smoothstep(0.3, 0.8, dist);
    vec3 baseColor = mix(gold, blue, gradientMix);
    
    // Soft glow falloff
    float glow = 1.0 - smoothstep(0.4, 1.0, dist);
    glow *= (0.6 + sin(vWavePhase) * 0.2);
    
    // Audio-reactive shimmer
    float shimmer = sin(uTime * 3.0 + dist * 10.0) * uHigh * 0.2;
    baseColor += vec3(1.0) * shimmer * 0.3;
    
    vec3 finalColor = baseColor * glow * uIntensity;
    float alpha = glow * 0.4 * uIntensity;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // LAYER 2: INNER PULSE RING (Strong Golden Pulse)
  // ============================================
  if (uLayerType < 1.5) {
    // Strong golden pulse
    vec3 gold1 = vec3(1.0, 0.90, 0.60);    // Light gold
    vec3 gold2 = vec3(1.0, 0.75, 0.30);    // Deep gold
    
    // Ring shape (concentric)
    float ringDist = abs(dist - 0.3);
    float ringGlow = 1.0 - smoothstep(0.0, 0.15, ringDist);
    
    // Pulse animation
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    ringGlow *= (0.5 + pulse * 0.5);
    
    // Bass-reactive expansion
    ringGlow *= (1.0 + uBass * 0.5);
    
    // Color
    vec3 ringColor = mix(gold1, gold2, pulse);
    
    // Bloom mask
    float bloom = smoothstep(0.7, 1.0, ringGlow);
    bloom *= (1.0 + uBass * 0.3);
    
    vec3 finalColor = ringColor * ringGlow * uIntensity;
    float alpha = ringGlow * 0.8 * uIntensity;
    alpha += bloom * 0.3;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // LAYER 3: DIVINE AURA VEIL (Thin Shimmering Energy Sheet)
  // ============================================
  // Thin shimmering energy sheet
  vec3 veilGold = vec3(1.0, 0.88, 0.55);
  vec3 veilBlue = vec3(0.50, 0.75, 1.0);
  
  // Wave pattern
  float wave = sin(vWavePhase * 2.0) * 0.5 + 0.5;
  
  // Shimmer effect
  float shimmer = fbm(uv * 5.0 + uTime * 0.5);
  shimmer = smoothstep(0.4, 0.6, shimmer);
  
  // Color blend
  vec3 veilColor = mix(veilGold, veilBlue, wave * 0.5);
  veilColor += vec3(1.0) * shimmer * 0.3;
  
  // Audio-reactive shimmer
  float audioShimmer = sin(uTime * 5.0 + dist * 15.0) * uHigh * 0.3;
  veilColor += vec3(1.0) * audioShimmer * 0.2;
  
  // Soft veil falloff
  float veilAlpha = 1.0 - smoothstep(0.2, 0.9, dist);
  veilAlpha *= shimmer;
  veilAlpha *= (0.3 + wave * 0.2);
  
  vec3 finalColor = veilColor * veilAlpha * uIntensity;
  float alpha = veilAlpha * 0.5 * uIntensity;
  
  // Scroll affects intensity
  finalColor *= (0.7 + uScroll * 0.3);
  alpha *= (0.7 + uScroll * 0.3);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

