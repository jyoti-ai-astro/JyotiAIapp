/**
 * Soul Bridge v3 Vertex Shader
 * 
 * Phase 2 — Section 58: SOUL BRIDGE ENGINE v3
 * Soul Bridge Engine v3 (E62)
 * 
 * 14-layer astral connection bridge: Astral Base Plane, Twin Spiral Bridges, Ascension Ramps, SoulLight Nodes, Central Chakra Beam, Spiral Runners, Astral Threads, SoulWave Rings, Dimensional Overlay, Bridge Glyphs, Energy Particles, Light Beams, Soul Pulse Core, Bloom Mask Layer
 */

export const soulBridgeVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float basePlaneIndex;
attribute float twinSpiralIndex;
attribute float ascensionRampIndex;
attribute float soulLightIndex;
attribute float chakraBeamIndex;
attribute float spiralRunnerIndex;
attribute float astralThreadIndex;
attribute float soulWaveIndex;
attribute float dimensionalOverlayIndex;
attribute float bridgeGlyphIndex;
attribute float energyParticleIndex;
attribute float lightBeamIndex;
attribute float soulPulseIndex;
attribute float bloomIndex;
attribute float radialSegment;
attribute float concentricRing;

uniform float uTime;
uniform float uBreathPhase;
uniform float uBreathStrength;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;
uniform float uRotationSync; // From Projection (E17)
uniform float uCameraFOV;
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

