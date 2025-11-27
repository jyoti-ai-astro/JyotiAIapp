/**
 * Prana Field Fragment Shader
 * 
 * Phase 2 — Section 18: PRANA FIELD ENGINE
 * Prana Field Engine (E22)
 * 
 * 3-layer prana field: Inner Breath Aura, Mid Pranic Shell, Outer Expansion Field
 */

export const pranaFragmentShader = `
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
// LAYER A: INNER BREATH AURA
// ============================================
vec3 innerBreathAura(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Pulsing halo synchronized to breathPhase
  // Radius: 0.6 → 1.0 (inhale), 1.0 → 0.6 (exhale)
  float baseRadius = 0.3;
  float pulseRadius = baseRadius + uBreathStrength * 0.2; // 0.3 to 0.5 (scaled to 0.6-1.0 in normalized space)
  
  // Raymarched ring
  float ringDist = sdRing(p, pulseRadius, 0.05);
  float ring = 1.0 - smoothstep(0.0, 0.02, ringDist);
  
  // Color: Gold → White (breath linked)
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 layerAColor = mix(goldColor, whiteColor, uBreathStrength);
  
  // Audio-reactive shimmer (uHigh * 0.2)
  float shimmer = sin(uTime * 15.0 + dist * 20.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.2;
  
  return layerAColor * ring * (1.0 + shimmer);
}

// ============================================
// LAYER B: MID PRANIC SHELL
// ============================================
vec3 midPranicShell(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Turbulence field based on fbm distortion
  float turbulence = fbm(p * 2.0 + uTime * 0.3) * uMid * 0.3;
  
  // Mid-frequency audio → turbulence boost
  turbulence *= (1.0 + uMid * 0.5);
  
  // Scroll → vertical lift of prana shell
  float verticalLift = uScroll * 0.2;
  p.y += verticalLift;
  
  // Layer thickness pulsates with breath
  float shellThickness = 0.08 + uBreathStrength * 0.04;
  float shellRadius = 0.4 + turbulence;
  
  // Raymarched ring
  float ringDist = sdRing(p, shellRadius, shellThickness);
  float ring = 1.0 - smoothstep(0.0, 0.03, ringDist);
  
  // Color: Light gold
  vec3 layerBColor = vec3(1.0, 0.9, 0.7);
  
  return layerBColor * ring;
}

// ============================================
// LAYER C: OUTER EXPANSION FIELD
// ============================================
vec3 outerExpansionField(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Large radial prana wave
  float baseRadius = 0.5;
  
  // Bass → expansion strength (0.8 → 1.2 scale)
  float bassExpansion = 0.8 + uBass * 0.4; // 0.8 to 1.2
  float expansionRadius = baseRadius * bassExpansion;
  
  // BlessingWave → intensity surge (1.0 + waveProgress * 0.4)
  float blessingSurge = 1.0 + uBlessingWaveProgress * 0.4;
  expansionRadius *= blessingSurge;
  
  // Raymarched ring
  float ringDist = sdRing(p, expansionRadius, 0.1);
  float ring = 1.0 - smoothstep(0.0, 0.05, ringDist);
  
  // Color ramp: Gold → White → Violet
  float colorPhase = dist / 0.5; // Normalize to 0-1
  vec3 layerCColor;
  if (colorPhase < 0.5) {
    // Gold → White
    layerCColor = mix(
      vec3(1.0, 0.85, 0.5),  // Gold
      vec3(1.0, 1.0, 1.0),   // White
      colorPhase * 2.0
    );
  } else {
    // White → Violet
    layerCColor = mix(
      vec3(1.0, 1.0, 1.0),   // White
      vec3(0.8, 0.6, 1.0),   // Violet
      (colorPhase - 0.5) * 2.0
    );
  }
  
  return layerCColor * ring;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  
  // Layer A: Inner Breath Aura
  vec3 layerA = innerBreathAura(uv);
  finalColor += layerA * 0.5;
  
  // Layer B: Mid Pranic Shell
  vec3 layerB = midPranicShell(uv);
  finalColor += layerB * 0.4;
  
  // Layer C: Outer Expansion Field
  vec3 layerC = outerExpansionField(uv);
  finalColor += layerC * 0.3;
  
  // ============================================
  // BREATH GLOW BOOST
  // ============================================
  // uBreathStrength * 0.4
  float breathGlow = uBreathStrength * 0.4;
  finalColor += vec3(1.0, 0.95, 0.85) * breathGlow;
  
  // ============================================
  // BLESSINGWAVE RADIANCE
  // ============================================
  // uBlessingWaveProgress * 0.6
  if (uBlessingWaveProgress > 0.0) {
    float blessingRadiance = uBlessingWaveProgress * 0.6;
    vec3 blessingColor = mix(
      vec3(1.0, 0.9, 0.7),  // Gold
      vec3(1.0, 1.0, 1.0),  // White
      uBlessingWaveProgress
    );
    finalColor += blessingColor * blessingRadiance;
  }
  
  // ============================================
  // SHIMMER SPARKLES (High Frequency)
  // ============================================
  float shimmer = fbm(uv * 8.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  finalColor += vec3(1.0) * shimmer;
  
  // ============================================
  // DISTANCE FADE (Edge Smoothstep)
  // ============================================
  float dist = vRadialDistance;
  float fade = 1.0 - smoothstep(0.4, 0.5, dist);
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  finalColor *= fade;
  
  float alpha = min(length(finalColor), 0.9);
  alpha *= fade;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

