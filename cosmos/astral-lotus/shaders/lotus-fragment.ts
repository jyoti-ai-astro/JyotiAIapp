/**
 * Astral Lotus Fragment Shader
 * 
 * Phase 2 — Section 33: ASTRAL LOTUS ENGINE
 * Astral Lotus Engine (E37)
 * 
 * 3-layer astral lotus: Outer Petal Halo, Middle Inner Petals, Lotus Core Jewel
 */

export const lotusFragmentShader = `
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
varying float vOuterPetalIndex;
varying float vInnerPetalIndex;
varying float vCoreIndex;
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

float sdEllipse(vec2 p, vec2 r) {
  return (length(p / r) - 1.0) * min(r.x, r.y);
}

// ============================================
// LAYER A: OUTER PETAL HALO
// ============================================
vec3 outerPetalHalo(vec2 uv) {
  if (vOuterPetalIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  // 12-24 lotus petals in circular formation (mobile: 10)
  float petalLength = 0.4;
  float petalWidth = 0.18;
  
  // Petal shape (ellipse)
  float petalDist = sdEllipse(p, vec2(petalWidth, petalLength));
  float petalMask = 1.0 - smoothstep(0.0, 0.02, petalDist);
  
  // Breath → bloom pulse (already in vertex)
  
  // Scroll → slow rotation (already in vertex)
  
  // Bass → petal vibration (already in vertex)
  
  // High → shimmer along edges: fbm(uv*8 + time*0.5)*uHigh*0.3
  float edgeShimmer = 0.0;
  if (petalDist > -0.01 && petalDist < 0.02) {
    float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.3;
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer;
  }
  
  // Color: Pink → Gold gradient (soft inner glow)
  vec3 pinkColor = vec3(1.0, 0.7, 0.9);
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  float gradientT = dist / petalLength;
  vec3 petalColor = mix(pinkColor, goldColor, gradientT * 0.6);
  
  return petalColor * petalMask * (1.0 + edgeShimmer) * 0.7;
}

// ============================================
// LAYER B: MIDDLE INNER PETALS
// ============================================
vec3 middleInnerPetals(vec2 uv) {
  if (vInnerPetalIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 6-12 inner petals, tighter, more luminous (mobile: 6)
  float petalLength = 0.25;
  float petalWidth = 0.12;
  
  // Petal shape (ellipse)
  float petalDist = sdEllipse(p, vec2(petalWidth, petalLength));
  float petalMask = 1.0 - smoothstep(0.0, 0.015, petalDist);
  
  // RotationSync → orientation sync (already in vertex)
  
  // BlessingWave → bloom flash pulse: uBlessingWaveProgress*0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Mid → turbulence flutter (already in vertex)
  
  // Color: White → Violet spectral petals
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = dist / petalLength;
  vec3 petalColor = mix(whiteColor, violetColor, gradientT * 0.5);
  
  return petalColor * petalMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER C: LOTUS CORE JEWEL
// ============================================
vec3 lotusCoreJewel(vec2 uv) {
  if (vCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Radiant glowing orb at center
  float coreRadius = 0.08;
  
  // Breath → core pulse (already in vertex)
  
  // Bass → core flicker (already in vertex)
  
  // High → bright shimmer noise: fbm(uv*12 + time)*uHigh*0.4
  float shimmer = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → jewel flash surge: uBlessingWaveProgress*0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Draw core disc
  float coreDist = sdCircle(p, coreRadius);
  float coreMask = 1.0 - smoothstep(0.0, 0.01, coreDist);
  
  // Color: Gold → White → Violet core gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / coreRadius;
  vec3 coreColor;
  if (gradientT < 0.5) {
    coreColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    coreColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    coreColor = mix(coreColor, flashColor, blessingFlash);
  }
  
  return coreColor * coreMask * (1.0 + shimmer + blessingFlash);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Outer Petal Halo
  vec3 layerA = outerPetalHalo(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Middle Inner Petals
  vec3 layerB = middleInnerPetals(uv);
  finalColor += layerB * 0.8;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Lotus Core Jewel
  vec3 layerC = lotusCoreJewel(uv);
  finalColor += layerC * 0.9;
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

