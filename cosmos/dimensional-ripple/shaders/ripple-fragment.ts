/**
 * Dimensional Ripple Fragment Shader
 * 
 * Phase 2 — Section 43: DIMENSIONAL RIPPLE ENGINE
 * Dimensional Ripple Engine (E47)
 * 
 * 3-layer dimensional ripple: Spacetime Ripple Plane, Radial Warp Vortex, Drift Particles
 */

export const rippleFragmentShader = `
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
varying float vRippleIndex;
varying float vWarpIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vRippleHeight;
varying float vGradientProgress;

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
// LAYER A: SPACETIME RIPPLE PLANE
// ============================================
vec3 spacetimeRipplePlane(vec2 uv) {
  if (vRippleIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Large plane: 22 × 14 units
  // Gradient: Indigo → Blue → Black
  vec3 indigoColor = vec3(0.15, 0.1, 0.3);
  vec3 blueColor = vec3(0.1, 0.2, 0.4);
  vec3 blackColor = vec3(0.02, 0.02, 0.05);
  
  float gradientT = vGradientProgress; // Based on ripple height
  
  // Breath → ripple amplitude (already in vertex)
  
  // Scroll → ripple propagation outward (already in vertex)
  
  // Bass → shockwave jitter (already in vertex)
  
  // High → micro shimmer: fbm(uv*5 + time)*uHigh*0.2
  float shimmer = fbm(uv * 5.0 + uTime * 0.4) * uHigh * 0.2;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → dimensional flash (white-violet crest): uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    // Flash stronger on ripple crests (higher ripple height)
    float crestFactor = smoothstep(0.0, 0.15, abs(vRippleHeight));
    blessingFlash = uBlessingWaveProgress * 0.6 * crestFactor;
  }
  
  // Indigo → Blue → Black gradient
  vec3 gradientColor;
  if (gradientT < 0.5) {
    gradientColor = mix(indigoColor, blueColor, gradientT * 2.0);
  } else {
    gradientColor = mix(blueColor, blackColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add white-violet flash on crests
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.6, 1.0), 0.5);
    gradientColor = mix(gradientColor, flashColor, blessingFlash);
  }
  
  return gradientColor * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: RADIAL WARP VORTEX
// ============================================
vec3 radialWarpVortex(vec2 uv) {
  if (vWarpIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Centered radial displacement
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Violet–White rings
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  
  // RotationSync → wave rotation offset (already in vertex)
  
  // Mid → turbulence (fbm) (already in vertex)
  
  // High → shimmering rings: fbm(uv*6 + time)*uHigh*0.3
  float shimmer = fbm(uv * 6.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Scroll → outward expansion (already in vertex)
  
  // BlessingWave → ring flash: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Radial warp glow (intensity based on warp height)
  float warpIntensity = abs(vRippleHeight) * 10.0;
  vec3 warpColor = mix(violetColor, whiteColor, warpIntensity * 0.3);
  
  // Ring pattern
  float ringPattern = sin(dist * 20.0 - uTime * 2.0) * 0.5 + 0.5;
  warpColor *= ringPattern;
  
  return warpColor * (1.0 + shimmer + blessingFlash) * 0.4;
}

// ============================================
// LAYER C: DRIFT PARTICLES
// ============================================
vec3 driftParticles(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 100-180 drifting points (mobile: 70)
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Breath → drift radius modulation (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*12 + time)*uHigh*0.3
  float sparkle = fbm(uv * 12.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → particle flash: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Color: White–Blue micro glints
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  float gradientT = dist / particleRadius;
  vec3 particleColor = mix(whiteColor, blueColor, gradientT * 0.4);
  
  return particleColor * particleMask * (1.0 + sparkle + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Spacetime Ripple Plane (base layer)
  vec3 layerA = spacetimeRipplePlane(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Radial Warp Vortex (additive blending)
  vec3 layerB = radialWarpVortex(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Drift Particles (additive blending)
  vec3 layerC = driftParticles(uv);
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

