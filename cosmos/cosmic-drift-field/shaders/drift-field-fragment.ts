/**
 * Cosmic Drift Field Fragment Shader
 * 
 * Phase 2 — Section 45: COSMIC DRIFT FIELD ENGINE
 * Cosmic Drift Field Engine (E49)
 * 
 * 3-layer cosmic drift field: Deep Drift Nebula Layer, Mid-Depth Drift Currents, Drift Dust Particles
 */

export const driftFieldFragmentShader = `
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
varying float vNebulaIndex;
varying float vFlowIndex;
varying float vDustIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vNebulaHeight;
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
// LAYER A: DEEP DRIFT NEBULA LAYER
// ============================================
vec3 deepDriftNebulaLayer(vec2 uv) {
  if (vNebulaIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Huge plane: 24 × 14 units
  // Color gradient: Deep Blue → Indigo → Black
  vec3 deepBlue = vec3(0.05, 0.1, 0.25);
  vec3 indigo = vec3(0.15, 0.1, 0.3);
  vec3 black = vec3(0.02, 0.02, 0.05);
  
  float gradientT = vGradientProgress; // Based on nebula fbm value
  
  // Breath → slow brightness pulse: sin(breathPhase * 2π) * breathStrength * 0.1
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.1;
  
  // Scroll → parallax drift (already in vertex)
  
  // Bass → micro warp jitter (already in vertex)
  
  // High → nebula shimmer: fbm(uv*3 + time)*uHigh*0.2
  float nebulaShimmer = fbm(uv * 3.0 + uTime * 0.2) * uHigh * 0.2;
  nebulaShimmer = smoothstep(0.6, 1.0, nebulaShimmer);
  
  // BlessingWave → soft violet glow swell: uBlessingWaveProgress * 0.3
  float blessingSwell = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingSwell = uBlessingWaveProgress * 0.3;
  }
  
  // Deep Blue → Indigo → Black gradient
  vec3 gradientColor;
  if (gradientT < 0.5) {
    gradientColor = mix(deepBlue, indigo, gradientT * 2.0);
  } else {
    gradientColor = mix(indigo, black, (gradientT - 0.5) * 2.0);
  }
  
  // Add violet glow on blessing swell
  if (blessingSwell > 0.0) {
    vec3 violetGlow = vec3(0.6, 0.3, 0.8);
    gradientColor = mix(gradientColor, violetGlow, blessingSwell * 0.3);
  }
  
  return gradientColor * breathPulse * (1.0 + nebulaShimmer) * 0.6;
}

// ============================================
// LAYER B: MID-DEPTH DRIFT CURRENTS
// ============================================
vec3 midDepthDriftCurrents(vec2 uv) {
  if (vFlowIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Transparent flow lines drifting diagonally
  // Color: Soft Cyan → White
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  
  // RotationSync → direction tilt (already in vertex)
  
  // Breath → amplitude broadening (already in vertex)
  
  // Scroll → flow acceleration (already in vertex)
  
  // Bass → ripple vibration (already in vertex)
  
  // High → edge streak noise: fbm(uv*5 + time)*uHigh*0.25
  float streakNoise = fbm(uv * 5.0 + uTime * 0.4) * uHigh * 0.25;
  streakNoise = smoothstep(0.7, 1.0, streakNoise);
  
  // BlessingWave → brightness flash: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Flow intensity based on flow height
  float flowIntensity = abs(vNebulaHeight) * 5.0;
  vec3 flowColor = mix(cyanColor, whiteColor, flowIntensity * 0.4);
  
  // Flow line pattern
  float flowPattern = sin(uv.x * 3.0 + uv.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
  flowColor *= flowPattern;
  
  return flowColor * (1.0 + streakNoise + blessingFlash) * 0.4;
}

// ============================================
// LAYER C: DRIFT DUST PARTICLES
// ============================================
vec3 driftDustParticles(vec2 uv) {
  if (vDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 150-260 particles (mobile: 100)
  // Radius: 0.01-0.015
  float dustRadius = 0.0125;
  float dustDist = sdCircle(p, dustRadius);
  float dustMask = 1.0 - smoothstep(0.0, dustRadius * 2.0, dustDist);
  
  // Breath → vertical amplitude (already in vertex)
  
  // Bass → flicker sparkle: sin(time*4 + index*2)*uBass*0.2
  float flickerSparkle = sin(uTime * 4.0 + vDustIndex * 2.0) * uBass * 0.2;
  flickerSparkle = smoothstep(0.5, 1.0, flickerSparkle);
  
  // High → shimmer noise: fbm(uv*10 + time)*uHigh*0.3
  float shimmer = fbm(uv * 10.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → flash pulse: uBlessingWaveProgress * 0.5
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.5;
  }
  
  // Color: White–Blue glints
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  float gradientT = dist / dustRadius;
  vec3 dustColor = mix(whiteColor, blueColor, gradientT * 0.4);
  
  return dustColor * dustMask * (1.0 + flickerSparkle + shimmer + blessingFlash) * 0.7;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Deep Drift Nebula Layer (base layer)
  vec3 layerA = deepDriftNebulaLayer(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Mid-Depth Drift Currents (additive blending)
  vec3 layerB = midDepthDriftCurrents(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Drift Dust Particles (additive blending)
  vec3 layerC = driftDustParticles(uv);
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

