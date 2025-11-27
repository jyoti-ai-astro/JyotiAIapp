/**
 * Astral Thread v2 Fragment Shader
 * 
 * Phase 2 — Section 54: ASTRAL THREAD ENGINE v2
 * Astral Thread Engine v2 (E58)
 * 
 * 5-layer quantum connective beam: Primary Astral Beams, Cross-Lattice Connectors, Energy Packets, Ether Strands, Quantum Dust Nodes
 */

export const astralThreadFragmentShader = `
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
varying float vBeamIndex;
varying float vLatticeIndex;
varying float vPacketIndex;
varying float vStrandIndex;
varying float vDustIndex;
varying float vBeamProgress;
varying float vBeamSegment;
varying float vDistance;
varying float vRadialDistance;
varying float vBeamDistance;
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
// LAYER A: PRIMARY ASTRAL BEAMS
// ============================================
vec3 primaryAstralBeams(vec2 uv) {
  if (vBeamIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 6-12 long beams connecting radial points
  // Color: White → Cyan → Indigo
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 indigoColor = vec3(0.2, 0.3, 0.6);
  
  float gradientT = vBeamDistance; // Progress along beam
  
  // Scroll → beam progression parameter (already in vertex)
  
  // Breath → beam width modulation
  float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // High → shimmer streaks: fbm(uv*8 + time)*uHigh*0.25
  float shimmer = fbm(uv * 8.0 + uTime * 0.3) * uHigh * 0.25;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  
  // BlessingWave → white-violet strike flash: uBlessingWaveProgress * 0.9
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.9;
  }
  
  // White → Cyan → Indigo gradient
  vec3 beamColor;
  if (gradientT < 0.5) {
    beamColor = mix(whiteColor, cyanColor, gradientT * 2.0);
  } else {
    beamColor = mix(cyanColor, indigoColor, (gradientT - 0.5) * 2.0);
  }
  
  // Beam width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  // Add blessing flash
  if (blessingFlash > 0.0) {
    vec3 flashColor = mix(whiteColor, vec3(0.8, 0.6, 1.0), 0.5); // White-violet
    beamColor = mix(beamColor, flashColor, blessingFlash);
  }
  
  return beamColor * widthFade * breathWidth * (1.0 + shimmer) * 0.6;
}

// ============================================
// LAYER B: CROSS-LATTICE CONNECTORS
// ============================================
vec3 crossLatticeConnectors(vec2 uv) {
  if (vLatticeIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 24-40 thin criss-cross links between beams
  // Color: Cyan → Blue
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 blueColor = vec3(0.3, 0.6, 1.0);
  
  float gradientT = vBeamDistance; // Progress along connector
  
  // Breath → subtle expansion (handled in fragment via opacity)
  float breathExpansion = 1.0 + uBreathStrength * 0.1;
  
  // Mid → turbulence jitter: fbm(uv*4 + time)*uMid*0.2
  float turbulence = fbm(uv * 4.0 + uTime * 0.3) * uMid * 0.2;
  turbulence = smoothstep(0.6, 1.0, turbulence);
  
  // High → micro-glitter: fbm(uv*12 + time)*uHigh*0.3
  float glitter = fbm(uv * 12.0 + uTime * 0.3) * uHigh * 0.3;
  glitter = smoothstep(0.7, 1.0, glitter);
  
  // Cyan → Blue gradient
  vec3 connectorColor = mix(cyanColor, blueColor, gradientT * 0.8);
  
  // Connector width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.4, widthFade);
  
  return connectorColor * widthFade * breathExpansion * (1.0 + turbulence + glitter) * 0.3;
}

// ============================================
// LAYER C: ENERGY PACKETS
// ============================================
vec3 energyPackets(vec2 uv) {
  if (vPacketIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 12-20 packets traveling along beams
  // Color: White → Violet → Gold
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 goldColor = vec3(1.0, 0.8, 0.3);
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Packet circle SDF
  float packetRadius = 0.22;
  float packetDist = sdCircle(p, packetRadius);
  float packetMask = 1.0 - smoothstep(0.0, packetRadius * 2.0, packetDist);
  
  // Travel speed tied to scrollProgress (already in vertex)
  
  // Bass → packet flicker: sin(time*5 + packetIndex)*uBass*0.2
  float flicker = sin(uTime * 5.0 + vPacketIndex * 3.0) * uBass * 0.2;
  flicker = smoothstep(0.5, 1.0, flicker);
  
  // High → sparkle noise: fbm(uv*18 + time)*uHigh*0.3
  float sparkle = fbm(uv * 18.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // Breath → packet size pulse (already in vertex)
  
  // White → Violet → Gold gradient
  float gradientT = dist / packetRadius;
  vec3 packetColor;
  if (gradientT < 0.5) {
    packetColor = mix(whiteColor, violetColor, gradientT * 2.0);
  } else {
    packetColor = mix(violetColor, goldColor, (gradientT - 0.5) * 2.0);
  }
  
  return packetColor * packetMask * (1.0 + flicker + sparkle) * 0.7;
}

// ============================================
// LAYER D: ETHER STRANDS
// ============================================
vec3 etherStrands(vec2 uv) {
  if (vStrandIndex < 0.0) {
    return vec3(0.0);
  }
  
  // 40-60 thin translucent strands drifting diagonally
  // Color: White → Cyan
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  
  float gradientT = vGradientProgress; // Progress along strand
  
  // fbm-based drift (already in vertex)
  
  // Scroll → diagonal drift shift (already in vertex)
  
  // Breath → opacity expansion
  float breathOpacity = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
  
  // White → Cyan gradient
  vec3 strandColor = mix(whiteColor, cyanColor, gradientT * 0.7);
  
  // Strand width fade
  float widthFade = 1.0 - abs(uv.x - 0.5) * 2.0;
  widthFade = smoothstep(0.0, 0.3, widthFade);
  
  // Soft fog effect
  float fogMask = fbm(uv * 3.0 + uTime * 0.1) * 0.5 + 0.5;
  fogMask = smoothstep(0.4, 0.6, fogMask);
  
  return strandColor * widthFade * fogMask * breathOpacity * 0.25;
}

// ============================================
// LAYER E: QUANTUM DUST NODES
// ============================================
vec3 quantumDustNodes(vec2 uv) {
  if (vDustIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 180-260 particles around beam intersections
  // Radius: 0.01-0.015
  float dustRadius = 0.0125;
  float dustDist = sdCircle(p, dustRadius);
  float dustMask = 1.0 - smoothstep(0.0, dustRadius * 2.0, dustDist);
  
  // Bass → jitter (already in vertex)
  
  // High → sparkle: fbm(uv*24 + time)*uHigh*0.3
  float sparkle = fbm(uv * 24.0 + uTime) * uHigh * 0.3;
  sparkle = smoothstep(0.6, 1.0, sparkle);
  
  // BlessingWave → burst flash: uBlessingWaveProgress * 0.8
  float blessingFlash = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingFlash = uBlessingWaveProgress * 0.8;
  }
  
  // Vertical variation: sin(angle*2.0)*0.12 (already in vertex)
  
  // Color: White–Cyan–Violet
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 cyanColor = vec3(0.2, 0.7, 0.9);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  float gradientT = dist / dustRadius;
  vec3 dustColor;
  if (gradientT < 0.33) {
    dustColor = mix(whiteColor, cyanColor, gradientT * 3.0);
  } else {
    dustColor = mix(cyanColor, violetColor, (gradientT - 0.33) * 1.5);
  }
  
  return dustColor * dustMask * (1.0 + sparkle + blessingFlash) * 0.8;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Primary Astral Beams (base layer)
  vec3 layerA = primaryAstralBeams(uv);
  finalColor = layerA; // Base layer, not additive
  
  // Layer B: Cross-Lattice Connectors (additive blending)
  vec3 layerB = crossLatticeConnectors(uv);
  finalColor += layerB * 0.4;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Energy Packets (additive blending)
  vec3 layerC = energyPackets(uv);
  finalColor += layerC * 0.7;
  bloomMask = max(bloomMask, length(layerC));
  
  // Layer D: Ether Strands (additive blending)
  vec3 layerD = etherStrands(uv);
  finalColor += layerD * 0.3;
  bloomMask = max(bloomMask, length(layerD));
  
  // Layer E: Quantum Dust Nodes (additive blending)
  vec3 layerE = quantumDustNodes(uv);
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

