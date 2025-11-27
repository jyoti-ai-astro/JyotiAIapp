/**
 * Divine Alignment Grid Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Divine Alignment Grid Engine (E9)
 * 
 * Creates grid systems with:
 * - Sacred Geometry Grid (Flower of Life + triangles)
 * - Rotational Mandala Grid (16-seg mandala)
 * - Radiant Guideline Grid (radial beams + circles)
 * - Scroll-driven rotation
 * - FBM geometry distortion
 * - Parallax for perspective depth
 */

export const gridVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;
uniform float uLayerType;  // 0: Sacred Geometry, 1: Mandala, 2: Radiant

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;
varying float vGridCoord;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
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

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // ============================================
  // RADIAL DISTANCE (from center)
  // ============================================
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  vRadialDistance = length(toCenter);
  
  // ============================================
  // LAYER 1: SACRED GEOMETRY GRID (Flower of Life + Triangles)
  // ============================================
  if (uLayerType < 0.5) {
    // Flower of Life lattice pattern
    float gridScale = 8.0;
    vec2 gridUV = uv * gridScale;
    
    // Hexagonal grid coordinates
    vec2 hexCoord = vec2(
      gridUV.x + gridUV.y * 0.5,
      gridUV.y * 0.866
    );
    vec2 hexCell = floor(hexCoord);
    vec2 hexLocal = fract(hexCoord);
    
    // Triangle tessellation
    vec2 triCoord = hexLocal;
    float triDist = length(triCoord - vec2(0.5));
    
    // Grid coordinate for fragment shader
    vGridCoord = mod(hexCell.x + hexCell.y, 2.0);
    
    // FBM distortion
    vec2 distortion = vec2(
      fbm(pos.xy * 0.5 + uTime * 0.1),
      fbm(pos.xy * 0.5 + uTime * 0.1 + 100.0)
    ) * 0.1;
    pos.xy += distortion;
    
    // Parallax for perspective depth
    float parallaxX = sin(uTime * 0.2 + pos.x * 0.1) * uMouse.x * 0.03;
    float parallaxY = cos(uTime * 0.2 + pos.y * 0.1) * uMouse.y * 0.03;
    pos.xy += vec2(parallaxX, parallaxY) * uParallaxStrength;
    
    pos.z = -2.4;
  }
  
  // ============================================
  // LAYER 2: ROTATIONAL MANDALA GRID (16-seg Mandala)
  // ============================================
  else if (uLayerType < 1.5) {
    // 16-segment rotational mandala
    float segments = 16.0;
    float angle = atan(toCenter.y, toCenter.x);
    float segmentAngle = angle / (3.14159 * 2.0) * segments;
    float segmentIndex = floor(segmentAngle);
    
    // Grid coordinate for fragment shader
    vGridCoord = mod(segmentIndex, 2.0);
    
    // Scroll-driven rotation
    float rotation = uScroll * 3.14159 * 2.0;
    float cosRot = cos(rotation);
    float sinRot = sin(rotation);
    vec2 rotated = vec2(
      toCenter.x * cosRot - toCenter.y * sinRot,
      toCenter.x * sinRot + toCenter.y * cosRot
    );
    pos.xy = center + rotated;
    
    // FBM distortion
    vec2 distortion = vec2(
      fbm(pos.xy * 0.3 + uTime * 0.15),
      fbm(pos.xy * 0.3 + uTime * 0.15 + 100.0)
    ) * 0.08;
    pos.xy += distortion;
    
    // Parallax for perspective depth
    float parallaxX = sin(uTime * 0.25 + pos.x * 0.15) * uMouse.x * 0.04;
    float parallaxY = cos(uTime * 0.25 + pos.y * 0.15) * uMouse.y * 0.04;
    pos.xy += vec2(parallaxX, parallaxY) * uParallaxStrength;
    
    pos.z = -2.2;
  }
  
  // ============================================
  // LAYER 3: RADIANT GUIDELINE GRID (Radial Beams + Concentric Circles)
  // ============================================
  else {
    // Radial beams
    float beamCount = 12.0;
    float angle = atan(toCenter.y, toCenter.x);
    float beamAngle = angle / (3.14159 * 2.0) * beamCount;
    float beamIndex = floor(beamAngle);
    
    // Concentric circles
    float circleCount = 8.0;
    float circleIndex = floor(vRadialDistance * circleCount);
    
    // Grid coordinate for fragment shader
    vGridCoord = mod(beamIndex + circleIndex, 2.0);
    
    // FBM distortion
    vec2 distortion = vec2(
      fbm(pos.xy * 0.4 + uTime * 0.12),
      fbm(pos.xy * 0.4 + uTime * 0.12 + 100.0)
    ) * 0.06;
    pos.xy += distortion;
    
    // Parallax for perspective depth
    float parallaxX = sin(uTime * 0.3 + pos.x * 0.2) * uMouse.x * 0.05;
    float parallaxY = cos(uTime * 0.3 + pos.y * 0.2) * uMouse.y * 0.05;
    pos.xy += vec2(parallaxX, parallaxY) * uParallaxStrength;
    
    pos.z = -2.0;
  }
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

