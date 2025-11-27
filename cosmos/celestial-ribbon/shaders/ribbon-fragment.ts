/**
 * Celestial Ribbon Fragment Shader
 * 
 * Phase 2 — Section 38: CELESTIAL RIBBON ENGINE
 * Celestial Ribbon Engine (E42)
 * 
 * 3-layer celestial ribbon: Primary Energy Ribbons, Twin Spiral Ribbons, Celestial Thread Particles
 */

export const ribbonFragmentShader = `
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
varying float vRibbonIndex;
varying float vSpiralIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vRibbonProgress;

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

// ============================================
// LAYER A: PRIMARY ENERGY RIBBONS
// ============================================
vec3 primaryEnergyRibbons(vec2 uv) {
  if (vRibbonIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3-5 flowing bezier ribbons
  // Ribbon thickness: 0.025-0.04
  float ribbonThickness = 0.032;
  float ribbonDist = abs(uv.y - 0.5) * ribbonThickness * 2.0;
  float ribbonMask = 1.0 - smoothstep(0.0, ribbonThickness, ribbonDist);
  
  // Breath → amplitude swell (already in vertex)
  
  // Scroll → forward progression (already in vertex)
  
  // Bass → wave vibration (already in vertex)
  
  // High → shimmer pulses: fbm(uv*8 + time)*uHigh*0.3
  float shimmer = fbm(uv * 8.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Noise shimmer on edges
  float edgeShimmer = 0.0;
  if (ribbonDist > ribbonThickness * 0.7) {
    edgeShimmer = fbm(uv * 10.0 + uTime * 0.5) * uHigh * 0.25;
    edgeShimmer = smoothstep(0.6, 1.0, edgeShimmer);
  }
  
  // Breath swelling intensity
  float breathIntensity = 1.0 + uBreathStrength * 0.2;
  
  // Color: Gold → White → Violet gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vRibbonProgress; // Progress along ribbon
  vec3 ribbonColor;
  if (gradientT < 0.5) {
    ribbonColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    ribbonColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Glow falloff
  float glowFalloff = 1.0 - smoothstep(0.0, ribbonThickness, ribbonDist);
  
  return ribbonColor * ribbonMask * glowFalloff * breathIntensity * (1.0 + shimmer + edgeShimmer) * 0.7;
}

// ============================================
// LAYER B: TWIN SPIRAL RIBBONS
// ============================================
vec3 twinSpiralRibbons(vec2 uv) {
  if (vSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Two helically twisting ribbons
  // Thickness: 0.02
  float spiralThickness = 0.02;
  float spiralDist = abs(uv.y - 0.5) * spiralThickness * 2.0;
  float spiralMask = 1.0 - smoothstep(0.0, spiralThickness, spiralDist);
  
  // RotationSync → spiral phase shift (already in vertex)
  
  // BlessingWave → ribbon-wide glow blast: uBlessingWaveProgress * 0.6
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.6;
  }
  
  // Mid → turbulence curl (already in vertex)
  
  // Color: White–Blue spectral gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  float gradientT = vUv.x; // Progress along spiral
  vec3 spiralColor = mix(whiteColor, blueColor, gradientT * 0.6);
  
  // Glow falloff
  float glowFalloff = 1.0 - smoothstep(0.0, spiralThickness, spiralDist);
  
  return spiralColor * spiralMask * glowFalloff * (1.0 + blessingGlow) * 0.6;
}

// ============================================
// LAYER C: CELESTIAL THREAD PARTICLES
// ============================================
vec3 celestialThreadParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 40-80 micro particles traveling along ribbons (mobile: 30)
  float particleRadius = 0.015;
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Breath → acceleration (already in vertex)
  
  // Scroll → forward drag (already in vertex)
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*12 + time)*uHigh*0.4
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.4;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Color: White–Gold sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  float gradientT = dist / particleRadius;
  vec3 particleColor = mix(whiteColor, goldColor, gradientT * 0.5);
  
  return particleColor * particleMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Energy Ribbons
  vec3 layerA = primaryEnergyRibbons(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Twin Spiral Ribbons
  vec3 layerB = twinSpiralRibbons(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Celestial Thread Particles
  vec3 layerC = celestialThreadParticles(uv);
  finalColor += layerC * 0.8;
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