// ============================================
// LOGARITHMIC SPIRAL FUNCTION
// ============================================
vec2 logarithmicSpiral(float t, float spiralIndex, float rotationDirection) {
  // Logarithmic spiral curve
  float angle = t * 6.28318 * 4.0 * rotationDirection; // 4 full rotations, counter-rotating
  float baseRadius = 0.5;
  float maxRadius = 6.0;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBasePlaneIndex = basePlaneIndex;
  vTwinSpiralIndex = twinSpiralIndex;
  vAscensionRampIndex = ascensionRampIndex;
  vSoulLightIndex = soulLightIndex;
  vChakraBeamIndex = chakraBeamIndex;
  vSpiralRunnerIndex = spiralRunnerIndex;
  vAstralThreadIndex = astralThreadIndex;
  vSoulWaveIndex = soulWaveIndex;
  vDimensionalOverlayIndex = dimensionalOverlayIndex;
  vBridgeGlyphIndex = bridgeGlyphIndex;
  vEnergyParticleIndex = energyParticleIndex;
  vLightBeamIndex = lightBeamIndex;
  vSoulPulseIndex = soulPulseIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: ASTRAL BASE PLANE
  // ============================================
  if (basePlaneIndex >= 0.0) {
    // 64×64 grid plane
    float planeWidth = 12.0;
    float planeHeight = 12.0;
    float x = (uv.x - 0.5) * planeWidth;
    float z = (uv.y - 0.5) * planeHeight;
    
    // Scroll → rising motion
    float scrollRise = uScroll * 0.3;
    float y = scrollRise * 0.5;
    
    // Breath → plane pulse
    float breathPulse = sin(uBreathPhase * 6.28318) * uBreathStrength * 0.1;
    y += breathPulse;
    
    // High → shimmer dust (handled in fragment)
    
    pos = vec3(x, y, z - 18.0);
    
    vRadius = length(pos.xz);
    vGradientProgress = (length(pos.xz) / 6.0);
  }
  
  // ============================================
  // LAYER B: TWIN SPIRAL BRIDGES
  // ============================================
  if (twinSpiralIndex >= 0.0) {
    // 2 counter-rotating spirals
    float spiralIdx = twinSpiralIndex;
    float rotationDirection = spiralIdx < 0.5 ? 1.0 : -1.0; // Counter-rotating
    float t = uv.y; // 0 to 1 along spiral
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationDirection);
    
    // Bass → wobble
    float bassWobble = sin(uTime * 3.5 + t * 10.0) * uBass * 0.02;
    spiralPos += normalize(spiralPos) * bassWobble;
    
    // High → sparkle (handled in fragment)
    
    // Spiral width
    float spiralWidth = 0.15;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 2.0, spiralPos.y - 18.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: ASCENSION RAMPS
  // ============================================
  if (ascensionRampIndex >= 0.0) {
    // 2 ramps riding along spirals
    float rampIdx = ascensionRampIndex;
    float rotationDirection = rampIdx < 0.5 ? 1.0 : -1.0;
    float t = uv.y; // 0 to 1 along ramp
    
    // Scroll → climb progression
    float scrollClimb = uScroll * 0.4;
    t += scrollClimb;
    t = mod(t, 1.0);
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, rampIdx, rotationDirection);
    
    // Breath → width modulation (handled in fragment)
    
    // Ramp width
    float rampWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * rampWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 2.0 + 0.1, spiralPos.y - 18.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER D: SOULLIGHT NODES
  // ============================================
  if (soulLightIndex >= 0.0) {
    // 60–90 nodes along spirals
    float numNodes = 90.0;
    float nodeIdx = soulLightIndex;
    float spiralIdx = mod(nodeIdx, 2.0);
    float rotationDirection = spiralIdx < 1.0 ? 1.0 : -1.0;
    float t = (nodeIdx / numNodes);
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationDirection);
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + nodeIdx * 2.0) * uBass * 0.01;
    spiralPos += normalize(spiralPos) * bassJitter;
    
    // BlessingWave → soul flash (handled in fragment)
    
    // Node size
    float nodeSize = 0.2;
    float x = (uv.x - 0.5) * nodeSize * 2.0;
    float y = (uv.y - 0.5) * nodeSize * 2.0;
    
    pos = vec3(spiralPos.x + x, t * 2.0 + y, spiralPos.y - 18.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = nodeSize;
  }
  
  // ============================================
  // LAYER E: CENTRAL CHAKRA BEAM
  // ============================================
  if (chakraBeamIndex >= 0.0) {
    // Vertical energy column
    float beamRadius = 0.8;
    float beamHeight = 4.0;
    float angle = uv.x * 6.28318;
    float height = uv.y * beamHeight;
    
    // Breath → width swelling
    float breathSwelling = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
    beamRadius *= breathSwelling;
    
    // High → spectral shimmer (handled in fragment)
    
    float radius = beamRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = height;
    
    pos = vec3(x, y, z - 18.0);
    
    vRadius = radius;
    vGradientProgress = height / beamHeight;
  }
  
  // ============================================
  // LAYER F: SPIRAL RUNNERS
  // ============================================
  if (spiralRunnerIndex >= 0.0) {
    // 8–12 runners
    float numRunners = 12.0;
    float runnerIdx = spiralRunnerIndex;
    float spiralIdx = mod(runnerIdx, 2.0);
    float rotationDirection = spiralIdx < 1.0 ? 1.0 : -1.0;
    float t = uv.y; // 0 to 1 along runner
    
    // Scroll → running speed
    float runningSpeed = uScroll * 0.5 + 0.1;
    t += uTime * runningSpeed;
    t = mod(t, 1.0);
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationDirection);
    
    // Breath → speed pulse (handled in fragment)
    
    // Runner width
    float runnerWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * runnerWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 2.0, spiralPos.y - 18.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER G: ASTRAL THREADS
  // ============================================
  if (astralThreadIndex >= 0.0) {
    // 12–24 threads cross-linking spirals
    float numThreads = 24.0;
    float threadIdx = astralThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    // Connect between spiral points
    float spiral1T = (threadIdx / numThreads);
    float spiral2T = 1.0 - spiral1T;
    
    vec2 spiral1Pos = logarithmicSpiral(spiral1T, 0.0, 1.0);
    vec2 spiral2Pos = logarithmicSpiral(spiral2T, 1.0, -1.0);
    
    vec2 threadPos = mix(spiral1Pos, spiral2Pos, t);
    
    // Bass → flicker (handled in fragment)
    
    // Thread width
    float threadWidth = 0.06;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(spiral2Pos - spiral1Pos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, (spiral1T + spiral2T) * 1.0, threadPos.y - 18.0);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER H: SOULWAVE RINGS
  // ============================================
  if (soulWaveIndex >= 0.0) {
    // 6–10 expanding rings
    float numWaves = 10.0;
    float waveIdx = soulWaveIndex;
    float baseRadius = 1.0 + (waveIdx / numWaves) * 5.0; // 1.0 to 6.0
    float angle = uv.x * 6.28318;
    float thickness = 0.2;
    
    // Scroll → expansion rate
    float expansionRate = uScroll * 0.3;
    baseRadius += uTime * expansionRate;
    baseRadius = mod(baseRadius, 6.0);
    
    // High → sparkle amplification (handled in fragment)
    
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 18.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 1.0) / 5.0;
  }
  
  // ============================================
  // LAYER I: DIMENSIONAL OVERLAY
  // ============================================
  if (dimensionalOverlayIndex >= 0.0) {
    // fbm distortion plane
    float planeWidth = 12.0;
    float planeHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // fbm distortion
    float distortion = fbm(xz * 0.4 + uTime * 0.2) * 0.9;
    
    // Scroll → distortion widening
    float scrollWidening = uScroll * 0.35;
    distortion += scrollWidening * 0.25;
    
    // BlessingWave → bright flash (handled in fragment)
    
    // Apply distortion
    xz += normalize(xz) * distortion;
    
    pos = vec3(xz.x, distortion * 0.3, xz.y - 18.0);
    
    vRadius = length(xz);
    vGradientProgress = distortion;
  }
  
  // ============================================
  // LAYER J: BRIDGE GLYPHS
  // ============================================
  if (bridgeGlyphIndex >= 0.0) {
    // 48–64 glyphs forming a bridge arc
    float numGlyphs = 64.0;
    float glyphAngle = (bridgeGlyphIndex / numGlyphs) * 6.28318;
    float baseRadius = 5.0;
    
    // Bass → glyph shake
    float bassShake = sin(uTime * 3.0 + bridgeGlyphIndex * 2.0) * uBass * 0.02;
    glyphAngle += bassShake;
    baseRadius += bassShake * 0.05;
    
    // High → sparkle (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.18;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 18.0);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER K: ENERGY PARTICLES
  // ============================================
  if (energyParticleIndex >= 0.0) {
    // 200–350 drifting points
    float numParticles = 350.0;
    float angle = (energyParticleIndex / numParticles) * 6.28318 * 7.0; // 7 full rotations
    float baseRadius = 0.5 + (energyParticleIndex / numParticles) * 6.5; // 0.5 to 7.0
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + energyParticleIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.8) * 0.15; // Slight vertical variation
    
    // Particle radius
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 18.0);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.5) / 6.5;
  }
  
  // ============================================
  // LAYER L: LIGHT BEAMS
  // ============================================
  if (lightBeamIndex >= 0.0) {
    // 6–12 rising beams
    float numBeams = 12.0;
    float beamAngle = (lightBeamIndex / numBeams) * 6.28318;
    float beamHeight = 4.0;
    float t = uv.y; // 0 to 1 along beam
    
    // Scroll → height growth
    float scrollGrowth = uScroll * 0.4;
    beamHeight *= (1.0 + scrollGrowth);
    
    // Breath → width modulation (handled in fragment)
    
    float height = t * beamHeight;
    float beamWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * beamWidth;
    float perpAngle = beamAngle + 1.5708; // Perpendicular
    float x = cos(beamAngle) * 3.0 + cos(perpAngle) * widthOffset;
    float z = sin(beamAngle) * 3.0 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 18.0);
    
    vAngle = beamAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER M: SOUL PULSE CORE
  // ============================================
  if (soulPulseIndex >= 0.0) {
    // Pulsing white-violet core
    float coreRadius = 1.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → core expansion
    float breathExpansion = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.25;
    radius *= breathExpansion;
    
    // High → flare shimmer (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 18.0);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER N: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Strong bloom intensity around soul core
    // Same plane as base plane
    float planeWidth = 12.0;
    float planeHeight = 12.0;
    float x = (uv.x - 0.5) * planeWidth;
    float z = (uv.y - 0.5) * planeHeight;
    float y = 0.0;
    
    // BlessingWave → bloom boost (handled in fragment)
    
    pos = vec3(x, y, z - 18.0);
    
    vRadius = length(pos.xz);
    vGradientProgress = vRadius / 6.0;
  }
  
  // ============================================
  // CAMERA FOV → PARALLAX WARP INTENSITY
  // ============================================
  float fovFactor = uCameraFOV / 75.0;
  pos.xy *= 1.0 + (fovFactor - 1.0) * 0.05;
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.2) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.2) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  vRadialDistance = length(pos.xz);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

