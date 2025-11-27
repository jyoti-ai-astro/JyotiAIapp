/**
 * Soul Bridge v3 Fragment Shader
 * 
 * Phase 2 — Section 58: SOUL BRIDGE ENGINE v3
 * Soul Bridge Engine v3 (E62)
 * 
 * 14-layer astral connection bridge: Astral Base Plane, Twin Spiral Bridges, Ascension Ramps, SoulLight Nodes, Central Chakra Beam, Spiral Runners, Astral Threads, SoulWave Rings, Dimensional Overlay, Bridge Glyphs, Energy Particles, Light Beams, Soul Pulse Core, Bloom Mask Layer
 */

export const soulBridgeFragmentShader = `
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
varying float vBasePlaneIndex;
varying float vTwinSpiralIndex;
varying float vAscensionRampIndex;
varying float vSoulLightIndex;
varying float vChakraBeamIndex;
varying float vSpiralRunnerIndex;
varying float vAstralThreadIndex;
varying float vSoulWaveIndex;
varying float vDimensionalOverlayIndex;
varying float vBridgeGlyphIndex;
varying float vEnergyParticleIndex;
varying float vLightBeamIndex;
varying float vSoulPulseIndex;
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
// LAYER A: ASTRAL BASE PLANE
// ============================================
vec3 astralBasePlane(vec2 uv) {
  if (vBasePlaneIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 64×64 grid plane
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → rising motion (already in vertex)
  
  // Breath → plane pulse (already in vertex)
  
  // High → shimmer dust: fbm(uv*5 + time)*uHigh*0.25
  float shimmerDust = fbm(uv * 5.0 + uTime * 0.3) * uHigh * 0.25;
  shimmerDust = smoothstep(0.7, 1.0, shimmerDust);
  
  // White → Cyan → Violet gradient
  vec3 planeColor;
  if (gradientT < 0.5) {
    planeColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    planeColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Grid pattern
  float gridPattern = sin(uv.x * 64.0) * 0.5 + 0.5;
  gridPattern *= sin(uv.y * 64.0) * 0.5 + 0.5;
  
  return planeColor * gridPattern * (1.0 + shimmerDust) * 0.6;
}

// ============================================
// LAYER B: TWIN SPIRAL BRIDGES
// ============================================
vec3 twinSpiralBridges(vec2 uv) {
  if (vTwinSpiralIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2 counter-rotating spirals
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Bass → wobble (already in vertex)
  
  // High → sparkle: fbm(uv*8 + time)*uHigh*0.3
  float sparkle = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.3;
  sparkle = smoothstep(0.7, 1.0, sparkle);
  
  // White → Gold → Violet gradient
  vec3 spiralColor;
  if (gradientT < 0.5) {
    spiralColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    spiralColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Spiral width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return spiralColor * widthFade * (1.0 + sparkle) * 0.5;
}

// ============================================
// LAYER C: ASCENSION RAMPS
// ============================================
vec3 ascensionRamps(vec2 uv) {
  if (vAscensionRampIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 2 ramps riding along spirals
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → climb progression (already in vertex)
  
  // Breath → width modulation
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Cyan → Violet gradient
  vec3 rampColor;
  if (gradientT < 0.5) {
    rampColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    rampColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ramp width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return rampColor * widthFade * breathWidth * 0.5;
}

// ============================================
// LAYER D: SOULLIGHT NODES
// ============================================
vec3 soulLightNodes(vec2 uv) {
  if (vSoulLightIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 60–90 nodes along spirals
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Node circle SDF
  float nodeRadius = 0.2;
  float nodeDist = sdCircle(p, nodeRadius);
  float nodeMask = 1.0 - smoothstep(0.0, nodeRadius * 2.0, nodeDist);
  
  // Bass → jitter (already in vertex)
  
  // BlessingWave → soul flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Gold → Violet gradient
  float gradientT = dist / nodeRadius;
  vec3 nodeColor;
  if (gradientT < 0.5) {
    nodeColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    nodeColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return nodeColor * nodeMask * (1.0 + blessingFlash) * 0.8;
}

// ============================================
// LAYER E: CENTRAL CHAKRA BEAM
// ============================================
vec3 centralChakraBeam(vec2 uv) {
  if (vChakraBeamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Vertical energy column
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → width swelling (already in vertex)
  
  // High → spectral shimmer: fbm(uv*7 + time)*uHigh*0.25
  float spectralShimmer = fbm(uv * 7.0 + uTime * 0.3) * uHigh * 0.25;
  spectralShimmer = smoothstep(0.7, 1.0, spectralShimmer);
  
  // White → Cyan → Violet gradient
  vec3 beamColor;
  if (gradientT < 0.5) {
    beamColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    beamColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Beam radial fade
  float radialFade = 1.0 - smoothstep(0.0, 0.8, vRadius);
  
  return beamColor * radialFade * (1.0 + spectralShimmer) * 0.7;
}

// ============================================
// LAYER F: SPIRAL RUNNERS
// ============================================
vec3 spiralRunners(vec2 uv) {
  if (vSpiralRunnerIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 8–12 runners
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → running speed (already in vertex)
  
  // Breath → speed pulse
  float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Cyan → Violet gradient
  vec3 runnerColor;
  if (gradientT < 0.5) {
    runnerColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    runnerColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Runner width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return runnerColor * widthFade * breathPulse * 0.5;
}

// ============================================
// LAYER G: ASTRAL THREADS
// ============================================
vec3 astralThreads(vec2 uv) {
  if (vAstralThreadIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12–24 threads cross-linking spirals
  // Color: White → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // Bass → flicker: sin(time*4 + threadIndex*2)*uBass*0.2
  float bassFlicker = sin(uTime * 4.0 + vAstralThreadIndex * 2.0) * uBass * 0.2;
  
  // High → micro-glitter: fbm(uv*12 + time)*uHigh*0.3
  float microGlitter = fbm(uv * 12.0 + uTime * 0.3) * uHigh * 0.3;
  microGlitter = smoothstep(0.7, 1.0, microGlitter);
  
  // White → Cyan gradient
  vec3 threadColor = mix(whiteColor, cyanColor, gradientT * 0.8);
  
  // Thread width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return threadColor * widthFade * (1.0 + bassFlicker + microGlitter) * 0.4;
}

// ============================================
// LAYER H: SOULWAVE RINGS
// ============================================
vec3 soulWaveRings(vec2 uv) {
  if (vSoulWaveIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–10 expanding rings
  // Color: White → Cyan → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → expansion rate (already in vertex)
  
  // High → sparkle amplification: fbm(uv*6 + time)*uHigh*0.25
  float sparkleAmplification = fbm(uv * 6.0 + uTime * 0.3) * uHigh * 0.25;
  sparkleAmplification = smoothstep(0.7, 1.0, sparkleAmplification);
  
  // White → Cyan → Violet gradient
  vec3 waveColor;
  if (gradientT < 0.5) {
    waveColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    waveColor = mix(cyanColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Ring thickness fade
  float thicknessFade = 1.0 - abs(uv.y - 0.5) * 2.0;
  thicknessFade = smoothstep(0.0, 0.4, thicknessFade);
  
  return waveColor * thicknessFade * (1.0 + sparkleAmplification) * 0.4;
}

// ============================================
// LAYER I: DIMENSIONAL OVERLAY
// ============================================
vec3 dimensionalOverlay(vec2 uv) {
  if (vDimensionalOverlayIndex < 0.0) {
    return vec3(0.0);
  }
  
  // fbm distortion plane
  // Color: White → Violet → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress;
  
  // fbm distortion (already in vertex)
  
  // Scroll → distortion widening (already in vertex)
  
  // BlessingWave → bright flash: uBlessingWaveProgress * 1.0
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 1.0;
  }
  
  // White → Violet → Cyan gradient
  vec3 overlayColor;
  if (gradientT < 0.5) {
    overlayColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    overlayColor = mix(violetColor, cyanColor, (gradientT - 0.5) * 2.0);
  }
  
  // Overlay pattern
  float overlayPattern = fbm(uv * 3.0 + uTime * 0.2) * 0.5 + 0.5;
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, violetColor, 0.5);
    overlayColor = mix(overlayColor, flashColor, blessingFlash);
  }
  
  return overlayColor * overlayPattern * (1.0 + blessingFlash) * 0.3;
}

// ============================================
// LAYER J: BRIDGE GLYPHS
// ============================================
vec3 bridgeGlyphs(vec2 uv) {
  if (vBridgeGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 48–64 glyphs forming a bridge arc
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glyph circle SDF: 0.18 radius
  float glyphRadius = 0.18;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphMask = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // Bass → glyph shake (already in vertex)
  
  // High → sparkle: fbm(uv*20 + time)*uHigh*0.3
  float sparkle = fbm(uv * 20.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // White → Gold → Violet gradient
  float gradientT = dist / glyphRadius;
  vec3 glyphColor;
  if (gradientT < 0.5) {
    glyphColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    glyphColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  return glyphColor * glyphMask * (1.0 + sparkle) * 0.8;
}

// ============================================
// LAYER K: ENERGY PARTICLES
// ============================================
vec3 energyParticles(vec2 uv) {
  if (vEnergyParticleIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 200–350 drifting points
  // Radius: 0.01-0.015
  float particleRadius = 0.0125;
  float particleDist = sdCircle(p, particleRadius);
  float particleMask = 1.0 - smoothstep(0.0, particleRadius * 2.0, particleDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*32 + time)*uHigh*0.3
  float sparkle = fbm(uv * 32.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
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
  
  return particleColor * particleMask * (1.0 + sparkle) * 0.8;
}

// ============================================
// LAYER L: LIGHT BEAMS
// ============================================
vec3 lightBeams(vec2 uv) {
  if (vLightBeamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6–12 rising beams
  // Color: White → Gold → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Scroll → height growth (already in vertex)
  
  // Breath → width modulation
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Gold → Violet gradient
  vec3 beamColor;
  if (gradientT < 0.5) {
    beamColor = mix(whiteColor, goldColor, gradientT * 2.0);
  } else {
    beamColor = mix(goldColor, violetColor, (gradientT - 0.5) * 2.0);
  }
  
  // Beam width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  return beamColor * widthFade * breathWidth * 0.4;
}

// ============================================
// LAYER M: SOUL PULSE CORE
// ============================================
vec3 soulPulseCore(vec2 uv) {
  if (vSoulPulseIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Pulsing white-violet core
  // Color: White → Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = vGradientProgress;
  
  // Breath → core expansion (already in vertex)
  
  // High → flare shimmer: fbm(uv*10 + time)*uHigh*0.3
  float flareShimmer = fbm(uv * 10.0 + uTime * 0.3) * uHigh * 0.3;
  flareShimmer = smoothstep(0.7, 1.0, flareShimmer);
  
  // White → Violet gradient
  vec3 coreColor = mix(whiteColor, violetColor, gradientT * 0.8);
  
  // Core radial fade
  float radialFade = 1.0 - smoothstep(0.0, 1.0, vRadius);
  
  return coreColor * radialFade * (1.0 + flareShimmer) * 1.3;
}

// ============================================
// LAYER N: BLOOM MASK LAYER
// ============================================
vec3 bloomMaskLayer(vec2 uv) {
  if (vBloomIndex < 0.0) {
    return vec3(0.0);
  }
  
  // Strong bloom intensity around soul core
  // BlessingWave → bloom boost
  float distFromCenter = vRadialDistance;
  float bloomIntensity = 1.0 - smoothstep(0.0, 6.0, distFromCenter);
  
  // BlessingWave → bloom boost
  float blessingBoost = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingBoost = uBlessingWaveProgress * 0.8;
  }
  
  bloomIntensity = min(bloomIntensity + blessingBoost, 1.0);
  
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
  
  // Layer A: Astral Base Plane (base layer)
  vec3 layerA = astralBasePlane(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Twin Spiral Bridges (additive blending)
  vec3 layerB = twinSpiralBridges(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Ascension Ramps (additive blending)
  vec3 layerC = ascensionRamps(uv);
  finalColor += layerC * 0.5;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: SoulLight Nodes (additive blending)
  vec3 layerD = soulLightNodes(uv);
  finalColor += layerD * 0.7;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Central Chakra Beam (additive blending)
  vec3 layerE = centralChakraBeam(uv);
  finalColor += layerE * 0.7;
  bloomMask = max(bloomMask, length(layerE));
  
  // Layer F: Spiral Runners (additive blending)
  vec3 layerF = spiralRunners(uv);
  finalColor += layerF * 0.5;
  bloomMask = max(bloomMask, length(layerF));
  
  // Layer G: Astral Threads (additive blending)
  vec3 layerG = astralThreads(uv);
  finalColor += layerG * 0.4;
  bloomMask = max(bloomMask, length(layerG));
  
  // Layer H: SoulWave Rings (additive blending)
  vec3 layerH = soulWaveRings(uv);
  finalColor += layerH * 0.4;
  bloomMask = max(bloomMask, length(layerH));
  
  // Layer I: Dimensional Overlay (additive blending)
  vec3 layerI = dimensionalOverlay(uv);
  finalColor += layerI * 0.3;
  bloomMask = max(bloomMask, length(layerI));
  
  // Layer J: Bridge Glyphs (additive blending)
  vec3 layerJ = bridgeGlyphs(uv);
  finalColor += layerJ * 0.7;
  bloomMask = max(bloomMask, length(layerJ));
  
  // Layer K: Energy Particles (additive blending)
  vec3 layerK = energyParticles(uv);
  finalColor += layerK * 0.7;
  bloomMask = max(bloomMask, length(layerK));
  
  // Layer L: Light Beams (additive blending)
  vec3 layerL = lightBeams(uv);
  finalColor += layerL * 0.4;
  bloomMask = max(bloomMask, length(layerL));
  
  // Layer M: Soul Pulse Core (additive blending)
  vec3 layerM = soulPulseCore(uv);
  finalColor += layerM * 1.3;
  bloomMask = max(bloomMask, length(layerM));
  
  // Layer N: Bloom Mask Layer (additive blending)
  vec3 layerN = bloomMaskLayer(uv);
  finalColor += layerN * 0.4;
  bloomMask = max(bloomMask, length(layerN));
  
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

