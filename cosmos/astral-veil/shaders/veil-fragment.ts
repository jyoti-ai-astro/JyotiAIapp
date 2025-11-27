/**
 * Astral Veil Fragment Shader
 * 
 * Phase 2 — Section 29: ASTRAL VEIL ENGINE
 * Astral Veil Engine (E33)
 * 
 * 3-layer astral veil: Front Ether Veil, Mid Rising Mist, Rear Silk Veil
 */

export const veilFragmentShader = `
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
varying float vFrontVeilIndex;
varying float vRearVeilIndex;
varying float vMistParticleIndex;
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

// ============================================
// LAYER A: FRONT ETHER VEIL
// ============================================
vec3 frontEtherVeil(vec2 uv) {
  if (vFrontVeilIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Semi-transparent floating sheet-like veil
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Veil mask (fade from center to edges)
  float veilMask = 1.0 - smoothstep(0.0, 0.7, dist);
  
  // High → shimmer streaks: fbm(uv*8 + time*0.5)*uHigh*0.3
  float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // Color: Gold-White-Violet soft gradient with transparency
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.7, 1.0);
  
  float gradientT = dist / 0.7;
  vec3 veilColor;
  if (gradientT < 0.5) {
    veilColor = mix(goldColor, whiteColor, gradientT * 2.0);
  } else {
    veilColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Transparency fade
  float alpha = veilMask * 0.6; // Semi-transparent
  
  return veilColor * alpha * (1.0 + shimmer);
}

// ============================================
// LAYER B: MID RISING MIST
// ============================================
vec3 midRisingMist(vec2 uv) {
  if (vMistParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Ethereal mist particles
  float particleRadius = 0.04;
  float particleDist = dist;
  float particleGlow = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // BlessingWave → brightness burst: glow*(uBlessingWaveProgress*0.4)
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.4;
  }
  
  // Mid → turbulence float (already in vertex)
  
  // Color: white haze with violet hue
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.9, 0.8, 1.0);
  vec3 mistColor = mix(whiteColor, violetColor, 0.3);
  
  return mistColor * particleGlow * (1.0 + blessingGlow) * 0.5;
}

// ============================================
// LAYER C: REAR SILK VEIL
// ============================================
vec3 rearSilkVeil(vec2 uv) {
  if (vRearVeilIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Thin veil sheet behind the Guru, softly waving
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Veil mask (fade from center to edges)
  float veilMask = 1.0 - smoothstep(0.0, 0.6, dist);
  
  // High → shimmer flicker along edges
  float edgeShimmer = 0.0;
  if (uv.x < 0.1 || uv.x > 0.9 || uv.y < 0.1 || uv.y > 0.9) {
    float shimmer = fbm(uv * 12.0 + uTime * 0.5);
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer * uHigh * 0.2;
  }
  
  // Color: soft violet-white glow
  vec3 violetColor = vec3(0.8, 0.7, 1.0);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / 0.6;
  vec3 veilColor = mix(violetColor, whiteColor, gradientT * 0.5);
  
  // Soft glow
  float glow = veilMask * 0.5;
  
  return veilColor * glow * (1.0 + edgeShimmer);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Front Ether Veil
  vec3 layerA = frontEtherVeil(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Mid Rising Mist
  vec3 layerB = midRisingMist(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Rear Silk Veil
  vec3 layerC = rearSilkVeil(uv);
  finalColor += layerC * 0.6;
  bloomMask = max(bloomMask, length(layerC));
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.8);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

