/**
 * Cosmic Lens Fragment Shader
 * 
 * Phase 2 — Section 49: COSMIC LENS ENGINE
 * Cosmic Lens Engine (E53)
 * 
 * 3-layer cosmic lens: Primary Curved Space Lens, Light Arc Refractions, Lens Dust & Photon Particles
 */

export const cosmicLensFragmentShader = `
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
varying float vLensIndex;
varying float vArcIndex;
varying float vPhotonIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWarpHeight;
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
// LAYER A: PRIMARY CURVED SPACE LENS
// ============================================
vec3 primaryCurvedSpaceLens(vec2 uv) {
  if (vLensIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Massive curved-space distortion plane
  // Gradient: Blue → Cyan → White
  vec3 blueColor = vec3(0.2, 0.4, 0.8);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  
  float gradientT = vGradientProgress; // Based on warp height
  
  // Breath → distortion amplitude boost (already in vertex)
  
  // Scroll → gravitational pull-in effect (already in vertex)
  
  // Bass → ripple jitter (already in vertex)
  
  // High → micro-lens shimmer: fbm(uv*4 + time)*uHigh*0.3
  float shimmer = fbm(uv * 4.0 + uTime * 0.3) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → lens flare flash (white→violet): uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // Blue → Cyan → White gradient
  vec3 lensColor;
  if (gradientT < 0.5) {
    lensColor = mix(blueColor, cyanColor, gradientT * 2.0);
  } else {
    lensColor = mix(cyanColor, whiteColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash (white → violet)
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, vec3(0.8, 0.6, 1.0), 0.5);
    lensColor = mix(lensColor, flashColor, blessingFlash);
  }
  
  // Radial fade from center
  float radialFade = 1.0 - smoothstep(0.0, 12.0, vRadialDistance);
  
  return lensColor * radialFade * (1.0 + shimmer) * 0.6;
}

// ============================================
// LAYER B: LIGHT ARC REFRACTIONS
// ============================================
vec3 lightArcRefractions(vec2 uv) {
  if (vArcIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3-6 crescent light arcs bending around center
  // Colors: White → Blue → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on arc height
  
  // RotationSync → arc bending skew (already in vertex)
  
  // Breath → arc width expansion (already in vertex)
  
  // Mid → turbulence injection (already in vertex)
  
  // High → refraction shimmer: fbm(vec2(angle*3, radius*0.7)+time)*uHigh*0.25
  float refractionShimmer = fbm(vec2(vAngle * 3.0, vRadius * 0.7) + uTime * 0.3) * uHigh * 0.25;
  refractionShimmer = smoothstep(0.7, 1.0, refractionShimmer);
  
  // BlessingWave → violet refraction flash: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // White → Blue → Violet gradient
  vec3 arcColor;
  if (gradientT < 0.5) {
    arcColor = mix(whiteColor, blueColor, gradientT * 2.0);
  } else {
    arcColor = mix(blueColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Arc thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return arcColor * thicknessFade * (1.0 + refractionShimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER C: LENS DUST & PHOTON PARTICLES
// ============================================
vec3 lensDustPhotonParticles(vec2 uv) {
  if (vPhotonIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200-320 drifting photon particles (mobile: 150)
  // Radius: 0.01-0.015
  float photonRadius = 0.0125;
  float photonDist = sdCircle(p, photonRadius);
  float photonMask = 1.0 - smoothstep(0.0, photonRadius * 2.0, photonDist);
  
  // Breath → spiral expansion (already in vertex)
  
  // Bass → jitter flicker (already in vertex)
  
  // High → photon sparkle noise: fbm(uv*20 + time)*uHigh*0.3
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → pulse flash: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Color: White–Cyan–Indigo sparks
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = dist / photonRadius;
  vec3 photonColor;
  if (gradientT < 0.33) {
    photonColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    photonColor = mix(cyanColor, indigoColor, (gradientT - 0.33) * 1.5);
  }
  
  return photonColor * photonMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Curved Space Lens (base layer)
  vec3 layerA = primaryCurvedSpaceLens(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Light Arc Refractions (additive blending)
  vec3 layerB = lightArcRefractions(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Lens Dust & Photon Particles (additive blending)
  vec3 layerC = lensDustPhotonParticles(uv);
  finalColor += layerC * 0.7;
  bloomMask = max(bloomMask, length(layerC));
  
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

