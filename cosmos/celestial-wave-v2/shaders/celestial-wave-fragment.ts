/**
 * Celestial Wave v2 Fragment Shader
 * 
 * Phase 2 — Section 51: CELESTIAL WAVE ENGINE v2
 * Celestial Wave Engine v2 (E55)
 * 
 * 5-layer harmonic astral wave: Base Harmonic Wave Sheet, Secondary Cross-Wave Sheet, Astral Ripple Rings, Rising Aura Streams, Floating Astral Particles
 */

export const celestialWaveFragmentShader = `
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
varying float vWaveSheetIndex;
varying float vCrossWaveIndex;
varying float vRippleIndex;
varying float vAuraStreamIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWaveHeight;
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
// LAYER A: BASE HARMONIC WAVE SHEET
// ============================================
vec3 baseHarmonicWaveSheet(vec2 uv) {
  if (vWaveSheetIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 28 × 16 units, 64×64 grid
  // Gradient: Cyan → Blue → Indigo
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Based on wave height
  
  // Breath → amplitude pulse (already in vertex)
  
  // Scroll → forward wave propagation (already in vertex)
  
  // Bass → local jitter ripple (already in vertex)
  
  // Mid → turbulence deformation (already in vertex)
  
  // High → shimmer scattering: fbm(uv*5 + time)*uHigh*0.3
  float shimmer = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → white–cyan flash on peaks: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    // Flash on wave peaks
    float peakMask = smoothstep(0.6, 1.0, vWaveHeight);
    blessingFlash = uBlessingWaveProgress * 0.8 * peakMask;
  }
  
  // Cyan → Blue → Indigo gradient
  vec3 waveColor;
  if (gradientT < 0.5) {
    waveColor = mix(cyanColor, blueColor, gradientT * 2.0);
  } else {
    waveColor = mix(blueColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash (white-cyan)
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(vec3(1.0, 1.0, 1.0), cyanColor, 0.5);
    waveColor = mix(waveColor, flashColor, blessingFlash);
  }
  
  return waveColor * (1.0 + shimmer) * 0.6;
}

// ============================================
// LAYER B: SECONDARY CROSS-WAVE SHEET
// ============================================
vec3 secondaryCrossWaveSheet(vec2 uv) {
  if (vCrossWaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 24 × 14 units, 48×48 grid
  // Cross-wave color: White → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on cross-wave height
  
  // RotationSync → wave tilt shift (already in vertex)
  
  // Breath → amplitude scaling (already in vertex)
  
  // Cross-wave pattern
  float crossPattern = sin(uv.x * 4.0 + uv.y * 2.0 + uTime * 0.8) * 0.5 + 0.5;
  
  vec3 crossColor = mix(whiteColor, cyanColor, gradientT * 0.6);
  
  return crossColor * crossPattern * 0.3;
}

// ============================================
// LAYER C: ASTRAL RIPPLE RINGS
// ============================================
vec3 astralRippleRings(vec2 uv) {
  if (vRippleIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12-18 ripple circles (full 2π rings)
  // Color: White → Cyan → Blue
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ripple height
  
  // Scroll → outward ripple propagation (already in vertex)
  
  // BlessingWave → ripple flash: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Bass → ripple jitter (already in vertex)
  
  // High → shimmer: fbm(vec2(angle*3, radius*0.7)+time)*uHigh*0.25
  float shimmer = fbm(vec2(vAngle * 3.0, vRadius * 0.7) + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // White → Cyan → Blue gradient
  vec3 rippleColor;
  if (gradientT < 0.5) {
    rippleColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    rippleColor = mix(cyanColor, blueColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ripple thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return rippleColor * thicknessFade * (1.0 + shimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER D: RISING AURA STREAMS
// ============================================
vec3 risingAuraStreams(vec2 uv) {
  if (vAuraStreamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 60-100 vertical "aura stream" lines
  // Color: White → Cyan → Indigo
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Based on stream height
  
  // Breath → stream height scaling (already in vertex)
  
  // Scroll → upward drift (already in vertex)
  
  // High → spectral flicker: fbm(uv*6 + time)*uHigh*0.25
  float spectralFlicker = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  spectralFlicker = smoothstep(0.7, 1.0, spectralFlicker);
  
  // White → Cyan → Indigo gradient
  vec3 streamColor;
  if (gradientT < 0.5) {
    streamColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    streamColor = mix(cyanColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Stream line pattern
  float streamPattern = sin(uv.x * 8.0 + uTime * 1.0) * 0.5 + 0.5;
  
  return streamColor * streamPattern * (1.0 + spectralFlicker) * 0.3;
}

// ============================================
// LAYER E: FLOATING ASTRAL PARTICLES
// ============================================
vec3 floatingAstralParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 180-260 particles (mobile: 120)
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Breath → expansion (already in vertex)
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*24 + time)*uHigh*0.3
  float sparkle = fbm(uv * 24.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
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

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Base Harmonic Wave Sheet (base layer)
  vec3 layerA = baseHarmonicWaveSheet(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Secondary Cross-Wave Sheet (additive blending)
  vec3 layerB = secondaryCrossWaveSheet(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Astral Ripple Rings (additive blending)
  vec3 layerC = astralRippleRings(uv);
  finalColor += layerC * 0.4;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Rising Aura Streams (additive blending)
  vec3 layerD = risingAuraStreams(uv);
  finalColor += layerD * 0.3;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Floating Astral Particles (additive blending)
  vec3 layerE = floatingAstralParticles(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
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

