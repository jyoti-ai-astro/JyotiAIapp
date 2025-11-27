/**
 * Solar Arc Vertex Shader
 * 
 * Phase 2 — Section 47: SOLAR ARC FIELD ENGINE
 * Solar Arc Engine (E51)
 * 
 * Primary solar arcs, reverse solar back-arcs, solar sparks trail, breath pulse, scroll rotation, bass jitter, high shimmer, cameraFOV
 */

export const solarArcVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float arcIndex;
attribute float reverseArcIndex;
attribute float sparkIndex;

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
varying float vArcIndex;
varying float vReverseArcIndex;
varying float vSparkIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vArcHeight;
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
// ARC HEIGHT FUNCTION
// ============================================
float arcHeightFunction(float angle, float radius, float time) {
  // Arc equation:
  // arcHeight = sin(angle * 1.8 + time * 0.4) * 0.25
  // arcNoise = fbm(vec2(angle*2.0, radius*0.6) + time*0.2) * 0.15
  // combined = arcHeight + arcNoise
  float arcHeight = sin(angle * 1.8 + time * 0.4) * 0.25;
  float arcNoise = fbm(vec2(angle * 2.0, radius * 0.6) + time * 0.2) * 0.15;
  
  return arcHeight + arcNoise;
}

// ============================================
// REVERSE ARC FUNCTION
// ============================================
float reverseArcFunction(float angle, float radius, float time) {
  // Motion:
  // reverseArc = sin(angle * 1.3 + time * 0.6) * 0.18
  // turbulence = fbm(vec2(radius*0.7, angle*3.0) + time*0.3) * 0.1
  float reverseArc = sin(angle * 1.3 + time * 0.6) * 0.18;
  float turbulence = fbm(vec2(radius * 0.7, angle * 3.0) + time * 0.3) * 0.1;
  
  return reverseArc + turbulence;
}

void main() {
  vUv = uv;
  vArcIndex = arcIndex;
  vReverseArcIndex = reverseArcIndex;
  vSparkIndex = sparkIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY SOLAR ARCS
  // ============================================
  if (arcIndex >= 0.0) {
    // 2-3 massive curved solar flares
    // Geometry: Arc mesh (radius 3.5-6 units, thickness 0.25)
    // Angle: 0 → π
    
    float baseRadius = 3.5 + (arcIndex / 2.0) * 2.5; // 3.5 to 6.0
    float angle = uv.x * 3.14159; // 0 to π
    float thickness = 0.25;
    
    // Sample arc height
    float baseArcHeight = arcHeightFunction(angle, baseRadius, uTime);
    
    // Breath → arc height expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.2;
    baseArcHeight *= breathExpansion;
    
    // Scroll → arc sweep rotation (counterclockwise)
    float scrollRotation = uScroll * 1.5; // Counterclockwise
    angle += scrollRotation;
    
    // Bass → jitter ripple
    float bassJitter = sin(uTime * 3.0 + angle * 2.0) * uBass * 0.02;
    angle += bassJitter;
    
    // High → solar shimmer pulses (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * baseRadius;
    float z = sin(angle) * baseRadius;
    float y = baseArcHeight;
    
    pos = vec3(x, y, z - 6.9);
    
    vArcHeight = baseArcHeight;
    vGradientProgress = (baseArcHeight + 0.3) / 0.6; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER B: REVERSE SOLAR BACK-ARCS
  // ============================================
  if (reverseArcIndex >= 0.0) {
    // Backside inverted arcs with cooling colors
    float baseRadius = 4.0 + (reverseArcIndex / 1.0) * 2.0; // 4.0 to 6.0
    float angle = uv.x * 3.14159; // 0 to π
    float thickness = 0.25;
    
    // Sample reverse arc
    float baseReverseArc = reverseArcFunction(angle, baseRadius, uTime);
    
    // RotationSync → rotational offset
    float rotationOffset = uRotationSync * 0.5;
    angle += rotationOffset;
    
    // Breath → amplitude boost
    float breathAmplitude = 1.0 + uBreathStrength * 0.15;
    baseReverseArc *= breathAmplitude;
    
    // Mid → turbulence injection (already in reverseArcFunction)
    float midTurbulence = fbm(vec2(baseRadius * 0.7, angle * 3.0) + uTime * 0.3) * uMid * 0.03;
    baseReverseArc += midTurbulence;
    
    // High → shimmer ripples (handled in fragment)
    
    // Invert arc (backside)
    baseReverseArc = -baseReverseArc * 0.8; // Inverted and slightly smaller
    
    // Convert to 3D position
    float x = cos(angle) * baseRadius;
    float z = sin(angle) * baseRadius;
    float y = baseReverseArc;
    
    pos = vec3(x, y, z - 6.9);
    
    vArcHeight = baseReverseArc;
    vGradientProgress = (baseReverseArc + 0.2) / 0.4; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER C: SOLAR SPARKS TRAIL
  // ============================================
  if (sparkIndex >= 0.0) {
    // 140-220 sparks (mobile: 100)
    // Orbital drift around arc edges
    
    // Equations:
    // angle = (time * speed) + offset
    // radius = baseRadius + sin(time*0.9 + index*0.4)*0.2
    
    float speed = 0.15 + (sparkIndex / 220.0) * 0.1; // Varying speeds
    float offset = sparkIndex * 0.05;
    float angle = (uTime * speed) + offset;
    
    // Base radius around arc edges
    float baseRadius = 3.5 + (sparkIndex / 220.0) * 2.5; // 3.5 to 6.0
    float radiusVariation = sin(uTime * 0.9 + sparkIndex * 0.4) * 0.2;
    float radius = baseRadius + radiusVariation;
    
    // Breath → radial expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // Bass → flicker jitter
    float bassJitter = sin(uTime * 4.0 + sparkIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → sparkle noise (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.1; // Slight vertical variation
    
    // Radius: 0.01-0.015
    float sparkRadius = 0.0125;
    
    pos = vec3(x, y, z - 6.9);
    pos *= sparkRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
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

