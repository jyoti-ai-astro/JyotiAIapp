/**
 * Gateway v3 Fragment Shader
 * 
 * Phase 2 — Section 56: GATEWAY ENGINE v3
 * Gateway Engine v3 (E60)
 * 
 * 9-layer cosmic portal: Portal Base Disc, Rotating Outer Ring, Inner Vortex Spiral, Portal Glyph Band, Spiral Energy Threads, Portal Rays, Dimensional Tear Layer, Energy Particles, Bloom Mask Layer
 */

export const gatewayFragmentShader = `
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
varying float vBaseDiscIndex;
varying float vOuterRingIndex;
varying float vVortexSpiralIndex;
varying float vGlyphIndex;
varying float vSpiralThreadIndex;
varying float vRayIndex;
varying float vTearIndex;
varying float vParticleIndex;
varying float vBloomIndex;
varying float vRadialSegment;
varying float vConcentricRing;
varying float vDistance;
varying float vRadialDistance;
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
// LAYER A: PORTAL BASE DISC
// ============================================
vec3 portalBaseDisc(vec2 uv) {
  if (vBaseDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64 radial × 32 concentric grid
  // Gradient: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Scroll → rotation acceleration (already in vertex)
  
  // Breath → radius modulation (already in vertex)
  
  // High → shimmer scatter: fbm(uv*5 + time)*uHigh*0.25
  float shimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // White → Gold → Violet gradient
  vec3 discColor;
  if (gradientT < 0.5) {
    discColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    discColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Radial and concentric pattern
  float radialPattern = sin(vAngle * 64.0) * 0.5 + 0.5;
  float concentricPattern = sin(vRadius * 32.0) * 0.5 + 0.5;
  float pattern = (radialPattern + concentricPattern) * 0.5;
  
  return discColor * pattern * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: ROTATING OUTER RING
// ============================================
vec3 rotatingOuterRing(vec2 uv) {
  if (vOuterRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3 nested rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring index
  
  // RotationSync → synced rotation (already in vertex)
  
  // High → spectral shimmer: fbm(uv*7 + time)*uHigh*0.25
  float spectralShimmer = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // White → Gold → Violet gradient
  vec3 ringColor;
  if (gradientT < 0.5) {
    ringColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    ringColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return ringColor * thicknessFade * (1.0 + spectralShimmer) * 0.4;
}

// ============================================
// LAYER C: INNER VORTEX SPIRAL
// ============================================
vec3 innerVortexSpiral(vec2 uv) {
  if (vVortexSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Logarithmic spiral curve
  // Color: Cyan → Blue → Indigo
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Progress along spiral
  
  // Scroll → inward pull (already in vertex)
  
  // Bass → vortex jitter (already in vertex)
  
  // High → spectral shimmer: fbm(uv*6 + time)*uHigh*0.25
  float spectralShimmer = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // Cyan → Blue → Indigo gradient
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(cyanColor, blueColor, gradientT * 2.0);
  } else {
    spiralColor = mix(blueColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Spiral width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return spiralColor * widthFade * (1.0 + spectralShimmer) * 0.5;
}

// ============================================
// LAYER D: PORTAL GLYPH BAND
// ============================================
vec3 portalGlyphBand(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Circular glyph ring (48–72 glyphs)
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph circle SDF
  float glyphRadius = 0.2;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // Bass → glyph wobble (already in vertex)
  
  // High → sparkle noise: fbm(uv*20 + time)*uHigh*0.3
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → glyph flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Gold → Violet gradient
  float gradientT = dist / glyphRadius;
  vec3 glyphColor;
  if (gradientT < 0.5) {
    glyphColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    glyphColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return glyphColor * glyphMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

// ============================================
// LAYER E: SPIRAL ENERGY THREADS
// ============================================
vec3 spiralEnergyThreads(vec2 uv) {
  if (vSpiralThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 spiral threads
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along thread
  
  // Travel speed tied to scroll (already in vertex)
  
  // Breath → thread width modulation
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // High → spectral shimmer: fbm(uv*8 + time)*uHigh*0.25
  float spectralShimmer = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // White → Cyan → Violet gradient
  vec3 threadColor;
  if (gradientT < 0.5) {
    threadColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    threadColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Thread width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return threadColor * widthFade * breathWidth * (1.0 + spectralShimmer) * 0.5;
}

// ============================================
// LAYER F: PORTAL RAYS
// ============================================
vec3 portalRays(vec2 uv) {
  if (vRayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20–40 radial rays
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along ray
  
  // Bass → vibration (already in vertex)
  
  // High → shimmer streaks: fbm(uv*7 + time)*uHigh*0.25
  float shimmerStreaks = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  shimmerStreaks = smoothstep(0.7, 1.0, shimmerStreaks);
  
  // White → Gold → Violet gradient
  vec3 rayColor;
  if (gradientT < 0.5) {
    rayColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    rayColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ray width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return rayColor * widthFade * (1.0 + shimmerStreaks) * 0.4;
}

// ============================================
// LAYER G: DIMENSIONAL TEAR LAYER
// ============================================
vec3 dimensionalTearLayer(vec2 uv) {
  if (vTearIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm distortion texture
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on distortion
  
  // fbm distortion (already in vertex)
  
  // Scroll → tear widening (already in vertex)
  
  // BlessingWave → bright white-violet flash: uBlessingWaveProgress * 1.0
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 1.0;
  }
  
  // White → Violet → Cyan gradient
  vec3 tearColor;
  if (gradientT < 0.5) {
    tearColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    tearColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  // Tear pattern
  float tearPattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    tearColor = mix(tearColor, flashColor, blessingFlash);
  }
  
  return tearColor * tearPattern * (1.0 + blessingFlash) * 0.3;
}

// ============================================
// LAYER H: ENERGY PARTICLES
// ============================================
vec3 energyParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200–320 drifting nodes
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*28 + time)*uHigh*0.3
  float sparkle = fbm(uv * 28.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / particleRadius;
  vec3 particleColor;
  if (gradientT < 0.33) {
    particleColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    particleColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return particleColor * particleMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

// ============================================
// LAYER I: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Soft bloom for postFX
  // Intensifies with blessingWaveProgress
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 4.5, distFromCenter);
  
  // Intensifies with blessingWaveProgress
  float blessingIntensity = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingIntensity = uBlessingWaveProgress * 0.7;
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
  
  // Layer A: Portal Base Disc (base layer)
  vec3 layerA = portalBaseDisc(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Rotating Outer Ring (additive blending)
  vec3 layerB = rotatingOuterRing(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Inner Vortex Spiral (additive blending)
  vec3 layerC = innerVortexSpiral(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Portal Glyph Band (additive blending)
  vec3 layerD = portalGlyphBand(uv);
  finalColor += layerD * 0.7;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Spiral Energy Threads (additive blending)
  vec3 layerE = spiralEnergyThreads(uv);
  finalColor += layerE * 0.5;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Portal Rays (additive blending)
  vec3 layerF = portalRays(uv);
  finalColor += layerF * 0.4;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Dimensional Tear Layer (additive blending)
  vec3 layerG = dimensionalTearLayer(uv);
  finalColor += layerG * 0.3;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Energy Particles (additive blending)
  vec3 layerH = energyParticles(uv);
  finalColor += layerH * 0.7;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Bloom Mask Layer (additive blending)
  vec3 layerI = bloomMaskLayer(uv);
  finalColor += layerI * 0.5;
  bloomMask = max(bloomMask, length(layerI));
  
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

