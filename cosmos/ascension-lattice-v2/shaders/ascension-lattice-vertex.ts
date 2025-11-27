/**
 * Ascension Lattice v2 Vertex Shader
 * 
 * Phase 2 — Section 61: ASCENSION LATTICE ENGINE v2
 * Ascension Lattice Engine v2 (E65)
 * 
 * 18-layer hyper-lattice ascension: Base Lattice Plane, Diamond Lattice Web, Hexa Nexus Rings, Ascension Riser Columns, Luminous Cross-Beams, Interlace Threads, Orbital Ascension Rings, Triple Spiral Matrix, Ascension Wave Rings, Prism Nodes, Vertical Light Shafts, Radiant Energy Mesh, Outer Lattice Halo, Ascension Glyph Band, Dimensional Fog Layer, Ascension Light Rays, Lattice Dust Field, Bloom Mask Layer
 */

export const ascensionLatticeVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float baseLatticeIndex;
attribute float diamondWebIndex;
attribute float hexaNexusIndex;
attribute float riserColumnIndex;
attribute float crossBeamIndex;
attribute float interlaceThreadIndex;
attribute float orbitalRingIndex;
attribute float tripleSpiralIndex;
attribute float waveRingIndex;
attribute float prismNodeIndex;
attribute float lightShaftIndex;
attribute float energyMeshIndex;
attribute float outerHaloIndex;
attribute float glyphBandIndex;
attribute float fogLayerIndex;
attribute float lightRayIndex;
attribute float dustFieldIndex;
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
varying float vBaseLatticeIndex;
varying float vDiamondWebIndex;
varying float vHexaNexusIndex;
varying float vRiserColumnIndex;
varying float vCrossBeamIndex;
varying float vInterlaceThreadIndex;
varying float vOrbitalRingIndex;
varying float vTripleSpiralIndex;
varying float vWaveRingIndex;
varying float vPrismNodeIndex;
varying float vLightShaftIndex;
varying float vEnergyMeshIndex;
varying float vOuterHaloIndex;
varying float vGlyphBandIndex;
varying float vFogLayerIndex;
varying float vLightRayIndex;
varying float vDustFieldIndex;
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
  // Logarithmic spiral curve
  float angle = t * 6.28318 * 4.0 * rotationSpeed; // 4 full rotations, variable speed
  float baseRadius = 0.3;
  float maxRadius = 7.0;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBaseLatticeIndex = baseLatticeIndex;
  vDiamondWebIndex = diamondWebIndex;
  vHexaNexusIndex = hexaNexusIndex;
  vRiserColumnIndex = riserColumnIndex;
  vCrossBeamIndex = crossBeamIndex;
  vInterlaceThreadIndex = interlaceThreadIndex;
  vOrbitalRingIndex = orbitalRingIndex;
  vTripleSpiralIndex = tripleSpiralIndex;
  vWaveRingIndex = waveRingIndex;
  vPrismNodeIndex = prismNodeIndex;
  vLightShaftIndex = lightShaftIndex;
  vEnergyMeshIndex = energyMeshIndex;
  vOuterHaloIndex = outerHaloIndex;
  vGlyphBandIndex = glyphBandIndex;
  vFogLayerIndex = fogLayerIndex;
  vLightRayIndex = lightRayIndex;
  vDustFieldIndex = dustFieldIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: BASE LATTICE PLANE
  // ============================================
  if (baseLatticeIndex >= 0.0) {
    // 64×64 grid, radius 6.0
    float latticeRadius = 6.0;
    float angle = uv.x * 6.28318; // 0 to 2π
    float radius = uv.y * latticeRadius; // 0 to latticeRadius
    
    // Breath → pulsating lattice expansion
    float breathExpansion = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathExpansion;
    
    // High → shimmer noise (handled in fragment)
    
    // Scroll → rotation acceleration
    float scrollRotation = uScroll * 0.5;
    angle += scrollRotation;
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / latticeRadius;
  }
  
  // ============================================
  // LAYER B: DIAMOND LATTICE WEB
  // ============================================
  if (diamondWebIndex >= 0.0) {
    // 8×8 interconnected diamond cells
    float cellSize = 1.5;
    float cellX = mod(diamondWebIndex, 8.0);
    float cellY = floor(diamondWebIndex / 8.0);
    float x = (cellX - 3.5) * cellSize;
    float z = (cellY - 3.5) * cellSize;
    float y = 0.0;
    
    // High → sparkle jitter (handled in fragment)
    
    // BlessingWave → crystalline flash (handled in fragment)
    
    // Diamond shape (handled in fragment)
    float diamondSize = cellSize * 0.5;
    x += (uv.x - 0.5) * diamondSize * 2.0;
    z += (uv.y - 0.5) * diamondSize * 2.0;
    
    pos = vec3(x, y, z - 27.0);
    
    vRadius = length(vec2(x, z));
    vGradientProgress = (cellX + cellY) / 14.0;
  }
  
  // ============================================
  // LAYER C: HEXA NEXUS RINGS
  // ============================================
  if (hexaNexusIndex >= 0.0) {
    // 3–5 hex rings
    float numRings = 5.0;
    float ringIdx = hexaNexusIndex;
    float hexRadius = 2.0 + ringIdx * 1.0; // 2.0 to 6.0
    float angle = uv.x * 6.28318;
    
    // RotationSync → hex tilt
    float hexTilt = uRotationSync * 0.15;
    angle += hexTilt;
    
    // Breath → radius modulation
    float breathRadius = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.1;
    hexRadius *= breathRadius;
    
    float radius = hexRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = ringIdx / numRings;
  }
  
  // ============================================
  // LAYER D: ASCENSION RISER COLUMNS
  // ============================================
  if (riserColumnIndex >= 0.0) {
    // 12–20 vertical columns
    float numColumns = 20.0;
    float columnAngle = (riserColumnIndex / numColumns) * 6.28318;
    float columnRadius = 5.0;
    float columnHeight = 6.0;
    float t = uv.y; // 0 to 1 along column
    
    // Scroll → upward movement
    float scrollRise = uScroll * 0.4;
    float y = t * columnHeight + scrollRise * 2.0;
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + riserColumnIndex * 2.0) * uBass * 0.02;
    columnAngle += bassWobble;
    columnRadius += bassWobble * 0.05;
    
    // Column geometry
    float radius = columnRadius;
    float x = cos(columnAngle) * radius;
    float z = sin(columnAngle) * radius;
    
    // Column width
    float columnWidth = 0.15;
    float widthOffset = (uv.x - 0.5) * columnWidth;
    float perpAngle = columnAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = columnAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER E: LUMINOUS CROSS-BEAMS
  // ============================================
  if (crossBeamIndex >= 0.0) {
    // 24–40 horizontal beams
    float numBeams = 40.0;
    float beamAngle = (crossBeamIndex / numBeams) * 6.28318;
    float beamRadius = 5.5;
    float beamLength = 1.0;
    float t = uv.y; // 0 to 1 along beam
    
    // High → beam shimmer (handled in fragment)
    
    // Breath → width modulation
    float breathWidth = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
    
    float radius = beamRadius;
    float x = cos(beamAngle) * radius;
    float z = sin(beamAngle) * radius;
    float y = 2.0;
    
    // Beam width
    float beamWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * beamWidth * breathWidth;
    float perpAngle = beamAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = beamAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER F: INTERLACE THREADS
  // ============================================
  if (interlaceThreadIndex >= 0.0) {
    // 30–50 threads weaving lattice
    float numThreads = 50.0;
    float threadIdx = interlaceThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    // Connect between lattice points
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 3.14159; // Opposite side
    float radius1 = 4.0;
    float radius2 = 5.5;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    vec2 threadPos = mix(pos1, pos2, t);
    
    // Scroll → travel speed increase
    float scrollSpeed = uScroll * 0.4;
    t += scrollSpeed;
    t = mod(t, 1.0);
    threadPos = mix(pos1, pos2, t);
    
    // Thread width
    float threadWidth = 0.06;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 3.0, threadPos.y - 27.0);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER G: ORBITAL ASCENSION RINGS
  // ============================================
  if (orbitalRingIndex >= 0.0) {
    // 2–4 rotating rings
    float numRings = 4.0;
    float ringIdx = mod(orbitalRingIndex, numRings);
    float ringRadius = 3.5 + ringIdx * 1.0; // 3.5 to 6.5
    float angle = uv.x * 6.28318;
    float thickness = 0.2;
    
    // RotationSync → synchronized tilt
    float ringTilt = uRotationSync * 0.15;
    angle += ringTilt;
    
    // High → sparkle (handled in fragment)
    
    float radius = ringRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 1.0 + ringIdx * 0.5;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = ringIdx / numRings;
  }
  
  // ============================================
  // LAYER H: TRIPLE SPIRAL MATRIX
  // ============================================
  if (tripleSpiralIndex >= 0.0) {
    // 3 spirals intertwined
    float spiralIdx = tripleSpiralIndex;
    float rotationSpeed = 0.8 + spiralIdx * 0.2; // 0.8, 1.0, 1.2
    float t = uv.y; // 0 to 1 along spiral
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    // Scroll → spiral speed
    float scrollSpeed = uScroll * 0.4;
    t += scrollSpeed;
    t = mod(t, 1.0);
    spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    // Breath → spiral thickness pulse (handled in fragment)
    
    // Spiral width
    float spiralWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 2.0, spiralPos.y - 27.0);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER I: ASCENSION WAVE RINGS
  // ============================================
  if (waveRingIndex >= 0.0) {
    // 6–12 expanding ripple rings
    float numWaves = 12.0;
    float waveIdx = waveRingIndex;
    float baseRadius = 1.0 + (waveIdx / numWaves) * 6.0; // 1.0 to 7.0
    float angle = uv.x * 6.28318;
    float thickness = 0.2;
    
    // Mid → turbulence jitter
    float midJitter = sin(uTime * 4.0 + waveIdx * 2.0) * uMid * 0.02;
    baseRadius += midJitter;
    
    // BlessingWave → highlight flare (handled in fragment)
    
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 1.0) / 6.0;
  }
  
  // ============================================
  // LAYER J: PRISM NODES
  // ============================================
  if (prismNodeIndex >= 0.0) {
    // 60–120 glowing nodes
    float numNodes = 120.0;
    float nodeAngle = (prismNodeIndex / numNodes) * 6.28318;
    float baseRadius = 4.5;
    
    // High → crystal sparkle (handled in fragment)
    
    // Bass → node jitter
    float bassJitter = sin(uTime * 3.0 + prismNodeIndex * 2.0) * uBass * 0.02;
    nodeAngle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // Node size
    float nodeSize = 0.18;
    float quadSize = nodeSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position node at radius
    float nodeX = cos(nodeAngle) * baseRadius;
    float nodeZ = sin(nodeAngle) * baseRadius;
    
    pos = vec3(nodeX + x, y, nodeZ - 27.0);
    
    vAngle = nodeAngle;
    vRadius = baseRadius;
    vGradientProgress = nodeSize;
  }
  
  // ============================================
  // LAYER K: VERTICAL LIGHT SHAFTS
  // ============================================
  if (lightShaftIndex >= 0.0) {
    // 8–14 shafts
    float numShafts = 14.0;
    float shaftAngle = (lightShaftIndex / numShafts) * 6.28318;
    float shaftHeight = 7.0;
    float t = uv.y; // 0 to 1 along shaft
    
    // Breath → beam strength (handled in fragment)
    
    // BlessingWave → white-violet flash (handled in fragment)
    
    float height = t * shaftHeight;
    float shaftWidth = 0.14;
    float widthOffset = (uv.x - 0.5) * shaftWidth;
    float perpAngle = shaftAngle + 1.5708; // Perpendicular
    float x = cos(shaftAngle) * 4.0 + cos(perpAngle) * widthOffset;
    float z = sin(shaftAngle) * 4.0 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 27.0);
    
    vAngle = shaftAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER L: RADIANT ENERGY MESH
  // ============================================
  if (energyMeshIndex >= 0.0) {
    // fbm field projected across lattice
    float meshWidth = 12.0;
    float meshHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * meshWidth, (uv.y - 0.5) * meshHeight);
    
    // fbm energy
    float energyDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Scroll → distortion drift
    float scrollDrift = uScroll * 0.3;
    xz += normalize(xz) * scrollDrift * 0.2;
    energyDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Apply energy displacement
    xz += normalize(xz) * energyDensity * 0.3;
    
    pos = vec3(xz.x, energyDensity * 0.4, xz.y - 27.0);
    
    vRadius = length(xz);
    vGradientProgress = energyDensity;
  }
  
  // ============================================
  // LAYER M: OUTER LATTICE HALO
  // ============================================
  if (outerHaloIndex >= 0.0) {
    // Large halo ring around lattice
    float haloRadius = 6.5;
    float angle = uv.x * 6.28318;
    float thickness = 0.3;
    
    // RotationSync → tilt
    float haloTilt = uRotationSync * 0.15;
    angle += haloTilt;
    
    // High → halo shimmer (handled in fragment)
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 6.5) / 0.3;
  }
  
  // ============================================
  // LAYER N: ASCENSION GLYPH BAND
  // ============================================
  if (glyphBandIndex >= 0.0) {
    // 64–96 glyphs around perimeter
    float numGlyphs = 96.0;
    float glyphAngle = (glyphBandIndex / numGlyphs) * 6.28318;
    float baseRadius = 6.0;
    
    // BlessingWave → glyph flash (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.2;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 27.0);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER O: DIMENSIONAL FOG LAYER
  // ============================================
  if (fogLayerIndex >= 0.0) {
    // 64×64 fog grid
    float fogWidth = 12.0;
    float fogHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * fogWidth, (uv.y - 0.5) * fogHeight);
    
    // fbm fog
    float fogDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Breath → opacity pulse (handled in fragment)
    
    // Apply fog displacement
    xz += normalize(xz) * fogDensity * 0.3;
    
    pos = vec3(xz.x, fogDensity * 0.4, xz.y - 27.0);
    
    vRadius = length(xz);
    vGradientProgress = fogDensity;
  }
  
  // ============================================
  // LAYER P: ASCENSION LIGHT RAYS
  // ============================================
  if (lightRayIndex >= 0.0) {
    // 16–24 rays projecting outward
    float numRays = 24.0;
    float rayAngle = (lightRayIndex / numRays) * 6.28318;
    float rayLength = 8.0;
    float t = uv.y; // 0 to 1 along ray
    
    // Scroll → rotation acceleration
    float scrollRotation = uScroll * 0.5;
    rayAngle += scrollRotation;
    
    float length = t * rayLength;
    float x = cos(rayAngle) * length;
    float z = sin(rayAngle) * length;
    float y = 0.0;
    
    // Ray width
    float rayWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 27.0);
    
    vAngle = rayAngle;
    vRadius = length;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER Q: LATTICE DUST FIELD
  // ============================================
  if (dustFieldIndex >= 0.0) {
    // 300–450 particles
    float numParticles = 450.0;
    float angle = (dustFieldIndex / numParticles) * 6.28318 * 10.0; // 10 full rotations
    float baseRadius = 0.5 + (dustFieldIndex / numParticles) * 7.5; // 0.5 to 8.0
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + dustFieldIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.3; // Slight vertical variation
    
    // Particle radius
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 27.0);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.5) / 7.5;
  }
  
  // ============================================
  // LAYER R: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Strong bloom around lattice center
    float latticeRadius = 6.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * latticeRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 27.0);
    
    vRadius = radius;
    vGradientProgress = radius / latticeRadius;
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




