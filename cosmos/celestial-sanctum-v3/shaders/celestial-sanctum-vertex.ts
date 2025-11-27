/**
 * Celestial Sanctum v3 Vertex Shader
 * 
 * Phase 2 — Section 64: CELESTIAL SANCTUM ENGINE v3
 * Celestial Sanctum Engine v3 (E68)
 * 
 * 24-layer ascended sanctum: Sanctum Base Disc, Twin Infinity Staircases, Celestial Sanctum Pillars, Triple Halo Arch Crown, Quantum Spiral Halo, Celestial Rune Band, Ascension Obelisks, Cross-Realm Beams, Orbital Sanctum Rings, Sanctum Flame Shell, Ether Fog Plane, Sanctum Light Shafts, Inner Spiral Matrix, Divine Particle Stream, Dimensional Wave Rings, Outer Sanctum Halo, Sanctum Heart Core, Celestial Lattice Veil, Ether Thread Matrix, Spiral Light Towers, Sanctum Rays, Ascension Aura Field, Reality Warp Layer, Bloom Mask Layer
 */

export const celestialSanctumVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float baseDiscIndex;
attribute float twinStaircaseIndex;
attribute float sanctumPillarIndex;
attribute float tripleHaloIndex;
attribute float quantumSpiralIndex;
attribute float runeBandIndex;
attribute float obeliskIndex;
attribute float crossBeamIndex;
attribute float orbitalRingIndex;
attribute float flameShellIndex;
attribute float etherFogIndex;
attribute float lightShaftIndex;
attribute float spiralMatrixIndex;
attribute float particleStreamIndex;
attribute float waveRingIndex;
attribute float outerHaloIndex;
attribute float heartCoreIndex;
attribute float latticeVeilIndex;
attribute float etherThreadIndex;
attribute float lightTowerIndex;
attribute float sanctumRayIndex;
attribute float auraFieldIndex;
attribute float realityWarpIndex;
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
varying float vBaseDiscIndex;
varying float vTwinStaircaseIndex;
varying float vSanctumPillarIndex;
varying float vTripleHaloIndex;
varying float vQuantumSpiralIndex;
varying float vRuneBandIndex;
varying float vObeliskIndex;
varying float vCrossBeamIndex;
varying float vOrbitalRingIndex;
varying float vFlameShellIndex;
varying float vEtherFogIndex;
varying float vLightShaftIndex;
varying float vSpiralMatrixIndex;
varying float vParticleStreamIndex;
varying float vWaveRingIndex;
varying float vOuterHaloIndex;
varying float vHeartCoreIndex;
varying float vLatticeVeilIndex;
varying float vEtherThreadIndex;
varying float vLightTowerIndex;
varying float vSanctumRayIndex;
varying float vAuraFieldIndex;
varying float vRealityWarpIndex;
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
  vBaseDiscIndex = baseDiscIndex;
  vTwinStaircaseIndex = twinStaircaseIndex;
  vSanctumPillarIndex = sanctumPillarIndex;
  vTripleHaloIndex = tripleHaloIndex;
  vQuantumSpiralIndex = quantumSpiralIndex;
  vRuneBandIndex = runeBandIndex;
  vObeliskIndex = obeliskIndex;
  vCrossBeamIndex = crossBeamIndex;
  vOrbitalRingIndex = orbitalRingIndex;
  vFlameShellIndex = flameShellIndex;
  vEtherFogIndex = etherFogIndex;
  vLightShaftIndex = lightShaftIndex;
  vSpiralMatrixIndex = spiralMatrixIndex;
  vParticleStreamIndex = particleStreamIndex;
  vWaveRingIndex = waveRingIndex;
  vOuterHaloIndex = outerHaloIndex;
  vHeartCoreIndex = heartCoreIndex;
  vLatticeVeilIndex = latticeVeilIndex;
  vEtherThreadIndex = etherThreadIndex;
  vLightTowerIndex = lightTowerIndex;
  vSanctumRayIndex = sanctumRayIndex;
  vAuraFieldIndex = auraFieldIndex;
  vRealityWarpIndex = realityWarpIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: SANCTUM BASE DISC
  // ============================================
  if (baseDiscIndex >= 0.0) {
    float sanctumRadius = 6.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * sanctumRadius;
    
    // Scroll → rotation
    float scrollRotation = uScroll * 0.6;
    angle += scrollRotation;
    
    // Breath → pulsation
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathPulse;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 36.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / sanctumRadius;
  }
  
  // ============================================
  // LAYER B: TWIN INFINITY STAIRCASES
  // ============================================
  if (twinStaircaseIndex >= 0.0) {
    float stairIdx = twinStaircaseIndex;
    float stairAngle = stairIdx * 3.14159; // 0 or π
    float stairRadius = 4.8;
    float stairHeight = 10.0;
    float t = uv.y; // 0 to 1 along staircase
    
    // Scroll → climb motion
    float scrollClimb = uScroll * 0.4;
    t += scrollClimb;
    t = mod(t, 1.0);
    
    float height = t * stairHeight;
    float stairWidth = 0.28;
    float widthOffset = (uv.x - 0.5) * stairWidth;
    float perpAngle = stairAngle + 1.5708;
    float x = cos(stairAngle) * stairRadius + cos(perpAngle) * widthOffset;
    float z = sin(stairAngle) * stairRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 36.4);
    
    vAngle = stairAngle;
    vRadius = stairRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: CELESTIAL SANCTUM PILLARS
  // ============================================
  if (sanctumPillarIndex >= 0.0) {
    float numPillars = 12.0;
    float pillarAngle = (sanctumPillarIndex / numPillars) * 6.28318;
    float pillarRadius = 5.8;
    float pillarHeight = 9.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + sanctumPillarIndex * 2.0) * uBass * 0.02;
    pillarAngle += bassWobble;
    pillarRadius += bassWobble * 0.05;
    
    float height = t * pillarHeight;
    float pillarWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * pillarWidth;
    float perpAngle = pillarAngle + 1.5708;
    float x = cos(pillarAngle) * pillarRadius + cos(perpAngle) * widthOffset;
    float z = sin(pillarAngle) * pillarRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 36.4);
    
    vAngle = pillarAngle;
    vRadius = pillarRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER D: TRIPLE HALO ARCH CROWN
  // ============================================
  if (tripleHaloIndex >= 0.0) {
    float haloIdx = tripleHaloIndex;
    float haloRadius = 5.0 + haloIdx * 0.6; // 5.0 to 6.2
    float angle = uv.x * 6.28318;
    
    // RotationSync → tilt
    float haloTilt = uRotationSync * 0.15;
    angle += haloTilt;
    
    float radius = haloRadius;
    float haloThickness = 0.3;
    radius += (uv.y - 0.5) * haloThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 3.5 + haloIdx * 0.5;
    
    pos = vec3(x, y, z - 36.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = haloIdx / 3.0;
  }
  
  // ============================================
  // LAYER E: QUANTUM SPIRAL HALO
  // ============================================
  if (quantumSpiralIndex >= 0.0) {
    float spiralIdx = quantumSpiralIndex;
    float rotationSpeed = 0.6 + spiralIdx * 0.2;
    float t = uv.y; // 0 to 1 along spiral
    
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    float spiralWidth = 0.14;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 4.0, spiralPos.y - 36.4);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER F: CELESTIAL RUNE BAND
  // ============================================
  if (runeBandIndex >= 0.0) {
    float numRunes = 120.0;
    float runeAngle = (runeBandIndex / numRunes) * 6.28318;
    float baseRadius = 6.2;
    
    // BlessingWave → rune flash (handled in fragment)
    
    float runeSize = 0.24;
    float quadSize = runeSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float runeX = cos(runeAngle) * baseRadius;
    float runeZ = sin(runeAngle) * baseRadius;
    
    pos = vec3(runeX + x, y, runeZ - 36.4);
    
    vAngle = runeAngle;
    vRadius = baseRadius;
    vGradientProgress = runeSize;
  }
  
  // ============================================
  // LAYER G: ASCENSION OBELISKS
  // ============================================
  if (obeliskIndex >= 0.0) {
    float numObelisks = 10.0;
    float obeliskAngle = (obeliskIndex / numObelisks) * 6.28318;
    float obeliskRadius = 5.2;
    float obeliskHeight = 10.0;
    float t = uv.y; // 0 to 1 along obelisk
    
    float height = t * obeliskHeight;
    float obeliskWidth = 0.18;
    float widthOffset = (uv.x - 0.5) * obeliskWidth;
    float perpAngle = obeliskAngle + 1.5708;
    float x = cos(obeliskAngle) * obeliskRadius + cos(perpAngle) * widthOffset;
    float z = sin(obeliskAngle) * obeliskRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 36.4);
    
    vAngle = obeliskAngle;
    vRadius = obeliskRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER H: CROSS-REALM BEAMS
  // ============================================
  if (crossBeamIndex >= 0.0) {
    float numBeams = 40.0;
    float beamIdx = crossBeamIndex;
    float t = uv.y; // 0 to 1 along beam
    
    float angle1 = (beamIdx / numBeams) * 6.28318;
    float angle2 = angle1 + 1.5708; // Perpendicular
    float radius1 = 4.2;
    float radius2 = 6.0;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    
    vec2 beamPos = mix(pos1, pos2, t);
    
    float beamWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * beamWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    beamPos += normal * widthOffset;
    
    pos = vec3(beamPos.x, t * 4.5, beamPos.y - 36.4);
    
    vRadius = length(beamPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER I: ORBITAL SANCTUM RINGS
  // ============================================
  if (orbitalRingIndex >= 0.0) {
    float numRings = 4.0;
    float ringIdx = mod(orbitalRingIndex, numRings);
    float ringRadius = 4.5 + ringIdx * 0.9; // 4.5 to 7.2
    float angle = uv.x * 6.28318;
    
    // High → sparkle (handled in fragment)
    
    float radius = ringRadius;
    float ringThickness = 0.18;
    radius += (uv.y - 0.5) * ringThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 2.5 + ringIdx * 0.25;
    
    pos = vec3(x, y, z - 36.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = ringIdx / numRings;
  }
  
  // ============================================
  // LAYER J: SANCTUM FLAME SHELL
  // ============================================
  if (flameShellIndex >= 0.0) {
    float flameWidth = 13.0;
    float flameHeight = 13.0;
    
    vec2 xz = vec2((uv.x - 0.5) * flameWidth, (uv.y - 0.5) * flameHeight);
    
    // fbm flame
    float flameDensity = fbm(xz * 0.3 + uTime * 0.2) * 0.8;
    
    float height = flameDensity * 2.8;
    xz += normalize(xz) * flameDensity * 0.3;
    
    pos = vec3(xz.x, height, xz.y - 36.4);
    
    vRadius = length(xz);
    vGradientProgress = flameDensity;
  }
  
  // ============================================
  // LAYER K: ETHER FOG PLANE
  // ============================================
  if (etherFogIndex >= 0.0) {
    float fogWidth = 13.0;
    float fogHeight = 13.0;
    
    vec2 xz = vec2((uv.x - 0.5) * fogWidth, (uv.y - 0.5) * fogHeight);
    
    // fbm fog
    float fogDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Breath → pulse (handled in fragment)
    
    xz += normalize(xz) * fogDensity * 0.3;
    
    pos = vec3(xz.x, fogDensity * 0.6, xz.y - 36.4);
    
    vRadius = length(xz);
    vGradientProgress = fogDensity;
  }
  
  // ============================================
  // LAYER L: SANCTUM LIGHT SHAFTS
  // ============================================
  if (lightShaftIndex >= 0.0) {
    float numShafts = 12.0;
    float shaftAngle = (lightShaftIndex / numShafts) * 6.28318;
    float shaftHeight = 10.0;
    float t = uv.y; // 0 to 1 along shaft
    
    float height = t * shaftHeight;
    float shaftWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * shaftWidth;
    float perpAngle = shaftAngle + 1.5708;
    float x = cos(shaftAngle) * 4.5 + cos(perpAngle) * widthOffset;
    float z = sin(shaftAngle) * 4.5 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 36.4);
    
    vAngle = shaftAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER M: INNER SPIRAL MATRIX
  // ============================================
  if (spiralMatrixIndex >= 0.0) {
    float numSpirals = 18.0;
    float spiralIdx = spiralMatrixIndex;
    float rotationSpeed = 0.65 + spiralIdx * 0.08;
    float t = uv.y; // 0 to 1 along spiral
    
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    float spiralWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 3.5, spiralPos.y - 36.4);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER N: DIVINE PARTICLE STREAM
  // ============================================
  if (particleStreamIndex >= 0.0) {
    float numParticles = 400.0;
    float angle = (particleStreamIndex / numParticles) * 6.28318 * 20.0; // 20 full rotations
    float baseRadius = 0.15 + (particleStreamIndex / numParticles) * 8.5; // 0.15 to 8.65
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.7;
    
    float particleRadius = 0.01;
    
    pos = vec3(x, y, z - 36.4);
    pos *= particleRadius;
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.15) / 8.5;
  }
  
  // ============================================
  // LAYER O: DIMENSIONAL WAVE RINGS
  // ============================================
  if (waveRingIndex >= 0.0) {
    float numWaves = 12.0;
    float waveIdx = waveRingIndex;
    float baseRadius = 2.5 + (waveIdx / numWaves) * 5.0; // 2.5 to 7.5
    float angle = uv.x * 6.28318;
    float thickness = 0.22;
    
    // Mid → turbulence jitter
    float midJitter = sin(uTime * 4.0 + waveIdx * 2.0) * uMid * 0.02;
    baseRadius += midJitter;
    
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 36.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 2.5) / 5.0;
  }
  
  // ============================================
  // LAYER P: OUTER SANCTUM HALO
  // ============================================
  if (outerHaloIndex >= 0.0) {
    float haloRadius = 7.5;
    float angle = uv.x * 6.28318;
    float thickness = 0.35;
    
    // RotationSync → rotation
    float haloRotation = uRotationSync * 0.15;
    angle += haloRotation;
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 36.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 7.5) / 0.35;
  }
  
  // ============================================
  // LAYER Q: SANCTUM HEART CORE
  // ============================================
  if (heartCoreIndex >= 0.0) {
    float coreRadius = 2.2;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.18;
    radius *= breathPulse;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 36.4);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER R: CELESTIAL LATTICE VEIL
  // ============================================
  if (latticeVeilIndex >= 0.0) {
    float latticeWidth = 13.0;
    float latticeHeight = 13.0;
    
    vec2 xz = vec2((uv.x - 0.5) * latticeWidth, (uv.y - 0.5) * latticeHeight);
    
    // fbm lattice
    float latticeDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Scroll → drift
    float scrollDrift = uScroll * 0.3;
    xz += normalize(xz) * scrollDrift * 0.2;
    latticeDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    xz += normalize(xz) * latticeDensity * 0.3;
    
    pos = vec3(xz.x, latticeDensity * 0.5, xz.y - 36.4);
    
    vRadius = length(xz);
    vGradientProgress = latticeDensity;
  }
  
  // ============================================
  // LAYER S: ETHER THREAD MATRIX
  // ============================================
  if (etherThreadIndex >= 0.0) {
    float numThreads = 45.0;
    float threadIdx = etherThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 1.25664; // 72 degrees
    float radius1 = 3.5;
    float radius2 = 6.5;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    
    vec2 threadPos = mix(pos1, pos2, t);
    
    // Breath → thickness pulse (handled in fragment)
    
    float threadWidth = 0.11;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 2.5, threadPos.y - 36.4);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER T: SPIRAL LIGHT TOWERS
  // ============================================
  if (lightTowerIndex >= 0.0) {
    float numTowers = 8.0;
    float towerAngle = (lightTowerIndex / numTowers) * 6.28318;
    float towerRadius = 5.0;
    float towerHeight = 11.0;
    float t = uv.y; // 0 to 1 along tower
    
    float height = t * towerHeight;
    float towerWidth = 0.22;
    float widthOffset = (uv.x - 0.5) * towerWidth;
    float perpAngle = towerAngle + 1.5708;
    float x = cos(towerAngle) * towerRadius + cos(perpAngle) * widthOffset;
    float z = sin(towerAngle) * towerRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 36.4);
    
    vAngle = towerAngle;
    vRadius = towerRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER U: SANCTUM RAYS
  // ============================================
  if (sanctumRayIndex >= 0.0) {
    float numRays = 24.0;
    float rayAngle = (sanctumRayIndex / numRays) * 6.28318;
    float rayLength = 11.0;
    float t = uv.y; // 0 to 1 along ray
    
    float length = t * rayLength;
    float x = cos(rayAngle) * length;
    float z = sin(rayAngle) * length;
    float y = 0.0;
    
    float rayWidth = 0.16;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708;
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 36.4);
    
    vAngle = rayAngle;
    vRadius = length;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER V: ASCENSION AURA FIELD
  // ============================================
  if (auraFieldIndex >= 0.0) {
    float auraRadius = 7.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * auraRadius;
    
    // Breath → pulse (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 36.4);
    
    vRadius = radius;
    vGradientProgress = radius / auraRadius;
  }
  
  // ============================================
  // LAYER W: REALITY WARP LAYER
  // ============================================
  if (realityWarpIndex >= 0.0) {
    float warpWidth = 13.0;
    float warpHeight = 13.0;
    
    vec2 xz = vec2((uv.x - 0.5) * warpWidth, (uv.y - 0.5) * warpHeight);
    
    // fbm warp distortion
    float warpDensity = fbm(xz * 0.25 + uTime * 0.18) * 0.8;
    
    // Scroll → warp drift
    float scrollWarp = uScroll * 0.35;
    xz += normalize(xz) * scrollWarp * 0.25;
    warpDensity = fbm(xz * 0.25 + uTime * 0.18) * 0.8;
    
    xz += normalize(xz) * warpDensity * 0.4;
    
    pos = vec3(xz.x, warpDensity * 0.6, xz.y - 36.4);
    
    vRadius = length(xz);
    vGradientProgress = warpDensity;
  }
  
  // ============================================
  // LAYER X: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    float sanctumRadius = 6.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * sanctumRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 36.4);
    
    vRadius = radius;
    vGradientProgress = radius / sanctumRadius;
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

