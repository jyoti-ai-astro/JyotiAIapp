/**
 * Astral Thread v2 Vertex Shader
 * 
 * Phase 2 — Section 54: ASTRAL THREAD ENGINE v2
 * Astral Thread Engine v2 (E58)
 * 
 * 5-layer quantum connective beam: Primary Astral Beams, Cross-Lattice Connectors, Energy Packets, Ether Strands, Quantum Dust Nodes
 */

export const astralThreadVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float beamIndex;
attribute float latticeIndex;
attribute float packetIndex;
attribute float strandIndex;
attribute float dustIndex;
attribute float beamProgress; // Progress along beam (0-1)
attribute float beamSegment; // Segment index along beam

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

// ============================================
// BEAM SPLINE FUNCTION (center → radial points)
// ============================================
vec3 beamSplinePosition(float t, float beamIdx) {
  // 6-12 long beams connecting radial points
  // Center to radial point
  float numBeams = 12.0;
  float angle = (beamIdx / numBeams) * 6.28318; // 0 to 2π
  
  // Radial distance
  float baseRadius = 2.0;
  float maxRadius = 8.0;
  float radius = baseRadius + t * (maxRadius - baseRadius);
  
  // Curved hybrid spline (straight + curved)
  float curveAmount = sin(t * 3.14159) * 0.3; // Slight curve
  float x = cos(angle + curveAmount) * radius;
  float z = sin(angle + curveAmount) * radius;
  float y = sin(t * 3.14159 * 2.0) * 0.2; // Vertical variation
  
  return vec3(x, y, z);
}

