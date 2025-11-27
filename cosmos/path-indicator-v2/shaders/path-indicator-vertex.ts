/**
 * Path Indicator v2 Vertex Shader
 * 
 * Phase 2 — Section 53: PATH INDICATOR ENGINE v2
 * Path Indicator Engine v2 (E57)
 * 
 * 4-layer quantum path navigation: Multi-Track Path Lines, Path Markers/Nodes, Energy Pulses, Path Fog/Atmospheric Mist
 */

export const pathIndicatorVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float pathLineIndex;
attribute float nodeIndex;
attribute float pulseIndex;
attribute float fogIndex;
attribute float pathProgress; // Progress along spline (0-1)
attribute float pathSegment; // Segment index along path

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

// ============================================
// SPLINE FUNCTION (Cubic Bezier approximation)
// ============================================
vec3 splinePosition(float t, float pathIndex) {
  // 3-5 spline-based paths, radius 4 → 10 units
  // Use phi-based spiral for path shape
  float baseRadius = 4.0 + (pathIndex / 4.0) * 6.0; // 4.0 to 10.0
  float angle = t * 6.28318 * 2.0; // 2 full rotations
  
  // Spiral path
  float radius = baseRadius + t * 2.0;
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  float y = sin(t * 6.28318 * 3.0) * 0.5; // Vertical variation
  
  return vec3(x, y, z);
}

// ============================================
// NODE PULSE FUNCTION
// ============================================
float nodePulseFunction(float time, float index) {
  // Equation:
  // nodePulse = sin(time*2.0 + index*0.4) * 0.12
  return sin(time * 2.0 + index * 0.4) * 0.12;
}

void main() {
  vUv = uv;
  vPathLineIndex = pathLineIndex;
  vNodeIndex = nodeIndex;
  vPulseIndex = pulseIndex;
  vFogIndex = fogIndex;
  vPathProgress = pathProgress;
  vPathSegment = pathSegment;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: MULTI-TRACK PATH LINES
  // ============================================
  if (pathLineIndex >= 0.0) {
    // 3-5 spline-based paths, radius 4 → 10 units
    // Geometry: curved polylines → thin quads
    
    float t = pathProgress; // 0 to 1 along spline
    float pathIdx = pathLineIndex;
    
    // Sample spline position
    vec3 splinePos = splinePosition(t, pathIdx);
    
    // Scroll → progress movement along spline
    float scrollProgress = uScroll * 0.3;
    t += scrollProgress;
    t = mod(t, 1.0); // Loop
    
    // Recalculate with scroll
    splinePos = splinePosition(t, pathIdx);
    
    // Breath → glow intensity modulation (handled in fragment)
    
    // High → shimmer (handled in fragment)
    
    // Convert polyline to thin quad
    // uv.x: 0-1 along path width, uv.y: 0-1 along path length
    float pathWidth = 0.08; // Thin path width
    float widthOffset = (uv.x - 0.5) * pathWidth;
    
    // Calculate tangent for perpendicular offset
    float tNext = t + 0.01;
    if (tNext > 1.0) tNext = 0.0;
    vec3 splineNext = splinePosition(tNext, pathIdx);
    vec3 tangent = normalize(splineNext - splinePos);
    vec3 normal = normalize(cross(tangent, vec3(0, 1, 0)));
    
    // Offset position perpendicular to path
    pos = splinePos + normal * widthOffset;
    pos.z -= 10.0; // Position in scene
    
    vPathDistance = t;
    vGradientProgress = t;
    vRadius = length(splinePos.xz);
  }
  
  // ============================================
  // LAYER B: PATH MARKERS / NODES
  // ============================================
  if (nodeIndex >= 0.0) {
    // 20-40 nodes placed along spline curves
    // Equation:
    // nodePulse = sin(time*2.0 + index*0.4) * 0.12
    
    float nodeIdx = nodeIndex;
    float numNodes = 40.0;
    float t = nodeIdx / numNodes; // Position along path
    
    // Sample spline position
    float pathIdx = mod(nodeIdx, 5.0); // Which path (0-4)
    vec3 splinePos = splinePosition(t, pathIdx);
    
    // Node pulse
    float basePulse = nodePulseFunction(uTime, nodeIdx);
    
    // Bass → jitter vibration
    float bassJitter = sin(uTime * 3.5 + nodeIdx * 2.0) * uBass * 0.02;
    splinePos += vec3(bassJitter, bassJitter * 0.5, bassJitter);
    
    // High → sparkle noise (handled in fragment)
    
    // Node size
    float nodeSize = 0.15 + basePulse;
    float nodeRadius = nodeSize * 0.5;
    
    // Convert to quad
    float quadSize = nodeRadius;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    pos = splinePos + vec3(x, y, 0);
    pos.z -= 10.0; // Position in scene
    
    vPathDistance = t;
    vGradientProgress = basePulse;
    vRadius = length(splinePos.xz);
  }
  
  // ============================================
  // LAYER C: ENERGY PULSES
  // ============================================
  if (pulseIndex >= 0.0) {
    // 3-7 energy pulses traveling along spline
    // Travel speed tied to scrollProgress
    
    float pulseIdx = pulseIndex;
    float numPulses = 7.0;
    float pathIdx = mod(pulseIdx, 5.0); // Which path (0-4)
    
    // Pulse position along path (traveling)
    float baseT = pulseIdx / numPulses;
    float travelSpeed = uScroll * 0.4 + 0.1; // Scroll-driven + base speed
    float t = mod(baseT + uTime * travelSpeed, 1.0);
    
    // Sample spline position
    vec3 splinePos = splinePosition(t, pathIdx);
    
    // Breath → pulse radius scaling
    float breathScaling = 1.0 + uBreathStrength * 0.15;
    
    // High → pulse shimmer (handled in fragment)
    
    // Bass → flicker (handled in fragment)
    
    // Pulse size
    float pulseSize = 0.3 * breathScaling;
    float pulseRadius = pulseSize * 0.5;
    
    // Convert to quad
    float quadSize = pulseRadius;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    pos = splinePos + vec3(x, y, 0);
    pos.z -= 10.0; // Position in scene
    
    vPathDistance = t;
    vGradientProgress = breathScaling;
    vRadius = length(splinePos.xz);
  }
  
  // ============================================
  // LAYER D: PATH FOG / ATMOSPHERIC MIST
  // ============================================
  if (fogIndex >= 0.0) {
    // Soft fog along path lines
    // fbm-based displacement
    
    float planeWidth = 20.0;
    float planeHeight = 20.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // fbm-based displacement
    float fogDisplacement = fbm(xz * 0.3 + uTime * 0.2) * 0.5;
    xz += normalize(xz) * fogDisplacement;
    
    // Scroll → drift
    float scrollDrift = uScroll * 0.2;
    xz.x += scrollDrift;
    
    // Breath → opacity pulse (handled in fragment)
    
    // Position
    pos = vec3(xz.x, fogDisplacement * 0.3, xz.y - 10.0);
    
    vPathDistance = length(xz) / 20.0;
    vGradientProgress = fogDisplacement;
    vRadius = length(xz);
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

