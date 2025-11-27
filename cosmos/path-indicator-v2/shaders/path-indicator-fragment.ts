/**
 * Path Indicator v2 Fragment Shader
 * 
 * Phase 2 — Section 53: PATH INDICATOR ENGINE v2
 * Path Indicator Engine v2 (E57)
 * 
 * 4-layer quantum path navigation: Multi-Track Path Lines, Path Markers/Nodes, Energy Pulses, Path Fog/Atmospheric Mist
 */

export const pathIndicatorFragmentShader = `
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
varying float vPathLineIndex;
varying float vNodeIndex;
varying float vPulseIndex;
varying float vFogIndex;
varying float vPathProgress;
varying float vPathSegment;
varying float vDistance;
varying float vRadialDistance;
varying float vPathDistance;
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
// LAYER A: MULTI-TRACK PATH LINES
// ============================================
vec3 multiTrackPathLines(vec2 uv) {
  if (vPathLineIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3-5 spline-based paths, radius 4 → 10 units
  // Gradient: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vPathDistance; // Progress along path
  
  // Scroll → progress movement along spline (already in vertex)
  
  // Breath → glow intensity modulation
  float breathGlow = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
  
  // High → shimmer: fbm(uv*6 + time)*uHigh*0.25
  float shimmer = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → white/violet flash pulse: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // White → Cyan → Violet gradient
  vec3 pathColor;
  if (gradientT < 0.5) {
    pathColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    pathColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Path line thickness fade
  float thicknessFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.3, thicknessFade);
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    pathColor = mix(pathColor, flashColor, blessingFlash);
  }
  
  return pathColor * thicknessFade * breathGlow * (1.0 + shimmer) * 0.6;
}

// ============================================
// LAYER B: PATH MARKERS / NODES
// ============================================
vec3 pathMarkersNodes(vec2 uv) {
  if (vNodeIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 20-40 nodes placed along spline curves
  // Color: Gold → White
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Node circle SDF
  float nodeRadius = 0.15;
  float nodeDist = sdCircle(p, nodeRadius);
  float nodeMask = 1.0 - smoothstep(0.0, nodeRadius * 2.0, nodeDist);
  
  // Equation:
  // nodePulse = sin(time*2.0 + index*0.4) * 0.12
  // (already in vertex)
  
  // Bass → jitter vibration (already in vertex)
  
  // High → sparkle noise: fbm(uv*20 + time)*uHigh*0.3
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // Gold → White gradient
  float gradientT = dist / nodeRadius;
  vec3 nodeColor = mix(goldColor, whiteColor, gradientT * 0.8);
  
  return nodeColor * nodeMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

// ============================================
// LAYER C: ENERGY PULSES
// ============================================
vec3 energyPulses(vec2 uv) {
  if (vPulseIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 3-7 energy pulses traveling along spline
  // Color: White → Violet → Blue
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Pulse circle SDF
  float pulseRadius = 0.3;
  float pulseDist = sdCircle(p, pulseRadius);
  float pulseMask = 1.0 - smoothstep(0.0, pulseRadius * 2.0, pulseDist);
  
  // Travel speed tied to scrollProgress (already in vertex)
  
  // Breath → pulse radius scaling (already in vertex)
  
  // High → pulse shimmer: fbm(uv*8 + time)*uHigh*0.25
  float shimmer = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // Bass → flicker: sin(time*4 + pulseIndex)*uBass*0.2
  float flicker = sin(uTime * 4.0 + vPulseIndex * 2.0) * uBass * 0.2;
  flicker = smoothstep(0.5, 1.0, flicker);
  
  // White → Violet → Blue gradient
  float gradientT = dist / pulseRadius;
  vec3 pulseColor;
  if (gradientT < 0.5) {
    pulseColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    pulseColor = mix(violetColor, blueColor, (gradientT - 0.5) * 2.0);
  }
  
  return pulseColor * pulseMask * (1.0 + shimmer + flicker) * 0.6;
}

// ============================================
// LAYER D: PATH FOG / ATMOSPHERIC MIST
// ============================================
vec3 pathFogAtmosphericMist(vec2 uv) {
  if (vFogIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Soft fog along path lines
  // fbm-based displacement
  
  // Color: Cyan → White → Violet
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on fbm displacement
  
  // fbm-based displacement (already in vertex)
  
  // Scroll → drift (already in vertex)
  
  // Breath → opacity pulse
  float breathOpacity = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // BlessingWave → flash: uBlessingWaveProgress * 0.7
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.7;
  }
  
  // Cyan → White → Violet gradient
  vec3 fogColor;
  if (gradientT < 0.5) {
    fogColor = mix(cyanColor, whiteColor, gradientT * 2.0);
  } else {
    fogColor = mix(whiteColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Soft fog mask
  float fogMask = fbm(uv * 2.0 + uTime * 0.1) * 0.5 + 0.5;
  fogMask = smoothstep(0.3, 0.7, fogMask);
  
  return fogColor * fogMask * breathOpacity * (1.0 + blessingFlash) * 0.3;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Multi-Track Path Lines (base layer)
  vec3 layerA = multiTrackPathLines(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Path Markers/Nodes (additive blending)
  vec3 layerB = pathMarkersNodes(uv);
  finalColor += layerB * 0.7;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Energy Pulses (additive blending)
  vec3 layerC = energyPulses(uv);
  finalColor += layerC * 0.6;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Path Fog/Atmospheric Mist (additive blending)
  vec3 layerD = pathFogAtmosphericMist(uv);
  finalColor += layerD * 0.4;
  bloomMask = max(bloomMask, length(layerD));
  
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

