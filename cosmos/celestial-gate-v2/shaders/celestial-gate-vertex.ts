/**
 * Celestial Gate v2 Vertex Shader
 * 
 * Phase 2 — Section 62: CELESTIAL GATE ENGINE v2
 * Celestial Gate Engine v2 (E66)
 * 
 * 20-layer cosmic gate: Base Gate Disc, Twin Gate Pillars, Triple Arch Halo, Celestial Spiral Ribbons, Star Glyph Band, Ascension Rings, Orbital Star Runners, Cross-Dimension Threads, Stellar Flame Shell, Gate Light Shafts, Star Dust Spiral, Starfall Rays, Celestial Fog Layer, Outer Halo Crown, Gate Signature Symbols, Cosmic Lattice Field, Energy Thread Matrix, Ascension Spiral, Celestial Particle Field, Bloom Mask Layer
 */

export const celestialGateVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float baseGateDiscIndex;
attribute float twinPillarIndex;
attribute float tripleArchIndex;
attribute float spiralRibbonIndex;
attribute float starGlyphIndex;
attribute float ascensionRingIndex;
attribute float orbitalRunnerIndex;
attribute float crossThreadIndex;
attribute float flameShellIndex;
attribute float lightShaftIndex;
attribute float starDustIndex;
attribute float starfallRayIndex;
attribute float fogLayerIndex;
attribute float outerHaloIndex;
attribute float signatureSymbolIndex;
attribute float latticeFieldIndex;
attribute float energyThreadIndex;
attribute float ascensionSpiralIndex;
attribute float particleFieldIndex;
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
varying float vBaseGateDiscIndex;
varying float vTwinPillarIndex;
varying float vTripleArchIndex;
varying float vSpiralRibbonIndex;
varying float vStarGlyphIndex;
varying float vAscensionRingIndex;
varying float vOrbitalRunnerIndex;
varying float vCrossThreadIndex;
varying float vFlameShellIndex;
varying float vLightShaftIndex;
varying float vStarDustIndex;
varying float vStarfallRayIndex;
varying float vFogLayerIndex;
varying float vOuterHaloIndex;
varying float vSignatureSymbolIndex;
varying float vLatticeFieldIndex;
varying float vEnergyThreadIndex;
varying float vAscensionSpiralIndex;
varying float vParticleFieldIndex;
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
vec2 logarithmicSpiral(float t, float spiralIndex, float rotationSpeed) {
  float angle = t * 6.28318 * 4.0 * rotationSpeed;
  float baseRadius = 0.3;
  float maxRadius = 7.0;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBaseGateDiscIndex = baseGateDiscIndex;
  vTwinPillarIndex = twinPillarIndex;
  vTripleArchIndex = tripleArchIndex;
  vSpiralRibbonIndex = spiralRibbonIndex;
  vStarGlyphIndex = starGlyphIndex;
  vAscensionRingIndex = ascensionRingIndex;
  vOrbitalRunnerIndex = orbitalRunnerIndex;
  vCrossThreadIndex = crossThreadIndex;
  vFlameShellIndex = flameShellIndex;
  vLightShaftIndex = lightShaftIndex;
  vStarDustIndex = starDustIndex;
  vStarfallRayIndex = starfallRayIndex;
  vFogLayerIndex = fogLayerIndex;
  vOuterHaloIndex = outerHaloIndex;
  vSignatureSymbolIndex = signatureSymbolIndex;
  vLatticeFieldIndex = latticeFieldIndex;
  vEnergyThreadIndex = energyThreadIndex;
  vAscensionSpiralIndex = ascensionSpiralIndex;
  vParticleFieldIndex = particleFieldIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: BASE GATE DISC
  // ============================================
  if (baseGateDiscIndex >= 0.0) {
    // 64 radial × 32 concentric grid
    float gateRadius = 6.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * gateRadius;
    
    // Scroll → rotation + expansion
    float scrollRotation = uScroll * 0.6;
    angle += scrollRotation;
    float scrollExpansion = 1.0 + uScroll * 0.15;
    radius *= scrollExpansion;
    
    // Breath → pulsation
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathPulse;
    
    // High → shimmer (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 30.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / gateRadius;
  }
  
  // ============================================
  // LAYER B: TWIN GATE PILLARS
  // ============================================
  if (twinPillarIndex >= 0.0) {
    // 2 vertical arc pillars
    float pillarIdx = twinPillarIndex;
    float pillarAngle = pillarIdx * 3.14159; // 0 or π
    float pillarRadius = 5.5;
    float pillarHeight = 8.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + pillarIdx * 2.0) * uBass * 0.02;
    pillarAngle += bassWobble;
    pillarRadius += bassWobble * 0.05;
    
    float height = t * pillarHeight;
    float pillarWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * pillarWidth;
    float perpAngle = pillarAngle + 1.5708;
    float x = cos(pillarAngle) * pillarRadius + cos(perpAngle) * widthOffset;
    float z = sin(pillarAngle) * pillarRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 30.0);
    
    vAngle = pillarAngle;
    vRadius = pillarRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: TRIPLE ARCH HALO
  // ============================================
  if (tripleArchIndex >= 0.0) {
    // 3 rotating arches
    float archIdx = tripleArchIndex;
    float archRadius = 5.0 + archIdx * 0.5; // 5.0 to 6.0
    float angle = uv.x * 6.28318;
    
    // RotationSync → tilt + sync
    float archTilt = uRotationSync * 0.15;
    angle += archTilt;
    
    float radius = archRadius;
    float archThickness = 0.25;
    radius += (uv.y - 0.5) * archThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 2.0 + archIdx * 0.3;
    
    pos = vec3(x, y, z - 30.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = archIdx / 3.0;
  }
  
  // ============================================
  // LAYER D: CELESTIAL SPIRAL RIBBONS
  // ============================================
  if (spiralRibbonIndex >= 0.0) {
    // 3–5 ribbons
    float ribbonIdx = spiralRibbonIndex;
    float rotationSpeed = 0.8 + ribbonIdx * 0.2;
    float t = uv.y; // 0 to 1 along ribbon
    
    vec2 spiralPos = logarithmicSpiral(t, ribbonIdx, rotationSpeed);
    
    // Scroll → ribbon speed
    float scrollSpeed = uScroll * 0.4;
    t += scrollSpeed;
    t = mod(t, 1.0);
    spiralPos = logarithmicSpiral(t, ribbonIdx, rotationSpeed);
    
    float ribbonWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * ribbonWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 3.0, spiralPos.y - 30.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER E: STAR GLYPH BAND
  // ============================================
  if (starGlyphIndex >= 0.0) {
    // 72–108 glyphs around perimeter
    float numGlyphs = 108.0;
    float glyphAngle = (starGlyphIndex / numGlyphs) * 6.28318;
    float baseRadius = 6.0;
    
    // BlessingWave → glyph flash (handled in fragment)
    
    float glyphSize = 0.2;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 30.0);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER F: ASCENSION RINGS
  // ============================================
  if (ascensionRingIndex >= 0.0) {
    // 3 expanding rings
    float ringIdx = ascensionRingIndex;
    float baseRadius = 2.0 + ringIdx * 1.5; // 2.0 to 6.5
    float angle = uv.x * 6.28318;
    float thickness = 0.2;
    
    // Breath → ring radius pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.1;
    baseRadius *= breathPulse;
    
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 30.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = ringIdx / 3.0;
  }
  
  // ============================================
  // LAYER G: ORBITAL STAR RUNNERS
  // ============================================
  if (orbitalRunnerIndex >= 0.0) {
    // 6–12 fast runners
    float numRunners = 12.0;
    float runnerIdx = orbitalRunnerIndex;
    float runnerRadius = 5.5;
    float angle = (runnerIdx / numRunners) * 6.28318 + uTime * 2.0; // Fast rotation
    
    // High → sparkle (handled in fragment)
    
    float runnerSize = 0.15;
    float quadSize = runnerSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float runnerX = cos(angle) * runnerRadius;
    float runnerZ = sin(angle) * runnerRadius;
    
    pos = vec3(runnerX + x, y, runnerZ - 30.0);
    
    vAngle = angle;
    vRadius = runnerRadius;
    vGradientProgress = runnerIdx / numRunners;
  }
  
  // ============================================
  // LAYER H: CROSS-DIMENSION THREADS
  // ============================================
  if (crossThreadIndex >= 0.0) {
    // 24–40 threads
    float numThreads = 40.0;
    float threadIdx = crossThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 3.14159;
    float radius1 = 4.0;
    float radius2 = 6.0;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    
    // Scroll → velocity
    float scrollVelocity = uScroll * 0.4;
    t += scrollVelocity;
    t = mod(t, 1.0);
    
    vec2 threadPos = mix(pos1, pos2, t);
    
    float threadWidth = 0.08;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 2.5, threadPos.y - 30.0);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER I: STELLAR FLAME SHELL
  // ============================================
  if (flameShellIndex >= 0.0) {
    // fbm flame pattern
    float flameWidth = 12.0;
    float flameHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * flameWidth, (uv.y - 0.5) * flameHeight);
    
    // fbm flame
    float flameDensity = fbm(xz * 0.3 + uTime * 0.2) * 0.8;
    
    // Breath → flame height pulse
    float breathHeight = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
    float height = flameDensity * 2.0 * breathHeight;
    
    xz += normalize(xz) * flameDensity * 0.3;
    
    pos = vec3(xz.x, height, xz.y - 30.0);
    
    vRadius = length(xz);
    vGradientProgress = flameDensity;
  }
  
  // ============================================
  // LAYER J: GATE LIGHT SHAFTS
  // ============================================
  if (lightShaftIndex >= 0.0) {
    // 8–14 shafts
    float numShafts = 14.0;
    float shaftAngle = (lightShaftIndex / numShafts) * 6.28318;
    float shaftHeight = 8.0;
    float t = uv.y; // 0 to 1 along shaft
    
    // BlessingWave → flash (handled in fragment)
    
    float height = t * shaftHeight;
    float shaftWidth = 0.16;
    float widthOffset = (uv.x - 0.5) * shaftWidth;
    float perpAngle = shaftAngle + 1.5708;
    float x = cos(shaftAngle) * 4.5 + cos(perpAngle) * widthOffset;
    float z = sin(shaftAngle) * 4.5 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 30.0);
    
    vAngle = shaftAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER K: STAR DUST SPIRAL
  // ============================================
  if (starDustIndex >= 0.0) {
    // 120–200 particles
    float numParticles = 200.0;
    float angle = (starDustIndex / numParticles) * 6.28318 * 12.0; // 12 full rotations
    float baseRadius = 0.5 + (starDustIndex / numParticles) * 7.0; // 0.5 to 7.5
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + starDustIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.4;
    
    float particleRadius = 0.01;
    
    pos = vec3(x, y, z - 30.0);
    pos *= particleRadius;
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.5) / 7.0;
  }
  
  // ============================================
  // LAYER L: STARFALL RAYS
  // ============================================
  if (starfallRayIndex >= 0.0) {
    // 12–20 rays
    float numRays = 20.0;
    float rayAngle = (starfallRayIndex / numRays) * 6.28318;
    float rayLength = 9.0;
    float t = uv.y; // 0 to 1 along ray
    
    // Scroll → rotation accel
    float scrollRotation = uScroll * 0.6;
    rayAngle += scrollRotation;
    
    float length = t * rayLength;
    float x = cos(rayAngle) * length;
    float z = sin(rayAngle) * length;
    float y = 0.0;
    
    float rayWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708;
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 30.0);
    
    vAngle = rayAngle;
    vRadius = length;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER M: CELESTIAL FOG LAYER
  // ============================================
  if (fogLayerIndex >= 0.0) {
    // 64×64 fog grid
    float fogWidth = 12.0;
    float fogHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * fogWidth, (uv.y - 0.5) * fogHeight);
    
    // fbm fog
    float fogDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Breath → opacity pulse (handled in fragment)
    
    xz += normalize(xz) * fogDensity * 0.3;
    
    pos = vec3(xz.x, fogDensity * 0.5, xz.y - 30.0);
    
    vRadius = length(xz);
    vGradientProgress = fogDensity;
  }
  
  // ============================================
  // LAYER N: OUTER HALO CROWN
  // ============================================
  if (outerHaloIndex >= 0.0) {
    // Large rotating halo
    float haloRadius = 7.0;
    float angle = uv.x * 6.28318;
    float thickness = 0.3;
    
    // RotationSync → tilt
    float haloTilt = uRotationSync * 0.15;
    angle += haloTilt;
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 30.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 7.0) / 0.3;
  }
  
  // ============================================
  // LAYER O: GATE SIGNATURE SYMBOLS
  // ============================================
  if (signatureSymbolIndex >= 0.0) {
    // 12–20 large symbols
    float numSymbols = 20.0;
    float symbolAngle = (signatureSymbolIndex / numSymbols) * 6.28318;
    float baseRadius = 5.5;
    
    // High → shimmer (handled in fragment)
    
    float symbolSize = 0.4;
    float quadSize = symbolSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float symbolX = cos(symbolAngle) * baseRadius;
    float symbolZ = sin(symbolAngle) * baseRadius;
    
    pos = vec3(symbolX + x, y, symbolZ - 30.0);
    
    vAngle = symbolAngle;
    vRadius = baseRadius;
    vGradientProgress = symbolSize;
  }
  
  // ============================================
  // LAYER P: COSMIC LATTICE FIELD
  // ============================================
  if (latticeFieldIndex >= 0.0) {
    // fbm lattice distortion
    float latticeWidth = 12.0;
    float latticeHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * latticeWidth, (uv.y - 0.5) * latticeHeight);
    
    // fbm lattice
    float latticeDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Scroll → drift
    float scrollDrift = uScroll * 0.3;
    xz += normalize(xz) * scrollDrift * 0.2;
    latticeDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    xz += normalize(xz) * latticeDensity * 0.3;
    
    pos = vec3(xz.x, latticeDensity * 0.4, xz.y - 30.0);
    
    vRadius = length(xz);
    vGradientProgress = latticeDensity;
  }
  
  // ============================================
  // LAYER Q: ENERGY THREAD MATRIX
  // ============================================
  if (energyThreadIndex >= 0.0) {
    // 20–40 matrix beams
    float numThreads = 40.0;
    float threadIdx = energyThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 1.5708; // Perpendicular
    float radius1 = 3.0;
    float radius2 = 6.5;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    
    vec2 threadPos = mix(pos1, pos2, t);
    
    // Breath → thickness pulse (handled in fragment)
    
    float threadWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 2.0, threadPos.y - 30.0);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER R: ASCENSION SPIRAL
  // ============================================
  if (ascensionSpiralIndex >= 0.0) {
    // Giant spiral reaching upward
    float rotationSpeed = 0.6;
    float t = uv.y; // 0 to 1 along spiral
    
    vec2 spiralPos = logarithmicSpiral(t, 0.0, rotationSpeed);
    
    // Scroll → acceleration
    float scrollAccel = uScroll * 0.5;
    t += scrollAccel;
    t = mod(t, 1.0);
    spiralPos = logarithmicSpiral(t, 0.0, rotationSpeed);
    
    float spiralWidth = 0.15;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    float height = t * 10.0; // Reaching upward
    
    pos = vec3(spiralPos.x, height, spiralPos.y - 30.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER S: CELESTIAL PARTICLE FIELD
  // ============================================
  if (particleFieldIndex >= 0.0) {
    // 200–350 particles
    float numParticles = 350.0;
    float angle = (particleFieldIndex / numParticles) * 6.28318 * 15.0; // 15 full rotations
    float baseRadius = 0.3 + (particleFieldIndex / numParticles) * 8.0; // 0.3 to 8.3
    
    // Bass + High → sparkle + jitter
    float bassJitter = sin(uTime * 4.0 + particleFieldIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.5;
    
    float particleRadius = 0.011;
    
    pos = vec3(x, y, z - 30.0);
    pos *= particleRadius;
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.3) / 8.0;
  }
  
  // ============================================
  // LAYER T: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Strong bloom for E12
    float gateRadius = 6.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * gateRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 30.0);
    
    vRadius = radius;
    vGradientProgress = radius / gateRadius;
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

