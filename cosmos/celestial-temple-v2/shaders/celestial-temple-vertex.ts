/**
 * Celestial Temple v2 Vertex Shader
 * 
 * Phase 2 — Section 63: CELESTIAL TEMPLE ENGINE v2
 * Celestial Temple Engine v2 (E67)
 * 
 * 22-layer divine temple portal: Temple Base Platform, Twin Celestial Staircases, Temple Gate Pillars, Triple Arch Gate, Divine Spiral Halo, Temple Glyph Band, Ascension Columns, Cross-Dimensional Bridges, Orbital Runner Circles, Temple Flame Shell, Celestial Fog Plane, Temple Light Shafts, Energy Spiral Threads, Divine Particle Field, Ascension Rays, Outer Halo Crown, Inner Temple Core, Celestial Lattice Shell, Temple Stair Runners, Radiant Mesh Field, Temple Aura, Ascension Spiral Aura, Bloom Mask Layer
 */

export const celestialTempleVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float basePlatformIndex;
attribute float twinStaircaseIndex;
attribute float gatePillarIndex;
attribute float tripleArchIndex;
attribute float spiralHaloIndex;
attribute float glyphBandIndex;
attribute float ascensionColumnIndex;
attribute float crossBridgeIndex;
attribute float orbitalRunnerIndex;
attribute float flameShellIndex;
attribute float fogPlaneIndex;
attribute float lightShaftIndex;
attribute float energySpiralIndex;
attribute float particleFieldIndex;
attribute float ascensionRayIndex;
attribute float outerHaloIndex;
attribute float innerCoreIndex;
attribute float latticeShellIndex;
attribute float stairRunnerIndex;
attribute float meshFieldIndex;
attribute float templeAuraIndex;
attribute float spiralAuraIndex;
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
varying float vBasePlatformIndex;
varying float vTwinStaircaseIndex;
varying float vGatePillarIndex;
varying float vTripleArchIndex;
varying float vSpiralHaloIndex;
varying float vGlyphBandIndex;
varying float vAscensionColumnIndex;
varying float vCrossBridgeIndex;
varying float vOrbitalRunnerIndex;
varying float vFlameShellIndex;
varying float vFogPlaneIndex;
varying float vLightShaftIndex;
varying float vEnergySpiralIndex;
varying float vParticleFieldIndex;
varying float vAscensionRayIndex;
varying float vOuterHaloIndex;
varying float vInnerCoreIndex;
varying float vLatticeShellIndex;
varying float vStairRunnerIndex;
varying float vMeshFieldIndex;
varying float vTempleAuraIndex;
varying float vSpiralAuraIndex;
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
  vBasePlatformIndex = basePlatformIndex;
  vTwinStaircaseIndex = twinStaircaseIndex;
  vGatePillarIndex = gatePillarIndex;
  vTripleArchIndex = tripleArchIndex;
  vSpiralHaloIndex = spiralHaloIndex;
  vGlyphBandIndex = glyphBandIndex;
  vAscensionColumnIndex = ascensionColumnIndex;
  vCrossBridgeIndex = crossBridgeIndex;
  vOrbitalRunnerIndex = orbitalRunnerIndex;
  vFlameShellIndex = flameShellIndex;
  vFogPlaneIndex = fogPlaneIndex;
  vLightShaftIndex = lightShaftIndex;
  vEnergySpiralIndex = energySpiralIndex;
  vParticleFieldIndex = particleFieldIndex;
  vAscensionRayIndex = ascensionRayIndex;
  vOuterHaloIndex = outerHaloIndex;
  vInnerCoreIndex = innerCoreIndex;
  vLatticeShellIndex = latticeShellIndex;
  vStairRunnerIndex = stairRunnerIndex;
  vMeshFieldIndex = meshFieldIndex;
  vTempleAuraIndex = templeAuraIndex;
  vSpiralAuraIndex = spiralAuraIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: TEMPLE BASE PLATFORM
  // ============================================
  if (basePlatformIndex >= 0.0) {
    // 64×64 grid, radius 6.0
    float platformRadius = 6.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * platformRadius;
    
    // Scroll → rotation accel
    float scrollRotation = uScroll * 0.6;
    angle += scrollRotation;
    
    // Breath → pulsation
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathPulse;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 33.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / platformRadius;
  }
  
  // ============================================
  // LAYER B: TWIN CELESTIAL STAIRCASES
  // ============================================
  if (twinStaircaseIndex >= 0.0) {
    // 2 spiral staircases rising upward
    float stairIdx = twinStaircaseIndex;
    float stairAngle = stairIdx * 3.14159; // 0 or π
    float stairRadius = 4.5;
    float stairHeight = 9.0;
    float t = uv.y; // 0 to 1 along staircase
    
    // Scroll → climb motion
    float scrollClimb = uScroll * 0.4;
    t += scrollClimb;
    t = mod(t, 1.0);
    
    float height = t * stairHeight;
    float stairWidth = 0.25;
    float widthOffset = (uv.x - 0.5) * stairWidth;
    float perpAngle = stairAngle + 1.5708;
    float x = cos(stairAngle) * stairRadius + cos(perpAngle) * widthOffset;
    float z = sin(stairAngle) * stairRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 33.2);
    
    vAngle = stairAngle;
    vRadius = stairRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: TEMPLE GATE PILLARS
  // ============================================
  if (gatePillarIndex >= 0.0) {
    // 6–12 pillars
    float numPillars = 12.0;
    float pillarAngle = (gatePillarIndex / numPillars) * 6.28318;
    float pillarRadius = 5.5;
    float pillarHeight = 8.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + gatePillarIndex * 2.0) * uBass * 0.02;
    pillarAngle += bassWobble;
    pillarRadius += bassWobble * 0.05;
    
    float height = t * pillarHeight;
    float pillarWidth = 0.18;
    float widthOffset = (uv.x - 0.5) * pillarWidth;
    float perpAngle = pillarAngle + 1.5708;
    float x = cos(pillarAngle) * pillarRadius + cos(perpAngle) * widthOffset;
    float z = sin(pillarAngle) * pillarRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 33.2);
    
    vAngle = pillarAngle;
    vRadius = pillarRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER D: TRIPLE ARCH GATE
  // ============================================
  if (tripleArchIndex >= 0.0) {
    // 3 arches with rotation sync tilt
    float archIdx = tripleArchIndex;
    float archRadius = 4.5 + archIdx * 0.5; // 4.5 to 5.5
    float angle = uv.x * 6.28318;
    
    // RotationSync → tilt
    float archTilt = uRotationSync * 0.15;
    angle += archTilt;
    
    float radius = archRadius;
    float archThickness = 0.3;
    radius += (uv.y - 0.5) * archThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 3.0 + archIdx * 0.4;
    
    pos = vec3(x, y, z - 33.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = archIdx / 3.0;
  }
  
  // ============================================
  // LAYER E: DIVINE SPIRAL HALO
  // ============================================
  if (spiralHaloIndex >= 0.0) {
    // 2–3 rotating spiral rings
    float haloIdx = spiralHaloIndex;
    float haloRadius = 5.0 + haloIdx * 0.8; // 5.0 to 6.6
    float angle = uv.x * 6.28318;
    
    float radius = haloRadius;
    float haloThickness = 0.2;
    radius += (uv.y - 0.5) * haloThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 1.5 + haloIdx * 0.3;
    
    pos = vec3(x, y, z - 33.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = haloIdx / 3.0;
  }
  
  // ============================================
  // LAYER F: TEMPLE GLYPH BAND
  // ============================================
  if (glyphBandIndex >= 0.0) {
    // 90–120 glyphs around perimeter
    float numGlyphs = 120.0;
    float glyphAngle = (glyphBandIndex / numGlyphs) * 6.28318;
    float baseRadius = 6.0;
    
    // BlessingWave → glyph flash (handled in fragment)
    
    float glyphSize = 0.22;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 33.2);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER G: ASCENSION COLUMNS
  // ============================================
  if (ascensionColumnIndex >= 0.0) {
    // 6–10 columns with height swell
    float numColumns = 10.0;
    float columnAngle = (ascensionColumnIndex / numColumns) * 6.28318;
    float columnRadius = 5.0;
    float columnHeight = 9.0;
    float t = uv.y; // 0 to 1 along column
    
    // Height swell
    float heightSwell = sin(t * 3.14159) * 0.3;
    float height = t * columnHeight + heightSwell;
    
    float columnWidth = 0.16;
    float widthOffset = (uv.x - 0.5) * columnWidth;
    float perpAngle = columnAngle + 1.5708;
    float x = cos(columnAngle) * columnRadius + cos(perpAngle) * widthOffset;
    float z = sin(columnAngle) * columnRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 33.2);
    
    vAngle = columnAngle;
    vRadius = columnRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER H: CROSS-DIMENSIONAL BRIDGES
  // ============================================
  if (crossBridgeIndex >= 0.0) {
    // 20–40 beams linking pillars
    float numBridges = 40.0;
    float bridgeIdx = crossBridgeIndex;
    float t = uv.y; // 0 to 1 along bridge
    
    float angle1 = (bridgeIdx / numBridges) * 6.28318;
    float angle2 = angle1 + 1.5708; // Perpendicular
    float radius1 = 4.0;
    float radius2 = 5.5;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    
    vec2 bridgePos = mix(pos1, pos2, t);
    
    float bridgeWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * bridgeWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    bridgePos += normal * widthOffset;
    
    pos = vec3(bridgePos.x, t * 4.0, bridgePos.y - 33.2);
    
    vRadius = length(bridgePos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER I: ORBITAL RUNNER CIRCLES
  // ============================================
  if (orbitalRunnerIndex >= 0.0) {
    // 2–4 orbit rings with high sparkle
    float numRings = 4.0;
    float ringIdx = mod(orbitalRunnerIndex, numRings);
    float ringRadius = 4.0 + ringIdx * 0.8; // 4.0 to 6.4
    float angle = uv.x * 6.28318;
    
    // High → sparkle (handled in fragment)
    
    float radius = ringRadius;
    float ringThickness = 0.15;
    radius += (uv.y - 0.5) * ringThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 2.0 + ringIdx * 0.2;
    
    pos = vec3(x, y, z - 33.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = ringIdx / numRings;
  }
  
  // ============================================
  // LAYER J: TEMPLE FLAME SHELL
  // ============================================
  if (flameShellIndex >= 0.0) {
    // fbm flame pattern around gate
    float flameWidth = 12.0;
    float flameHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * flameWidth, (uv.y - 0.5) * flameHeight);
    
    // fbm flame
    float flameDensity = fbm(xz * 0.3 + uTime * 0.2) * 0.8;
    
    float height = flameDensity * 2.5;
    xz += normalize(xz) * flameDensity * 0.3;
    
    pos = vec3(xz.x, height, xz.y - 33.2);
    
    vRadius = length(xz);
    vGradientProgress = flameDensity;
  }
  
  // ============================================
  // LAYER K: CELESTIAL FOG PLANE
  // ============================================
  if (fogPlaneIndex >= 0.0) {
    // 64×64 fog grid, breath pulse
    float fogWidth = 12.0;
    float fogHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * fogWidth, (uv.y - 0.5) * fogHeight);
    
    // fbm fog
    float fogDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Breath → pulse (handled in fragment)
    
    xz += normalize(xz) * fogDensity * 0.3;
    
    pos = vec3(xz.x, fogDensity * 0.5, xz.y - 33.2);
    
    vRadius = length(xz);
    vGradientProgress = fogDensity;
  }
  
  // ============================================
  // LAYER L: TEMPLE LIGHT SHAFTS
  // ============================================
  if (lightShaftIndex >= 0.0) {
    // 8–12 rising vertical shafts
    float numShafts = 12.0;
    float shaftAngle = (lightShaftIndex / numShafts) * 6.28318;
    float shaftHeight = 9.0;
    float t = uv.y; // 0 to 1 along shaft
    
    float height = t * shaftHeight;
    float shaftWidth = 0.18;
    float widthOffset = (uv.x - 0.5) * shaftWidth;
    float perpAngle = shaftAngle + 1.5708;
    float x = cos(shaftAngle) * 4.0 + cos(perpAngle) * widthOffset;
    float z = sin(shaftAngle) * 4.0 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 33.2);
    
    vAngle = shaftAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER M: ENERGY SPIRAL THREADS
  // ============================================
  if (energySpiralIndex >= 0.0) {
    // 8–16 spiral lines
    float numSpirals = 16.0;
    float spiralIdx = energySpiralIndex;
    float rotationSpeed = 0.7 + spiralIdx * 0.1;
    float t = uv.y; // 0 to 1 along spiral
    
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    float spiralWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 3.0, spiralPos.y - 33.2);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER N: DIVINE PARTICLE FIELD
  // ============================================
  if (particleFieldIndex >= 0.0) {
    // 250–400 particles
    float numParticles = 400.0;
    float angle = (particleFieldIndex / numParticles) * 6.28318 * 18.0; // 18 full rotations
    float baseRadius = 0.2 + (particleFieldIndex / numParticles) * 8.0; // 0.2 to 8.2
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.6;
    
    float particleRadius = 0.01;
    
    pos = vec3(x, y, z - 33.2);
    pos *= particleRadius;
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.2) / 8.0;
  }
  
  // ============================================
  // LAYER O: ASCENSION RAYS
  // ============================================
  if (ascensionRayIndex >= 0.0) {
    // 12–20 long radial rays
    float numRays = 20.0;
    float rayAngle = (ascensionRayIndex / numRays) * 6.28318;
    float rayLength = 10.0;
    float t = uv.y; // 0 to 1 along ray
    
    float length = t * rayLength;
    float x = cos(rayAngle) * length;
    float z = sin(rayAngle) * length;
    float y = 0.0;
    
    float rayWidth = 0.14;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708;
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 33.2);
    
    vAngle = rayAngle;
    vRadius = length;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER P: OUTER HALO CROWN
  // ============================================
  if (outerHaloIndex >= 0.0) {
    // Large halo rotating with rotationSync
    float haloRadius = 7.0;
    float angle = uv.x * 6.28318;
    float thickness = 0.3;
    
    // RotationSync → rotation
    float haloRotation = uRotationSync * 0.15;
    angle += haloRotation;
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 33.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 7.0) / 0.3;
  }
  
  // ============================================
  // LAYER Q: INNER TEMPLE CORE
  // ============================================
  if (innerCoreIndex >= 0.0) {
    // White-gold pulsing core
    float coreRadius = 2.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
    radius *= breathPulse;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 33.2);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER R: CELESTIAL LATTICE SHELL
  // ============================================
  if (latticeShellIndex >= 0.0) {
    // fbm lattice with drift
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
    
    pos = vec3(xz.x, latticeDensity * 0.4, xz.y - 33.2);
    
    vRadius = length(xz);
    vGradientProgress = latticeDensity;
  }
  
  // ============================================
  // LAYER S: TEMPLE STAIR RUNNERS
  // ============================================
  if (stairRunnerIndex >= 0.0) {
    // 6–12 fast streaks moving on stairs
    float numRunners = 12.0;
    float runnerIdx = stairRunnerIndex;
    float stairAngle = mod(runnerIdx, 2.0) * 3.14159; // 0 or π
    float stairRadius = 4.5;
    float t = uv.y; // 0 to 1 along runner
    
    // Fast movement
    float runnerSpeed = uTime * 2.0;
    t += runnerSpeed;
    t = mod(t, 1.0);
    
    float height = t * 9.0;
    float runnerWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * runnerWidth;
    float perpAngle = stairAngle + 1.5708;
    float x = cos(stairAngle) * stairRadius + cos(perpAngle) * widthOffset;
    float z = sin(stairAngle) * stairRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 33.2);
    
    vAngle = stairAngle;
    vRadius = stairRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER T: RADIANT MESH FIELD
  // ============================================
  if (meshFieldIndex >= 0.0) {
    // 64×64 grid with shimmer
    float meshWidth = 12.0;
    float meshHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * meshWidth, (uv.y - 0.5) * meshHeight);
    
    // Grid pattern
    float gridX = sin(xz.x * 0.5) * 0.5 + 0.5;
    float gridY = sin(xz.y * 0.5) * 0.5 + 0.5;
    float gridPattern = (gridX + gridY) * 0.5;
    
    // High → shimmer (handled in fragment)
    
    pos = vec3(xz.x, gridPattern * 0.3, xz.y - 33.2);
    
    vRadius = length(xz);
    vGradientProgress = gridPattern;
  }
  
  // ============================================
  // LAYER U: TEMPLE AURA
  // ============================================
  if (templeAuraIndex >= 0.0) {
    // Breath → opacity pulse
    float auraRadius = 6.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * auraRadius;
    
    // Breath → pulse (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 33.2);
    
    vRadius = radius;
    vGradientProgress = radius / auraRadius;
  }
  
  // ============================================
  // LAYER V: ASCENSION SPIRAL AURA
  // ============================================
  if (spiralAuraIndex >= 0.0) {
    // Rotational aura around core
    float rotationSpeed = 0.5;
    float t = uv.y; // 0 to 1 along spiral
    
    vec2 spiralPos = logarithmicSpiral(t, 0.0, rotationSpeed);
    
    float spiralWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 2.0, spiralPos.y - 33.2);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER W: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Required for E12 bloom
    float templeRadius = 6.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * templeRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 33.2);
    
    vRadius = radius;
    vGradientProgress = radius / templeRadius;
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

