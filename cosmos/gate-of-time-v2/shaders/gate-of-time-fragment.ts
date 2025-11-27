/**
 * Gate of Time v2 Fragment Shader
 * 
 * Phase 2 — Section 57: GATE OF TIME ENGINE v2
 * Gate of Time Engine v2 (E61)
 * 
 * 12-layer temporal wormhole: Temporal Base Disc, Chrono Rings, Temporal Spiral, Time Glyph Halo, Time Streams, Ripple Waves, Temporal Threads, Chrono Dust Field, Temporal Tear Layer, Inner Wormhole Core, Wormhole Tunnel, Bloom Mask Layer
 */

export const gateOfTimeFragmentShader = `
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
varying float vChronoRingIndex;
varying float vTemporalSpiralIndex;
varying float vGlyphIndex;
varying float vTimeStreamIndex;
varying float vRippleWaveIndex;
varying float vTemporalThreadIndex;
varying float vDustIndex;
varying float vTearIndex;
varying float vWormholeCoreIndex;
varying float vWormholeTunnelIndex;
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
// LAYER A: TEMPORAL BASE DISC
// ============================================
vec3 temporalBaseDisc(vec2 uv) {
  if (vBaseDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64 radial × 32 concentric grid
  // Gradient: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Scroll → time-ripple acceleration (already in vertex)
  
  // Breath → radius swelling (already in vertex)
  
  // High → shimmer: fbm(uv*5 + time)*uHigh*0.25
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
// LAYER B: CHRONO RINGS
// ============================================
vec3 chronoRings(vec2 uv) {
  if (vChronoRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 5 nested rings
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on ring index
  
  // RotationSync → linked rotation (already in vertex)
  
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
// LAYER C: TEMPORAL SPIRAL
// ============================================
vec3 temporalSpiral(vec2 uv) {
  if (vTemporalSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Double logarithmic spiral
  // Color: Cyan → Blue → Indigo
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vGradientProgress; // Progress along spiral
  
  // Scroll → inward pull (already in vertex)
  
  // Bass → spiral jitter (already in vertex)
  
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
  
  return spiralColor * widthFade * 0.5;
}

// ============================================
// LAYER D: TIME GLYPH HALO
// ============================================
vec3 timeGlyphHalo(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 60–100 glyph nodes
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph circle SDF
  float glyphRadius = 0.22;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // Bass → wobble (already in vertex)
  
  // High → sparkle noise: fbm(uv*22 + time)*uHigh*0.3
  float sparkle = fbm(uv * 22.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash: uBlessingWaveProgress * 0.9
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
// LAYER E: TIME STREAMS
// ============================================
vec3 timeStreams(vec2 uv) {
  if (vTimeStreamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8–16 streams
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along stream
  
  // Scroll → flow speed (already in vertex)
  
  // Breath → stream width modulation
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Cyan → Violet gradient
  vec3 streamColor;
  if (gradientT < 0.5) {
    streamColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    streamColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Stream width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return streamColor * widthFade * breathWidth * 0.5;
}

// ============================================
// LAYER F: RIPPLE WAVES
// ============================================
vec3 rippleWaves(vec2 uv) {
  if (vRippleWaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Concentric time ripples (8–12 waves)
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on wave radius
  
  // Animate outward over time (already in vertex)
  
  // High → shimmer amplification: fbm(uv*6 + time)*uHigh*0.25
  float shimmerAmplification = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  shimmerAmplification = smoothstep(0.7, 1.0, shimmerAmplification);
  
  // White → Cyan → Violet gradient
  vec3 waveColor;
  if (gradientT < 0.5) {
    waveColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    waveColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ripple thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return waveColor * thicknessFade * (1.0 + shimmerAmplification) * 0.4;
}

// ============================================
// LAYER G: TEMPORAL THREADS
// ============================================
vec3 temporalThreads(vec2 uv) {
  if (vTemporalThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 threads weaving around spiral
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Progress along thread
  
  // Scroll → weaving speed (already in vertex)
  
  // Bass → flicker: sin(time*4 + threadIndex*2)*uBass*0.2
  float bassFlicker = sin(uTime * 4.0 + vTemporalThreadIndex * 2.0) * uBass * 0.2;
  
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
  
  return threadColor * widthFade * (1.0 + bassFlicker) * 0.5;
}

// ============================================
// LAYER H: CHRONO DUST FIELD
// ============================================
vec3 chronoDustField(vec2 uv) {
  if (vDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 300–450 particles
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*30 + time)*uHigh*0.3
  float sparkle = fbm(uv * 30.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → flash: uBlessingWaveProgress * 0.8
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
// LAYER I: TEMPORAL TEAR LAYER
// ============================================
vec3 temporalTearLayer(vec2 uv) {
  if (vTearIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm distortion grid
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on distortion
  
  // fbm distortion (already in vertex)
  
  // Scroll → widening distortion (already in vertex)
  
  // BlessingWave → bright flash: uBlessingWaveProgress * 1.0
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
// LAYER J: INNER WORMHOLE CORE
// ============================================
vec3 innerWormholeCore(vec2 uv) {
  if (vWormholeCoreIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Pulsing bright core
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress; // Based on radius
  
  // Breath → expansion pulse (already in vertex)
  
  // High → inner flare shimmer: fbm(uv*10 + time)*uHigh*0.3
  float innerFlareShimmer = fbm(uv * 10.0 + uTime * 0.3) * uHigh * 0.3;
  innerFlareShimmer = smoothstep(0.7, 1.0, innerFlareShimmer);
  
  // White → Gold → Violet gradient
  vec3 coreColor;
  if (gradientT < 0.5) {
    coreColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    coreColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Core radial fade
  float radialFade = 1.0 - smoothstep(0.0, 1.2, vRadius);
  
  return coreColor * radialFade * (1.0 + innerFlareShimmer) * 1.2;
}

// ============================================
// LAYER K: WORMHOLE TUNNEL
// ============================================
vec3 wormholeTunnel(vec2 uv) {
  if (vWormholeTunnelIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Depth-simulated tunnel using radial UV warp
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Based on depth
  
  // Scroll → tunnel pull (already in vertex)
  
  // White → Violet → Cyan gradient
  vec3 tunnelColor;
  if (gradientT < 0.5) {
    tunnelColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    tunnelColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  // Tunnel radial fade
  float radialFade = 1.0 - smoothstep(0.0, 5.5, vRadius);
  
  return tunnelColor * radialFade * 0.4;
}

// ============================================
// LAYER L: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Strong bloom around core
  // Intensifies with blessingWaveProgress
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 5.5, distFromCenter);
  
  // Intensifies with blessingWaveProgress
  float blessingIntensity = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingIntensity = uBlessingWaveProgress * 0.8;
  }
  
  bloomIntensity = min(bloomIntensity + blessingIntensity, 1.0);
  
  // Strong white-violet bloom color
  vec3 bloomColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.6, 1.0), 0.3);
  
  return bloomColor * bloomIntensity * 0.4;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Temporal Base Disc (base layer)
  vec3 layerA = temporalBaseDisc(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Chrono Rings (additive blending)
  vec3 layerB = chronoRings(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Temporal Spiral (additive blending)
  vec3 layerC = temporalSpiral(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Time Glyph Halo (additive blending)
  vec3 layerD = timeGlyphHalo(uv);
  finalColor += layerD * 0.7;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Time Streams (additive blending)
  vec3 layerE = timeStreams(uv);
  finalColor += layerE * 0.5;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Ripple Waves (additive blending)
  vec3 layerF = rippleWaves(uv);
  finalColor += layerF * 0.4;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Temporal Threads (additive blending)
  vec3 layerG = temporalThreads(uv);
  finalColor += layerG * 0.5;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: Chrono Dust Field (additive blending)
  vec3 layerH = chronoDustField(uv);
  finalColor += layerH * 0.7;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Temporal Tear Layer (additive blending)
  vec3 layerI = temporalTearLayer(uv);
  finalColor += layerI * 0.3;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Inner Wormhole Core (additive blending)
  vec3 layerJ = innerWormholeCore(uv);
  finalColor += layerJ * 1.2;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Wormhole Tunnel (additive blending)
  vec3 layerK = wormholeTunnel(uv);
  finalColor += layerK * 0.4;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Bloom Mask Layer (additive blending)
  vec3 layerL = bloomMaskLayer(uv);
  finalColor += layerL * 0.4;
  bloomMask = max(bloomMask, length(layerL));
  
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

