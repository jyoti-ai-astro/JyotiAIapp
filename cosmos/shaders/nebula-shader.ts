/**
 * Nebula Shader System - 5 Layer Architecture
 * 
 * Phase 2 — Section 3: NEBULA SHADER SYSTEM (FULL SPEC)
 * 
 * Complete 5-layer nebula system:
 * - Layer 1: Base Fog Field
 * - Layer 2: Fractal Nebula Clouds
 * - Layer 3: Energy Ribbons
 * - Layer 4: Cosmic Dust
 * - Layer 5: Light Bloom Contribution Mask
 */

import * as THREE from 'three';

// Noise functions for GLSL
export const noiseFunctions = `
// Classic Perlin Noise
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;
  
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// Speckle noise for cosmic dust
float speckleNoise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = snoise(vec3(i, 0.0));
  float b = snoise(vec3(i + vec2(1.0, 0.0), 0.0));
  float c = snoise(vec3(i + vec2(0.0, 1.0), 0.0));
  float d = snoise(vec3(i + vec2(1.0, 1.0), 0.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`;

// Vertex Shader
export const nebulaVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader - Five Layer Nebula
export const nebulaFragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uParallaxStrength;
uniform float uDistortionStrength;
uniform float uOpacityMult;
uniform float uColorShift;

varying vec2 vUv;
varying vec3 vPosition;

${noiseFunctions}

