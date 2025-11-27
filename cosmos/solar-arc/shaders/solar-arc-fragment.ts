/**
 * Solar Arc Fragment Shader
 * 
 * Phase 2 — Section 47: SOLAR ARC FIELD ENGINE
 * Solar Arc Engine (E51)
 * 
 * 3-layer solar arc: Primary Solar Arcs, Reverse Solar Back-Arcs, Solar Sparks Trail
 */

export const solarArcFragmentShader = `
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
varying float vArcIndex;
varying float vReverseArcIndex;
varying float vSparkIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vArcHeight;
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
// LAYER A: PRIMARY SOLAR ARCS
// ============================================
vec3 primarySolarArcs(vec2 uv) {
  if (vArcIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2-3 massive curved solar flares
  // Color gradient: Gold → White → Violet
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on arc height
  
  // Breath → arc height expansion (already in vertex)
  
  // Scroll → arc sweep rotation (already in vertex)
  
  // Bass → jitter ripple (already in vertex)
  
  // High → solar shimmer pulses: fbm(vec2(angle*2, radius*0.5) + time)*uHigh*0.3
  float shimmer = fbm(vec2(vAngle * 2.0, vRadius * 0.5) + uTime * 0.3) * uHigh * 0.3;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → solar flare flash (gold → white): uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // Gold → White → Violet gradient
  vec3 arcColor;
  if (gradientT < 0.5) {
    arcColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    arcColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add blessing flash (gold → white)
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(goldColor, whiteColor, 0.7);
    arcColor = mix(arcColor, flashColor, blessingFlash);
  }
  
  // Arc thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0; // Fade at edges
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return arcColor * thicknessFade * (1.0 + shimmer) * 0.7;
}

// ============================================
// LAYER B: REVERSE SOLAR BACK-ARCS
// ============================================
vec3 reverseSolarBackArcs(vec2 uv) {
  if (vReverseArcIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Backside inverted arcs with cooling colors
  // Colors: White → Blue → Indigo
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Based on reverse arc height
  
  // RotationSync → rotational offset (already in vertex)
  
  // Breath → amplitude boost (already in vertex)
  
  // Mid → turbulence injection (already in vertex)
  
  // High → shimmer ripples: fbm(vec2(radius*0.7, angle*3) + time)*uHigh*0.25
  float shimmer = fbm(vec2(vRadius * 0.7, vAngle * 3.0) + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → soft violet haze: uBlessingWaveProgress * 0.4
  float blessingHaze = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingHaze = uBlessingWaveProgress * 0.4;
  }
  
  // White → Blue → Indigo gradient
  vec3 backArcColor;
  if (gradientT < 0.5) {
    backArcColor = mix(whiteColor, blueColor, gradientT * 2.0);
  } else {
    backArcColor = mix(blueColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Add violet haze
  if (blessingHaze > 0.0) {
    vec3 violetHaze = vec3(0.6, 0.5, 0.9);
    backArcColor = mix(backArcColor, violetHaze, blessingHaze * 0.3);
  }
  
  // Arc thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  return backArcColor * thicknessFade * (1.0 + shimmer) * 0.4;
}

// ============================================
// LAYER C: SOLAR SPARKS TRAIL
// ============================================
vec3 solarSparksTrail(vec2 uv) {
  if (vSparkIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 140-220 sparks (mobile: 100)
  // Radius: 0.01-0.015
  float sparkRadius = 0.0125;
  float sparkDist = sdCircle(p, sparkRadius);
  float sparkMask = 1.0 - smoothstep(0.0, sparkRadius * 2.0, sparkDist);
  
  // Breath → radial expansion (already in vertex)
  
  // Bass → flicker jitter (already in vertex)
  
  // High → sparkle noise: fbm(uv*15 + time)*uHigh*0.3
  float sparkle = fbm(uv * 15.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → spark flash pulse: uBlessingWaveProgress * 0.6
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.6;
  }
  
  // Color: Gold–White–Violet sparks
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / sparkRadius;
  vec3 sparkColor;
  if (gradientT < 0.33) {
    sparkColor = mix(goldColor, whiteColor, gradientT * 3.0);
  } else {
    sparkColor = mix(whiteColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return sparkColor * sparkMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Solar Arcs (base layer)
  vec3 layerA = primarySolarArcs(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Reverse Solar Back-Arcs (additive blending)
  vec3 layerB = reverseSolarBackArcs(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Solar Sparks Trail (additive blending)
  vec3 layerC = solarSparksTrail(uv);
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

