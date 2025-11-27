/**
 * Cosmic Orbit Fragment Shader
 * 
 * Phase 2 — Section 37: COSMIC ORBIT ENGINE
 * Cosmic Orbit Engine (E41)
 * 
 * 3-layer cosmic orbit: Primary Orbit Rings, Satellite Souls, Cosmic Nexus Core
 */

export const orbitFragmentShader = `
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
varying float vOrbitRingIndex;
varying float vSatelliteIndex;
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

float sdRing(vec2 p, float r, float thickness) {
  return abs(length(p) - r) - thickness;
}

// Orbit radii: [0.9, 1.2, 1.5, 1.8]
float getOrbitRadius(int index) {
  if (index == 0) return 0.9;
  if (index == 1) return 1.2;
  if (index == 2) return 1.5;
  return 1.8;
}

// ============================================
// LAYER A: PRIMARY ORBIT RINGS
// ============================================
vec3 primaryOrbitRings(vec2 uv) {
  if (vOrbitRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 2-4 elliptical orbits
  int ringIdx = int(vOrbitRingIndex);
  float orbitRadius = getOrbitRadius(ringIdx);
  float breathExpansion = 1.0 + uBreathStrength * 0.1;
  orbitRadius *= breathExpansion;
  
  // Thickness: 0.02
  float ringThickness = 0.02;
  
  // Elliptical orbit (slightly elliptical)
  float ellipseRatio = 0.95;
  vec2 ellipseRadii = vec2(orbitRadius, orbitRadius * ellipseRatio);
  
  // Draw elliptical ring
  float ringDist = sdRing(p, orbitRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Scroll → orbit rotational speed (already in vertex)
  
  // Bass → harmonic wobble (already in vertex)
  
  // High → shimmering nodes along ellipse: fbm(uv*10 + time)*uHigh*0.3
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Color: Gold → White gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / orbitRadius;
  vec3 ringColor = mix(goldColor, whiteColor, gradientT * 0.5);
  
  return ringColor * ringMask * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: SATELLITE SOULS
// ============================================
vec3 satelliteSouls(vec2 uv) {
  if (vSatelliteIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 6-12 orbiting particles (mobile: 6)
  float particleRadius = 0.03;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, 0.01, particleDist);
  
  // RotationSync → orbit inclination shift (already in vertex)
  
  // BlessingWave → satellite glow burst: uBlessingWaveProgress * 0.6
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.6;
  }
  
  // Bass → jitter wobble (already in vertex)
  
  // Mid → turbulence drift (already in vertex)
  
  // Color: white-gold particles
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  float gradientT = dist / particleRadius;
  vec3 particleColor = mix(whiteColor, goldColor, gradientT * 0.5);
  
  return particleColor * particleMask * (1.0 + blessingGlow) * 0.8;
}

// ============================================
// LAYER C: COSMIC NEXUS CORE
// ============================================
vec3 cosmicNexusCore(vec2 uv) {
  if (vCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glowing rotating disc behind Guru
  float coreRadius = 0.25;
  float breathPulse = 1.0 + uBreathStrength * 0.15;
  coreRadius *= breathPulse;
  
  // Bass → radial flicker (already in vertex)
  
  // High → cosmic shimmering texture: fbm(uv*12 + time)*uHigh*0.4
  float shimmer = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Draw core disc
  float coreDist = sdCircle(p, coreRadius);
  float coreMask = 1.0 - smoothstep(0.0, 0.01, coreDist);
  
  // Color: White → Violet → Cosmic Blue gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cosmicBlueColor = vec3(0.3, 0.5, 1.0);
  
  float gradientT = dist / coreRadius;
  vec3 coreColor;
  if (gradientT < 0.33) {
    coreColor = mix(whiteColor, violetColor, gradientT * 3.0);
  } else if (gradientT < 0.66) {
    coreColor = mix(violetColor, cosmicBlueColor, (gradientT - 0.33) * 3.0);
  } else {
    coreColor = cosmicBlueColor;
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
  
  // Layer A: Primary Orbit Rings
  vec3 layerA = primaryOrbitRings(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Satellite Souls
  vec3 layerB = satelliteSouls(uv);
  finalColor += layerB * 0.8;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Cosmic Nexus Core
  vec3 layerC = cosmicNexusCore(uv);
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

