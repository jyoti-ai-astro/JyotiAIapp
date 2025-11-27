/**
 * Soul Star Fragment Shader
 * 
 * Phase 2 — Section 31: SOUL STAR ENGINE
 * Soul Star Engine (E35)
 * 
 * 3-layer soul star: Core Soul Star, Secondary Aura Spikes, Star Dust Halo
 */

export const starFragmentShader = `
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
varying float vCoreStarIndex;
varying float vSpikeIndex;
varying float vParticleIndex;
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

// ============================================
// LAYER A: CORE SOUL STAR
// ============================================
vec3 coreSoulStar(vec2 uv) {
  if (vCoreStarIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  // Primary luminous star behind Guru, radius ~0.45
  float starRadius = 0.45;
  
  // 8-point mandala star (desktop), 6-point (mobile)
  float numPoints = 8.0; // Will be adjusted in engine
  float starAngle = angle * numPoints / 6.28318; // Normalize to 0-numPoints
  float starPoint = mod(starAngle, 1.0);
  
  // Star shape
  float starDist = dist / starRadius;
  float starMask = 0.0;
  if (starDist < 1.0) {
    // Star points
    float pointMask = 1.0 - smoothstep(0.0, 0.15, abs(starPoint - 0.5) * 2.0);
    starMask = pointMask * (1.0 - smoothstep(0.7, 1.0, starDist));
  }
  
  // Bass → radial vibration (already in vertex)
  
  // Mid → distortion flicker (already in vertex)
  
  // High → edge shimmer: fbm(uv*8 + time*0.5)*uHigh*0.25
  float edgeShimmer = 0.0;
  if (starDist > 0.8) {
    float shimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.25;
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer;
  }
  
  // Color: White → Gold core gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  float gradientT = dist / starRadius;
  vec3 starColor = mix(whiteColor, goldColor, gradientT * 0.5);
  
  return starColor * starMask * (1.0 + edgeShimmer);
}

// ============================================
// LAYER B: SECONDARY AURA SPIKES
// ============================================
vec3 secondaryAuraSpikes(vec2 uv) {
  if (vSpikeIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // 12-18 soft spikes radiating outward (mobile: 8)
  float spikeWidth = 0.03;
  float spikeDist = abs(p.x);
  float spikeMask = 1.0 - smoothstep(0.0, spikeWidth, spikeDist);
  
  // Scroll → spike length extension (already in vertex)
  
  // BlessingWave → spike glow surge: uBlessingWaveProgress * 0.5
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.5;
  }
  
  // Bass → jitter wobble (already in vertex)
  
  // Color: Gold → Violet spectral spikes
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = length(p) / 0.5;
  vec3 spikeColor = mix(goldColor, violetColor, gradientT * 0.6);
  
  return spikeColor * spikeMask * (1.0 + blessingGlow) * 0.6;
}

// ============================================
// LAYER C: STAR DUST HALO
// ============================================
vec3 starDustHalo(vec2 uv) {
  if (vParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 50-90 floating star particles orbiting around the Soul Star
  float particleRadius = 0.02;
  float particleDist = sdCircle(p, particleRadius);
  float particleGlow = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Breath → brightness pulse
  float breathBrightness = 1.0 + uBreathStrength * 0.2;
  
  // High → shimmer flicker: fbm(uv*10 + time)*uHigh*0.3
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → halo flash pulse
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.4;
  }
  
  // Color: white-gold sparkles
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.9, 0.7);
  vec3 particleColor = mix(whiteColor, goldColor, 0.5);
  
  return particleColor * particleGlow * breathBrightness * (1.0 + shimmer + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Core Soul Star
  vec3 layerA = coreSoulStar(uv);
  finalColor += layerA * 0.8;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Secondary Aura Spikes
  vec3 layerB = secondaryAuraSpikes(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Star Dust Halo
  vec3 layerC = starDustHalo(uv);
  finalColor += layerC * 0.5;
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

