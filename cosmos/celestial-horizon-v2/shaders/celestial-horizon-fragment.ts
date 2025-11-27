/**
 * Celestial Horizon v2 Fragment Shader
 * 
 * Phase 2 — Section 52: CELESTIAL HORIZON ENGINE v2
 * Celestial Horizon Engine v2 (E56)
 * 
 * 7-layer atmospheric quantum horizon: Base Horizon Gradient Plane, Atmospheric Fog Bands, Quantum Diffraction Edge, Celestial Aurora Bands, Horizon Light Rays, Atmospheric Dust Particles, Horizon Bloom Layer
 */

export const celestialHorizonFragmentShader = `
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
varying float vGradientIndex;
varying float vFogBandIndex;
varying float vDiffractionIndex;
varying float vAuroraIndex;
varying float vRayIndex;
varying float vParticleIndex;
varying float vBloomIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vHeight;
varying float vGradientProgress;
varying float vAngle;
varying float vRadius;

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
// LAYER A: BASE HORIZON GRADIENT PLANE
// ============================================
vec3 baseHorizonGradientPlane(vec2 uv) {
  if (vGradientIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 36 × 18 units, 64×48 grid
  // Vertical gradient:
  // bottom: deep indigo
  // mid: blue/cyan
  // top: violet haze
  vec3 deepIndigo = vec3(0.1, 0.1, 0.3);
  vec3 blueColor = vec3(0.2, 0.4, 0.8);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetHaze = vec3(0.6, 0.4, 0.9);
  
  float gradientT = vGradientProgress; // 0 (bottom) to 1 (top)
  
  // Breath → atmospheric swell (already in vertex)
  
  // Scroll → horizon pan (already in vertex)
  
  // Bass → micro jitter shimmer: fbm(uv*4 + time)*uBass*0.2
  float bassShimmer = fbm(uv * 4.0 + uTime * 0.3) * uBass * 0.2;
  bassShimmer = smoothstep(0.6, 1.0, bassShimmer);
  
  // High → micro-Lensing shimmer: fbm(uv*5 + time)*uHigh*0.25
  float lensingShimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  lensingShimmer = smoothstep(0.7, 1.0, lensingShimmer);
  
  // BlessingWave → horizon flash bloom: uBlessingWaveProgress * 0.8
  float blessingBloom = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingBloom = uBlessingWaveProgress * 0.8;
  }
  
  // Deep indigo → Blue/Cyan → Violet haze gradient
  vec3 horizonColor;
  if (gradientT < 0.33) {
    horizonColor = mix(deepIndigo, blueColor, gradientT * 3.0);
  } else if (gradientT < 0.66) {
    horizonColor = mix(blueColor, cyanColor, (gradientT - 0.33) * 3.0);
  } else {
    horizonColor = mix(cyanColor, violetHaze, (gradientT - 0.66) * 3.0);
  }
  
  // Add blessing bloom
  if (blessingBloom > 0.0) {
    vec3 bloomColor = mix(cyanColor, violetHaze, 0.5);
    horizonColor = mix(horizonColor, bloomColor, blessingBloom * 0.4);
  }
  
  return horizonColor * (1.0 + bassShimmer + lensingShimmer) * 0.7;
}

// ============================================
// LAYER B: ATMOSPHERIC FOG BANDS
// ============================================
vec3 atmosphericFogBands(vec2 uv) {
  if (vFogBandIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 4-6 horizontal fog strata
  // Color: Blue/Cyan transparent fog
  vec3 blueFog = vec3(0.2, 0.5, 0.9);
  vec3 cyanFog = vec3(0.2, 0.7, 0.9);
  
  float fogIntensity = vGradientProgress; // Based on fog band function
  
  // Breath → fog band swell (already in vertex)
  
  // Scroll → fog drift (already in vertex)
  
  // Mix blue and cyan
  vec3 fogColor = mix(blueFog, cyanFog, fogIntensity * 0.5);
  
  // Soft opacity fade
  float opacity = fogIntensity * 0.4;
  
  return fogColor * opacity;
}

// ============================================
// LAYER C: QUANTUM DIFFRACTION EDGE
// ============================================
vec3 quantumDiffractionEdge(vec2 uv) {
  if (vDiffractionIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Edge line where horizon meets void
  // Thin 1-2 unit band
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Bass → diffraction vibration (already in vertex)
  
  // High → diffraction sparkle: fbm(uv*8 + time)*uHigh*0.3
  float sparkle = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.3;
  sparkle = smoothstep(0.7, 1.0, sparkle);
  
  // BlessingWave → pulse flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Cyan → Violet gradient
  vec3 edgeColor;
  if (gradientT < 0.5) {
    edgeColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    edgeColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Edge thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return edgeColor * thicknessFade * (1.0 + sparkle + blessingFlash) * 0.6;
}

// ============================================
// LAYER D: CELESTIAL AURORA BANDS
// ============================================
vec3 celestialAuroraBands(vec2 uv) {
  if (vAuroraIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3-5 vertical aurora curtains
  // Color: Cyan → Blue → Violet
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → aurora height swell (already in vertex)
  
  // Scroll → vertical drift (already in vertex)
  
  // High → spectral flicker: fbm(uv*6 + time)*uHigh*0.25
  float spectralFlicker = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  spectralFlicker = smoothstep(0.7, 1.0, spectralFlicker);
  
  // Cyan → Blue → Violet gradient
  vec3 auroraColor;
  if (gradientT < 0.5) {
    auroraColor = mix(cyanColor, blueColor, gradientT * 2.0);
  } else {
    auroraColor = mix(blueColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Aurora curtain pattern
  float curtainPattern = sin(uv.x * 3.0 + uTime * 1.0) * 0.5 + 0.5;
  
  return auroraColor * curtainPattern * (1.0 + spectralFlicker) * 0.3;
}

// ============================================
// LAYER E: HORIZON LIGHT RAYS
// ============================================
vec3 horizonLightRays(vec2 uv) {
  if (vRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20-40 radial light rays emanating from center
  // Geometry: thin triangular wedges
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Bass → ray vibration (already in vertex)
  
  // High → shimmer noise: fbm(uv*7 + time)*uHigh*0.25
  float shimmer = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → ray flash: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // White → Gold → Violet gradient
  vec3 rayColor;
  if (gradientT < 0.5) {
    rayColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    rayColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ray wedge fade
  float wedgeFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  wedgeFade = smoothstep(0.0, 0.3, wedgeFade);
  
  return rayColor * wedgeFade * (1.0 + shimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER F: ATMOSPHERIC DUST PARTICLES
// ============================================
vec3 atmosphericDustParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 150-220 particles (mobile: 120)
  // Radius: 0.01-0.015
  float dustRadius = 0.0125;
  float dustDist = sdCircle(p, dustRadius);
  float dustMask = 1.0 - smoothstep(0.0, dustRadius * 2.0, dustDist);
  
  // Breath → expansion (already in vertex)
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*26 + time)*uHigh*0.3
  float sparkle = fbm(uv * 26.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → dust flash pulse: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / dustRadius;
  vec3 dustColor;
  if (gradientT < 0.33) {
    dustColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    dustColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return dustColor * dustMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

// ============================================
// LAYER G: HORIZON BLOOM LAYER
// ============================================
vec3 horizonBloomLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Soft Gaussian bloom
  // Controlled via alpha mask
  // Integrates with E12 PostFX bloom
  // Intensifies during blessing wave
  
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 18.0, distFromCenter);
  
  // Blessing wave intensifies bloom
  float blessingIntensity = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingIntensity = uBlessingWaveProgress * 0.6;
  }
  
  bloomIntensity = min(bloomIntensity + blessingIntensity, 1.0);
  
  // Soft white-violet bloom color
  vec3 bloomColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.6, 1.0), 0.4);
  
  return bloomColor * bloomIntensity * 0.3;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Base Horizon Gradient Plane (base layer)
  vec3 layerA = baseHorizonGradientPlane(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Atmospheric Fog Bands (additive blending)
  vec3 layerB = atmosphericFogBands(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Quantum Diffraction Edge (additive blending)
  vec3 layerC = quantumDiffractionEdge(uv);
  finalColor += layerC * 0.6;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Celestial Aurora Bands (additive blending)
  vec3 layerD = celestialAuroraBands(uv);
  finalColor += layerD * 0.4;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Horizon Light Rays (additive blending)
  vec3 layerE = horizonLightRays(uv);
  finalColor += layerE * 0.4;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Atmospheric Dust Particles (additive blending)
  vec3 layerF = atmosphericDustParticles(uv);
  finalColor += layerF * 0.7;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Horizon Bloom Layer (additive blending)
  vec3 layerG = horizonBloomLayer(uv);
  finalColor += layerG * 0.5;
  bloomMask = max(bloomMask, length(layerG));
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.95);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

