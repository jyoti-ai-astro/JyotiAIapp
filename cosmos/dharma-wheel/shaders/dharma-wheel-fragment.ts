/**
 * Dharma Wheel Fragment Shader
 * 
 * Phase 2 — Section 24: DHARMA WHEEL ENGINE
 * Dharma Wheel Engine (E28)
 * 
 * 3-layer divine wheel: Outer Chakra Wheel, Inner Flame Rings, Core Mandala Jewel
 */

export const dharmaWheelFragmentShader = `
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
varying float vWheelIndex;
varying float vFlameRingIndex;
varying float vJewelIndex;
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
// LAYER A: OUTER CHAKRA WHEEL
// ============================================
vec3 outerChakraWheel(vec2 uv) {
  if (vWheelIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  // 12-spoke Dharma wheel
  float numSpokes = 12.0;
  float spokeAngle = angle * numSpokes / 6.28318; // Normalize to 0-12
  float spokeIndex = floor(spokeAngle);
  float spokeFract = fract(spokeAngle);
  
  // Draw spokes
  float spokeThickness = 0.015;
  float spokeLength = 0.4;
  float spokeDist = dist;
  float spokeMask = 1.0 - smoothstep(0.0, spokeThickness, abs(spokeFract - 0.5) * 2.0);
  spokeMask *= step(0.0, spokeDist) * step(spokeDist, spokeLength);
  
  // Outer ring
  float ringRadius = 0.45;
  float ringThickness = 0.02;
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Inner ring
  float innerRingRadius = 0.15;
  float innerRingThickness = 0.015;
  float innerRingDist = sdRing(p, innerRingRadius, innerRingThickness);
  float innerRingMask = 1.0 - smoothstep(0.0, 0.01, innerRingDist);
  
  // Combine spokes and rings
  float wheelMask = max(spokeMask, max(ringMask, innerRingMask));
  
  // High → shimmer on spoke edges
  float shimmer = fbm(uv * 15.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  
  // Color: Gold → White gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / 0.5; // Normalize to 0-1
  vec3 wheelColor = mix(goldColor, whiteColor, gradientT);
  
  return wheelColor * wheelMask * (1.0 + shimmer);
}

// ============================================
// LAYER B: INNER FLAME RINGS
// ============================================
vec3 innerFlameRings(vec2 uv) {
  if (vFlameRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  // 3 rotating flame rings
  float ringRadius = 0.0;
  float ringThickness = 0.0;
  
  if (vFlameRingIndex == 0.0) {
    // Ring 1
    ringRadius = 0.25;
    ringThickness = 0.03;
  } else if (vFlameRingIndex == 1.0) {
    // Ring 2
    ringRadius = 0.20;
    ringThickness = 0.025;
  } else if (vFlameRingIndex == 2.0) {
    // Ring 3
    ringRadius = 0.15;
    ringThickness = 0.02;
  }
  
  // Flame turbulence: fbm(uv*10 + time*0.5) * uMid * 0.3
  float flameTurbulence = fbm(uv * 10.0 + uTime * 0.5) * uMid * 0.3;
  float adjustedRadius = ringRadius + flameTurbulence * 0.1;
  
  // Draw ring
  float ringDist = sdRing(p, adjustedRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.02, ringDist);
  
  // BlessingWave → intensity burst (gold→white→violet)
  vec3 flameColor;
  if (uBlessingWaveProgress > 0.0) {
    vec3 goldColor = vec3(1.0, 0.85, 0.5);
    vec3 whiteColor = vec3(1.0, 1.0, 1.0);
    vec3 violetColor = vec3(0.8, 0.6, 1.0);
    
    if (uBlessingWaveProgress < 0.5) {
      flameColor = mix(goldColor, whiteColor, uBlessingWaveProgress * 2.0);
    } else {
      flameColor = mix(whiteColor, violetColor, (uBlessingWaveProgress - 0.5) * 2.0);
    }
  } else {
    flameColor = vec3(1.0, 0.9, 0.6); // Default gold
  }
  
  return flameColor * ringMask * (1.0 + uBlessingWaveProgress * 0.5);
}

// ============================================
// LAYER C: CORE MANDALA JEWEL
// ============================================
vec3 coreMandalaJewel(vec2 uv) {
  if (vJewelIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glowing jewel at center (Sanskrit bindu style)
  float jewelRadius = 0.08;
  
  // Distance from jewel center
  float jewelDist = sdCircle(p, jewelRadius);
  float jewelGlow = 1.0 - smoothstep(0.0, jewelRadius * 2.0, jewelDist);
  
  // Pulse synced to breath (already in vertex)
  
  // High → sparkle flicker: fbm(uv*20 + time) * uHigh * 0.4
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.4;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → radiant spike pattern
  float spikePattern = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    float spikeAngle = atan(p.y, p.x);
    float spikeCount = 8.0;
    float spike = sin(spikeAngle * spikeCount + uTime * 2.0) * 0.5 + 0.5;
    spike = smoothstep(0.7, 1.0, spike);
    spikePattern = spike * uBlessingWaveProgress;
  }
  
  // Color: White-gold core with violet halo
  vec3 coreColor = vec3(1.0, 0.95, 0.9); // White-gold
  vec3 haloColor = vec3(0.8, 0.6, 1.0); // Violet
  
  float haloDist = dist / jewelRadius;
  vec3 jewelColor = mix(coreColor, haloColor, smoothstep(0.5, 1.0, haloDist));
  
  return jewelColor * jewelGlow * (1.0 + sparkle + spikePattern);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Outer Chakra Wheel
  vec3 layerA = outerChakraWheel(uv);
  finalColor += layerA * 0.6;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Inner Flame Rings
  vec3 layerB = innerFlameRings(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Core Mandala Jewel
  vec3 layerC = coreMandalaJewel(uv);
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