void main() {
  vUv = uv;
  vBeamIndex = beamIndex;
  vLatticeIndex = latticeIndex;
  vPacketIndex = packetIndex;
  vStrandIndex = strandIndex;
  vDustIndex = dustIndex;
  vBeamProgress = beamProgress;
  vBeamSegment = beamSegment;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY ASTRAL BEAMS
  // ============================================
  if (beamIndex >= 0.0) {
    // 6-12 long beams connecting radial points
    // Geometry: straight + curved hybrid spline beams
    
    float t = beamProgress; // 0 to 1 along beam
    float beamIdx = beamIndex;
    
    // Sample beam spline position
    vec3 beamPos = beamSplinePosition(t, beamIdx);
    
    // Scroll → beam progression parameter
    float scrollProgression = uScroll * 0.35;
    t += scrollProgression;
    t = mod(t, 1.0); // Loop
    
    // Recalculate with scroll
    beamPos = beamSplinePosition(t, beamIdx);
    
    // Breath → beam width modulation (handled in fragment)
    
    // High → shimmer streaks (handled in fragment)
    
    // Convert beam to thin quad
    float beamWidth = 0.06; // Beam width (mobile: 0.04)
    float widthOffset = (uv.x - 0.5) * beamWidth;
    
    // Calculate tangent for perpendicular offset
    float tNext = t + 0.01;
    if (tNext > 1.0) tNext = 0.0;
    vec3 beamNext = beamSplinePosition(tNext, beamIdx);
    vec3 tangent = normalize(beamNext - beamPos);
    vec3 normal = normalize(cross(tangent, vec3(0, 1, 0)));
    
    // Offset position perpendicular to beam
    pos = beamPos + normal * widthOffset;
    pos.z -= 6.4; // Position in scene
    
    vBeamDistance = t;
    vGradientProgress = t;
    vRadius = length(beamPos.xz);
  }
  
  // ============================================
  // LAYER B: CROSS-LATTICE CONNECTORS
  // ============================================
  if (latticeIndex >= 0.0) {
    // 24-40 thin criss-cross links between beams
    
    float latticeIdx = latticeIndex;
    float numLattice = 40.0;
    
    // Connect between beams
    float beam1Idx = mod(latticeIdx, 12.0);
    float beam2Idx = mod(latticeIdx * 1.618, 12.0); // Golden ratio spacing
    float t = uv.y; // 0 to 1 along connector
    
    vec3 pos1 = beamSplinePosition(0.5, beam1Idx); // Midpoint of beam1
    vec3 pos2 = beamSplinePosition(0.5, beam2Idx); // Midpoint of beam2
    
    // Interpolate between beams
    vec3 latticePos = mix(pos1, pos2, t);
    
    // Breath → subtle expansion (handled in fragment)
    
    // Mid → turbulence jitter (handled in fragment)
    
    // High → micro-glitter (handled in fragment)
    
    // Thin connector width
    float connectorWidth = 0.03;
    float widthOffset = (uv.x - 0.5) * connectorWidth;
    
    vec3 direction = normalize(pos2 - pos1);
    vec3 normal = normalize(cross(direction, vec3(0, 1, 0)));
    
    pos = latticePos + normal * widthOffset;
    pos.z -= 6.4; // Position in scene
    
    vBeamDistance = t;
    vGradientProgress = t;
    vRadius = length(latticePos.xz);
  }
  
  // ============================================
  // LAYER C: ENERGY PACKETS
  // ============================================
  if (packetIndex >= 0.0) {
    // 12-20 packets traveling along beams
    // Travel speed = uScroll * 0.45 + 0.1
    
    float packetIdx = packetIndex;
    float numPackets = 20.0;
    float beamIdx = mod(packetIdx, 12.0); // Which beam (0-11)
    
    // Packet position along beam (traveling)
    float baseT = packetIdx / numPackets;
    float travelSpeed = uScroll * 0.45 + 0.1; // Scroll-driven + base speed
    float t = mod(baseT + uTime * travelSpeed, 1.0);
    
    // Sample beam position
    vec3 beamPos = beamSplinePosition(t, beamIdx);
    
    // Bass → packet flicker (handled in fragment)
    
    // High → sparkle noise (handled in fragment)
    
    // Breath → packet size pulse
    float breathPulse = 1.0 + uBreathStrength * 0.12;
    
    // Packet size
    float packetSize = 0.22 * breathPulse;
    float packetRadius = packetSize * 0.5;
    
    // Convert to quad
    float quadSize = packetRadius;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    pos = beamPos + vec3(x, y, 0);
    pos.z -= 6.4; // Position in scene
    
    vBeamDistance = t;
    vGradientProgress = breathPulse;
    vRadius = length(beamPos.xz);
  }
  
  // ============================================
  // LAYER D: ETHER STRANDS
  // ============================================
  if (strandIndex >= 0.0) {
    // 40-60 thin translucent strands drifting diagonally
    // fbm-based drift
    
    float strandIdx = strandIndex;
    float numStrands = 60.0;
    
    // Base position
    float baseX = (strandIdx / numStrands) * 16.0 - 8.0; // -8 to 8
    float baseZ = -6.4;
    
    // fbm-based drift
    float driftX = fbm(vec2(baseX * 0.2, uTime * 0.3)) * 2.0;
    float driftZ = fbm(vec2(baseX * 0.2 + 1.0, uTime * 0.3)) * 2.0;
    
    // Scroll → diagonal drift shift
    float scrollShift = uScroll * 0.25;
    driftX += scrollShift;
    driftZ += scrollShift;
    
    // Breath → opacity expansion (handled in fragment)
    
    // Strand length
    float strandLength = 1.5;
    float strandY = (uv.y - 0.5) * strandLength;
    
    float x = baseX + driftX;
    float z = baseZ + driftZ;
    float y = strandY;
    
    pos = vec3(x, y, z);
    
    vBeamDistance = length(vec2(driftX, driftZ)) / 4.0;
    vGradientProgress = (strandY + strandLength * 0.5) / strandLength;
    vRadius = length(vec2(x, z));
  }
  
  // ============================================
  // LAYER E: QUANTUM DUST NODES
  // ============================================
  if (dustIndex >= 0.0) {
    // 180-260 particles around beam intersections
    
    float dustIdx = dustIndex;
    float numDust = 260.0;
    
    // Distribute around beam intersections
    float angle = (dustIdx / numDust) * 6.28318 * 3.0; // 3 full rotations
    float baseRadius = 2.0 + (dustIdx / numDust) * 6.0; // 2.0 to 8.0
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + dustIdx * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    // Vertical variation: sin(angle*2.0)*0.12
    float verticalVar = sin(angle * 2.0) * 0.12;
    
    // Convert to 3D position
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = verticalVar;
    
    // Dust radius: 0.01-0.015
    float dustRadius = 0.0125;
    
    pos = vec3(x, y, z - 6.4);
    pos *= dustRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 2.0) / 6.0;
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

