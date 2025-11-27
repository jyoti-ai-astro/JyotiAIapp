/**
 * Aura Shield Fragment Shader
 * 
 * Phase 2 — Section 19: AURA SHIELD ENGINE
 * Aura Shield Engine (E23)
 * 
 * 3-layer defensive geometry: Inner Radiant Shield, Mid Hexagonal Lattice Shield, Outer Energy Boundary
 */

export const auraShieldFragmentShader = `
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
varying vec3 vNormal;
varying float vDistance;
varying float vRadialDistance;

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

// SDF functions
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdRing(vec2 p, float r, float thickness) {
  return abs(length(p) - r) - thickness;
}

// ============================================
// SDF HEX-GRID IMPLEMENTATION
// ============================================
float sdHex(vec2 p) {
  // Hexagonal pattern
  vec2 q = vec2(
    p.x * 1.154700538,  // 2.0 / sqrt(3)
    p.y + p.x * 0.577350269  // 1.0 / sqrt(3)
  );
  
  vec2 i = floor(q);
  vec2 f = fract(q);
  
  float g = min(f.x, f.y);
  float h = max(f.x, f.y);
  
  float x = min(abs(f.x - f.y), 1.0 - abs(f.x - f.y));
  
  return length(vec2(x, h - g));
}

// ============================================
// LAYER A: INNER RADIANT SHIELD
// ============================================
vec3 innerRadiantShield(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Soft glowing spherical shell
  float shellRadius = 0.35;
  
  // Breath-linked pulse: 1.0 + uBreathStrength * 0.15
  float pulseRadius = shellRadius * (1.0 + uBreathStrength * 0.15);
  
  // Raymarched ring
  float ringDist = sdRing(p, pulseRadius, 0.08);
  float ring = 1.0 - smoothstep(0.0, 0.03, ringDist);
  
  // Color: Gold → White
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 layerAColor = mix(goldColor, whiteColor, uBreathStrength);
  
  // Audio shimmer: uHigh * 0.3
  float shimmer = sin(uTime * 12.0 + dist * 15.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  
  return layerAColor * ring * (1.0 + shimmer);
}

// ============================================
// LAYER B: MID HEXAGONAL LATTICE SHIELD
// ============================================
vec3 midHexagonalLatticeShield(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Scroll → lattice rotation (uScroll * 2π)
  float rotation = uScroll * 6.28318; // 2π
  float cosR = cos(rotation);
  float sinR = sin(rotation);
  vec2 rotatedP = vec2(
    p.x * cosR - p.y * sinR,
    p.x * sinR + p.y * cosR
  );
  
  // Bass → lattice expansion (scale 1.0 → 1.2)
  float bassScale = 1.0 + uBass * 0.2;
  rotatedP *= bassScale;
  
  // Hex-grid pattern
  float hexDist = sdHex(rotatedP * 8.0);
  float hexPattern = step(0.02, hexDist);
  hexPattern = 1.0 - hexPattern; // Invert (lines become visible)
  
  // BlessingWave → bright crystalline spark intersections
  float intersectionGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    // Detect hex intersections
    float intersectionDist = abs(hexDist - 0.0);
    intersectionGlow = 1.0 - smoothstep(0.0, 0.01, intersectionDist);
    intersectionGlow *= uBlessingWaveProgress;
  }
  
  // Color: Light gold with crystalline sparkles
  vec3 latticeColor = vec3(1.0, 0.9, 0.7);
  vec3 sparkleColor = vec3(1.0, 1.0, 1.0);
  
  vec3 layerBColor = latticeColor * hexPattern;
  layerBColor += sparkleColor * intersectionGlow * 0.8;
  
  return layerBColor;
}

// ============================================
// LAYER C: OUTER ENERGY BOUNDARY
// ============================================
vec3 outerEnergyBoundary(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Thin glowing bubble around the shield
  float boundaryRadius = 0.45;
  
  // Bass → expansion radius
  float bassExpansion = 1.0 + uBass * 0.15;
  float expandedRadius = boundaryRadius * bassExpansion;
  
  // Raymarched ring (thin)
  float ringDist = sdRing(p, expandedRadius, 0.02);
  float ring = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // High → shimmer band
  float shimmerBand = sin(uTime * 10.0 + dist * 20.0) * 0.5 + 0.5;
  shimmerBand = smoothstep(0.6, 1.0, shimmerBand);
  shimmerBand *= uHigh * 0.4;
  
  // BlessingWave → radiance burst (uBlessingWaveProgress * 0.4)
  float blessingRadiance = uBlessingWaveProgress * 0.4;
  
  // Violet-white cosmic edge
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 layerCColor = mix(violetColor, whiteColor, dist / 0.5);
  
  layerCColor += vec3(1.0) * shimmerBand;
  layerCColor += vec3(1.0, 0.95, 0.9) * blessingRadiance;
  
  return layerCColor * ring;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Inner Radiant Shield
  vec3 layerA = innerRadiantShield(uv);
  finalColor += layerA * 0.5;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Mid Hexagonal Lattice Shield
  vec3 layerB = midHexagonalLatticeShield(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Outer Energy Boundary
  vec3 layerC = outerEnergyBoundary(uv);
  finalColor += layerC * 0.3;
  bloomMask = max(bloomMask, length(layerC));
  
  // ============================================
  // BREATH GLOW BOOST
  // ============================================
  // uBreathStrength * 0.3
  float breathGlow = uBreathStrength * 0.3;
  finalColor += vec3(1.0, 0.95, 0.85) * breathGlow;
  bloomMask = max(bloomMask, breathGlow);
  
  // ============================================
  // BLESSINGWAVE RADIANCE
  // ============================================
  // uBlessingWaveProgress * 0.5
  if (uBlessingWaveProgress > 0.0) {
    float blessingRadiance = uBlessingWaveProgress * 0.5;
    vec3 blessingColor = mix(
      vec3(1.0, 0.9, 0.7),  // Gold
      vec3(1.0, 1.0, 1.0),  // White
      uBlessingWaveProgress
    );
    finalColor += blessingColor * blessingRadiance;
    bloomMask = max(bloomMask, blessingRadiance);
  }
  
  // ============================================
  // SHIMMER SPARKLES (High Frequency Noise)
  // ============================================
  float shimmer = fbm(uv * 10.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.2;
  finalColor += vec3(1.0) * shimmer;
  bloomMask = max(bloomMask, shimmer);
  
  // ============================================
  // IDLE GLOW (Subtle even at idle)
  // ============================================
  float idleGlow = 0.15; // Subtle base glow
  finalColor += vec3(1.0, 0.95, 0.9) * idleGlow;
  bloomMask = max(bloomMask, idleGlow);
  
  // ============================================
  // DISTANCE FADE
  // ============================================
  float dist = vRadialDistance;
  float fade = 1.0 - smoothstep(0.45, 0.5, dist);
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  finalColor *= fade;
  
  float alpha = min(length(finalColor), 0.85);
  alpha *= fade;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  gl_FragColor = vec4(finalColor, alpha);
  
  // Bloom mask is stored in alpha channel intensity
  // This will be extracted by the bloom engine
}
`;

