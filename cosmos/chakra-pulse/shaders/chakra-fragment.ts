/**
 * Chakra Pulse Fragment Shader
 * 
 * Phase 2 — Section 35: CHAKRA PULSE ENGINE
 * Chakra Pulse Engine (E39)
 * 
 * 3-layer chakra pulse: Root to Crown Chakra Nodes, Chakra Linking Column, Pulse Wave Rings
 */

export const chakraFragmentShader = `
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
varying float vChakraIndex;
varying float vPulseRingIndex;
varying float vSpineIndex;
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

// Chakra colors
vec3 getChakraColor(int index) {
  if (index == 0) return vec3(1.0, 0.2, 0.2); // root: red
  if (index == 1) return vec3(1.0, 0.6, 0.2); // sacral: orange
  if (index == 2) return vec3(1.0, 1.0, 0.2); // solar: yellow
  if (index == 3) return vec3(0.2, 1.0, 0.4); // heart: green
  if (index == 4) return vec3(0.2, 0.6, 1.0); // throat: blue
  if (index == 5) return vec3(0.4, 0.2, 1.0); // third-eye: indigo
  return vec3(0.8, 0.2, 1.0); // crown: violet
}

// Chakra Y positions
float getChakraY(int index) {
  if (index == 0) return -0.9; // root
  if (index == 1) return -0.55; // sacral
  if (index == 2) return -0.2; // solar
  if (index == 3) return 0.2; // heart
  if (index == 4) return 0.55; // throat
  if (index == 5) return 0.85; // third-eye
  return 1.15; // crown
}

// ============================================
// LAYER A: ROOT TO CROWN CHAKRA NODES
// ============================================
vec3 chakraNodes(vec2 uv) {
  if (vChakraIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  int chakraIdx = int(vChakraIndex);
  float chakraY = getChakraY(chakraIdx);
  
  // Adjust for chakra Y position
  p.y -= (chakraY - 0.5) * 2.0;
  
  // Base radius: 0.11
  float chakraRadius = 0.11;
  float breathPulse = 1.0 + uBreathStrength * 0.2;
  chakraRadius *= breathPulse;
  
  // Draw chakra disc
  float chakraDist = sdCircle(p, chakraRadius);
  float chakraMask = 1.0 - smoothstep(0.0, 0.01, chakraDist);
  
  // Bass flicker (already in vertex)
  
  // High shimmer: fbm(uv*10 + time)*uHigh*0.25
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Blessing flash: uBlessingWaveProgress * chakraBoost (0.2–0.6 scale)
  float blessingBoost = 0.2 + float(chakraIdx) * 0.066; // 0.2 to 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * blessingBoost;
  }
  
  // Color per chakra
  vec3 chakraColor = getChakraColor(chakraIdx);
  
  // Gradient core glow
  float gradientT = length(p) / chakraRadius;
  vec3 coreColor = mix(chakraColor, vec3(1.0, 1.0, 1.0), gradientT * 0.5);
  
  return coreColor * chakraMask * (1.0 + shimmer + blessingFlash);
}

// ============================================
// LAYER B: PULSE WAVE RINGS
// ============================================
vec3 pulseWaveRings(vec2 uv) {
  if (vPulseRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  int chakraIdx = int(mod(vPulseRingIndex, 7.0));
  float chakraY = getChakraY(chakraIdx);
  
  // Adjust for chakra Y position
  p.y -= (chakraY - 0.5) * 2.0;
  
  // Ring expansion: radius += time*0.6
  float ringRadius = 0.11 + uTime * 0.6;
  ringRadius = mod(ringRadius, 1.5); // Loop rings
  
  // Ring thickness
  float ringThickness = 0.015;
  float breathThickness = 1.0 + uBreathStrength * 0.1;
  ringThickness *= breathThickness;
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Bass → radial vibration (already in vertex)
  
  // High → shimmering edges: fbm(uv*8 + time)*uHigh*0.3
  float edgeShimmer = 0.0;
  if (ringDist > -0.01 && ringDist < 0.02) {
    float shimmer = fbm(uv * 8.0 + uTime) * uHigh * 0.3;
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer;
  }
  
  // Color: chakra color → white gradient
  vec3 chakraColor = getChakraColor(chakraIdx);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = ringRadius / 1.5;
  vec3 ringColor = mix(chakraColor, whiteColor, gradientT * 0.6);
  
  return ringColor * ringMask * (1.0 + edgeShimmer) * 0.6;
}

// ============================================
// LAYER C: CHAKRA LINKING COLUMN (ENERGY SPINE)
// ============================================
vec3 chakraLinkingColumn(vec2 uv) {
  if (vSpineIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Vertical energy beam connecting chakras
  float spineY = -0.9 + (uv.y - 0.5) * 2.05; // Map UV to spine Y range
  
  // Spine width
  float spineWidth = 0.03;
  float breathThickness = 1.0 + uBreathStrength * 0.15;
  spineWidth *= breathThickness;
  
  // Draw spine beam
  float spineDist = abs(p.x) - spineWidth;
  float spineMask = 1.0 - smoothstep(0.0, 0.01, spineDist);
  
  // Scroll → column brightness surge
  float scrollBrightness = 1.0 + uScroll * 0.5;
  
  // Breath → thickness oscillation (already in vertex)
  
  // Bass → ripple distortion (already in vertex)
  
  // Mid → turbulence waves
  float midTurbulence = fbm(vec2(spineY * 2.0 + uTime * 0.3, uTime * 0.2)) * uMid * 0.1;
  midTurbulence = smoothstep(0.6, 1.0, midTurbulence);
  
  // High → shimmer streaks: fbm(uv*6 + time*0.5)*uHigh*0.3
  float shimmer = fbm(uv * 6.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: white-gold core with chakra-colored outer bleed
  vec3 whiteGoldColor = vec3(1.0, 0.95, 0.8);
  vec3 coreColor = whiteGoldColor;
  
  // Chakra-colored bleed based on Y position
  float yNormalized = (spineY + 0.9) / 2.05; // 0 to 1
  int nearestChakra = int(floor(yNormalized * 7.0));
  nearestChakra = clamp(nearestChakra, 0, 6);
  vec3 chakraBleed = getChakraColor(nearestChakra);
  
  float bleedT = abs(p.x) / spineWidth;
  vec3 spineColor = mix(coreColor, chakraBleed, bleedT * 0.4);
  
  return spineColor * spineMask * scrollBrightness * (1.0 + midTurbulence + shimmer) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Root to Crown Chakra Nodes
  vec3 layerA = chakraNodes(uv);
  finalColor += layerA * 0.8;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Pulse Wave Rings
  vec3 layerB = pulseWaveRings(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Chakra Linking Column
  vec3 layerC = chakraLinkingColumn(uv);
  finalColor += layerC * 0.7;
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