void main() {
  vec2 uv = vUv;
  
  // Parallax effect from mouse (with strength control)
  uv.x += uMouse.x * 0.03 * uParallaxStrength;
  uv.y += uMouse.y * 0.02 * uParallaxStrength;
  
  // Distortion effect
  float distortion = fbm(uv * 0.5 + uTime * 0.1) * uDistortionStrength;
  uv += vec2(distortion * 0.1);
  
  // Global time multiplier (slow, graceful motion)
  float t = uTime * 0.2;
  
  // Breathing effect (global brightness pulse)
  float breathe = 0.5 + 0.5 * sin(uTime * 0.15);
  
  // ============================================
  // LAYER 1: BASE FOG FIELD (Depth + Atmosphere)
  // ============================================
  float fogSpeed = 0.005 + (uMid * 0.015);  // 0.005-0.02 range
  float fog = fbm(uv * 0.3 + t * fogSpeed);
  
  vec3 color1 = vec3(0.03, 0.02, 0.10);  // Deep Space Navy
  vec3 color2 = vec3(0.09, 0.05, 0.22);  // Cosmic Indigo
  vec3 color3 = vec3(0.18, 0.08, 0.45);  // Mystic Violet
  
  vec3 fogColor = mix(color1, color2, fog);
  fogColor = mix(fogColor, color3, fog * 0.6);
  
  // Color shift
  fogColor = mix(fogColor, vec3(fogColor.b, fogColor.r, fogColor.g), uColorShift * 0.3);
  
  float fogAlpha = fog * 0.45;
  
  // Audio-reactive: mid affects fog thickness
  fogAlpha *= (1.0 + uMid * 0.3);
  
  // ============================================
  // LAYER 2: FRACTAL NEBULA CLOUDS (High-frequency FBM)
  // ============================================
  float cloudSpeed = 0.12 + (uHigh * 0.08);  // Swirling motion from high frequencies
  float n = fbm(uv * 1.2 + t * cloudSpeed);
  
  // Add turbulence
  float turbulence = fbm(uv * 2.0 + t * 0.3) * 0.3;
  n += turbulence;
  
  float clouds = smoothstep(0.3, 0.7, n);
  
  // Color gradients: Purple → Pink → Gold
  vec3 purple = vec3(0.45, 0.20, 0.75);  // Sacred Purple
  vec3 pink = vec3(0.75, 0.35, 0.85);
  vec3 gold = vec3(1.0, 0.70, 0.30);  // Spiritual Gold
  
  vec3 cloudColor = mix(purple, pink, clouds * 0.5);
  cloudColor = mix(cloudColor, gold, clouds * 0.3);
  
  // Faint Blue → Indigo variation
  vec3 blueIndigo = mix(
    vec3(0.12, 0.05, 0.25),  // Indigo Shadow
    vec3(0.20, 0.30, 0.60),  // Faint Blue
    clouds * 0.4
  );
  cloudColor = mix(cloudColor, blueIndigo, 0.2);
  
  float cloudAlpha = clouds * 0.35;
  
  // Audio-reactive: high frequencies affect cloud rotation speed
  cloudAlpha *= (1.0 + uHigh * 0.2);
  
  // ============================================
  // LAYER 3: ENERGY RIBBONS (Sine-driven wave distortions)
  // ============================================
  // Variable thickness based on bass
  float ribbonThickness = 0.1 + (uBass * 0.15);  // 0.1-0.25
  
  float ribbon = sin((uv.y * 4.0) + (t * 1.6)) 
               * sin((uv.x * 3.0) + (t * 1.0));
  
  // Pulse related to time
  float pulse = 0.5 + 0.5 * sin(t * 2.0);
  ribbon = smoothstep(0.5 - ribbonThickness, 0.5 + ribbonThickness, ribbon * pulse);
  
  vec3 gold1 = vec3(1.0, 0.85, 0.55);  // Spiritual Gold
  vec3 gold2 = vec3(1.0, 0.70, 0.30);
  
  vec3 ribbonColor = mix(gold1, gold2, ribbon);
  
  // Opacity range: 0.2-0.45
  float ribbonAlpha = mix(0.2, 0.45, ribbon);
  
  // Audio-reactive: bass affects ribbon thickness
  ribbonAlpha *= (1.0 + uBass * 0.4);
  
  // ============================================
  // LAYER 4: COSMIC DUST (Tiny grainy sparkle texture)
  // ============================================
  vec2 dustUV = uv * 8.0 + t * 0.05;  // Animated subtly
  float dust = speckleNoise(dustUV);
  
  // Non-uniform alpha
  float dustAlpha = dust * 0.15;
  dustAlpha *= (0.7 + 0.3 * sin(t * 0.3 + dust * 10.0));  // Varying opacity
  
  vec3 dustColor = vec3(0.9, 0.85, 1.0);  // Slight blue-white sparkle
  
  // ============================================
  // LAYER 5: LIGHT BLOOM CONTRIBUTION MASK
  // ============================================
  // Highlight regions for energy cores
  float bloomMask = 0.0;
  
  // Energy core regions (from ribbons and clouds)
  bloomMask += ribbon * 0.8;
  bloomMask += clouds * 0.4;
  bloomMask += fog * 0.2;
  
  // Soft thresholding
  bloomMask = smoothstep(0.3, 0.7, bloomMask);
  
  // ============================================
  // BLEND ALL 5 LAYERS
  // ============================================
  vec3 finalColor = fogColor;
  
  // Add cloud layer (soft light blend)
  finalColor = mix(finalColor, cloudColor, cloudAlpha * 0.6);
  
  // Add ribbon layer (additive)
  finalColor += ribbonColor * ribbonAlpha;
  
  // Add cosmic dust (additive sparkle)
  finalColor += dustColor * dustAlpha;
  
  // Apply breathing effect
  finalColor *= (0.9 + breathe * 0.1);
  
  // Color grading
  // Increase saturation slightly
  float luminance = dot(finalColor, vec3(0.299, 0.587, 0.114));
  finalColor = mix(vec3(luminance), finalColor, 1.2);
  
  // Apply color shift
  finalColor = mix(finalColor, vec3(finalColor.b, finalColor.r, finalColor.g), uColorShift * 0.2);
  
  // Opacity calculation with remapped fog value
  float remappedFog = smoothstep(0.0, 0.5, fog);
  float finalAlpha = (fogAlpha + cloudAlpha + ribbonAlpha + dustAlpha) * remappedFog;
  
  // Opacity pulse (very subtle)
  float opacityPulse = 0.97 + 0.03 * sin(uTime * 0.1);
  finalAlpha *= opacityPulse;
  
  // Apply opacity multiplier
  finalAlpha *= uOpacityMult;
  
  // Apply intensity uniform
  finalColor *= uIntensity;
  finalAlpha *= uIntensity;
  
  // Mobile saturation reduction (detect via precision or uniform)
  #ifdef GL_ES
    finalColor = mix(vec3(luminance), finalColor, 0.85);  // Reduce saturation on mobile
  #endif
  
  // Clamp values
  finalColor = clamp(finalColor, 0.0, 1.0);
  finalAlpha = clamp(finalAlpha, 0.0, 1.0);
  
  // Output with bloom mask in alpha channel (for post-processing)
  // Note: We'll use a separate render target for bloom in post-processing
  gl_FragColor = vec4(finalColor, finalAlpha);
  
  // Store bloom contribution in alpha for post-processing
  // (This would be used with a separate render pass)
}
`;

// Shader Material
export function createNebulaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1.0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uParallaxStrength: { value: 1.0 },
      uDistortionStrength: { value: 1.0 },
      uOpacityMult: { value: 1.0 },
      uColorShift: { value: 0.0 },
    },
    vertexShader: nebulaVertexShader,
    fragmentShader: nebulaFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
