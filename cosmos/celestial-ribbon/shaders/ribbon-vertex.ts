/**
 * Celestial Ribbon Vertex Shader
 * 
 * Phase 2 — Section 38: CELESTIAL RIBBON ENGINE
 * Celestial Ribbon Engine (E42)
 * 
 * Bezier ribbons, spiral ribbons, traveling particles, breath amplitude, scroll progression, bass vibration, high shimmer, rotationSync, cameraFOV
 */

export const ribbonVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float ribbonIndex;
attribute float spiralIndex;
attribute float particleIndex;

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

varying vec2 vUv;
varying vec3 vPosition;
varying float vRibbonIndex;
varying float vSpiralIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vRibbonProgress;

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

// Bezier curve evaluation
vec2 bezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
  float t2 = t * t;
  float t3 = t2 * t;
  float mt = 1.0 - t;
  float mt2 = mt * mt;
  float mt3 = mt2 * mt;
  return mt3 * p0 + 3.0 * mt2 * t * p1 + 3.0 * mt * t2 * p2 + t3 * p3;
}

void main() {
  vUv = uv;
  vRibbonIndex = ribbonIndex;
  vSpiralIndex = spiralIndex;
  vParticleIndex = particleIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: PRIMARY ENERGY RIBBONS
  // ============================================
  if (ribbonIndex >= 0.0) {
    // 3-5 flowing bezier ribbons (mobile: 3)
    // Ribbon progress along curve (0-1)
    float ribbonT = uv.x; // Use UV.x as progress along ribbon
    
    // Generate control points for bezier curve
    float ribbonOffset = ribbonIndex * 0.3;
    vec2 p0 = vec2(-0.8, -0.5 + ribbonOffset);
    vec2 p1 = vec2(-0.2, 0.0 + ribbonOffset);
    vec2 p2 = vec2(0.2, 0.0 + ribbonOffset);
    vec2 p3 = vec2(0.8, -0.5 + ribbonOffset);
    
    // Breath → amplitude swell
    float breathSwell = 1.0 + uBreathStrength * 0.15;
    p1.y *= breathSwell;
    p2.y *= breathSwell;
    
    // Scroll → forward progression
    float scrollProgression = uScroll * 0.5;
    ribbonT = mod(ribbonT + scrollProgression, 1.0);
    
    // Bass → wave vibration
    float bassWave = sin(uTime * 4.0 + ribbonIndex * 2.0) * uBass * 0.03;
    p1.y += bassWave;
    p2.y += bassWave;
    
    // High → shimmer pulses (handled in fragment)
    
    // Evaluate bezier curve
    vec2 ribbonPos = bezier(p0, p1, p2, p3, ribbonT);
    
    // Ribbon thickness: 0.025-0.04
    float ribbonThickness = 0.032;
    float thicknessOffset = (uv.y - 0.5) * ribbonThickness;
    
    // Perpendicular to curve direction
    vec2 tangent = normalize(bezier(p0, p1, p2, p3, ribbonT + 0.01) - ribbonPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    
    pos = vec3(ribbonPos + normal * thicknessOffset, pos.z);
    vRibbonProgress = ribbonT;
  }
  
  // ============================================
  // LAYER B: TWIN SPIRAL RIBBONS
  // ============================================
  if (spiralIndex >= 0.0) {
    // Two helically twisting ribbons spiraling around the primary ribbons
    float spiralT = uv.x; // Progress along spiral (0-1)
    int spiralId = int(mod(spiralIndex, 2.0)); // 0 or 1
    
    // RotationSync → spiral phase shift
    float phaseShift = uRotationSync * 0.5;
    
    // Helix equation: x = r*cos(θ), y = r*sin(θ), z = h*θ
    float spiralAngle = spiralT * 6.28318 * 2.0 + phaseShift + float(spiralId) * 3.14159; // 2 full rotations
    float spiralRadius = 0.4 + spiralT * 0.3; // Expanding radius
    float spiralHeight = (spiralT - 0.5) * 0.6; // Vertical offset
    
    // Mid → turbulence curl on spiral angle
    float midCurl = fbm(vec2(spiralT * 5.0 + uTime * 0.3, uTime * 0.2)) * uMid * 0.1;
    spiralAngle += midCurl;
    
    // Position on spiral
    float x = cos(spiralAngle) * spiralRadius;
    float y = sin(spiralAngle) * spiralRadius + spiralHeight;
    
    // Thickness: 0.02
    float spiralThickness = 0.02;
    float thicknessOffset = (uv.y - 0.5) * spiralThickness;
    
    // Perpendicular to spiral direction
    vec2 spiralDir = vec2(-sin(spiralAngle), cos(spiralAngle));
    pos = vec3(x + spiralDir.x * thicknessOffset, y + spiralDir.y * thicknessOffset, pos.z);
  }
  
  // ============================================
  // LAYER C: CELESTIAL THREAD PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 40-80 micro particles traveling along ribbons (mobile: 30)
    float particleT = mod(uTime * 0.3 + particleIndex * 0.1, 1.0); // Traveling along curve
    
    // Breath → acceleration
    float breathAccel = 1.0 + uBreathStrength * 0.2;
    particleT *= breathAccel;
    particleT = mod(particleT, 1.0);
    
    // Scroll → forward drag
    float scrollDrag = uScroll * 0.3;
    particleT = mod(particleT + scrollDrag, 1.0);
    
    // Bass → jitter
    float bassJitter = sin(uTime * 5.0 + particleIndex * 3.0) * uBass * 0.02;
    particleT += bassJitter * 0.05;
    
    // High → sparkle noise (handled in fragment)
    
    // Position particle along a ribbon path
    float ribbonOffset = mod(particleIndex, 3.0) * 0.3; // Link to one of 3 ribbons
    vec2 p0 = vec2(-0.8, -0.5 + ribbonOffset);
    vec2 p1 = vec2(-0.2, 0.0 + ribbonOffset);
    vec2 p2 = vec2(0.2, 0.0 + ribbonOffset);
    vec2 p3 = vec2(0.8, -0.5 + ribbonOffset);
    
    vec2 particlePos = bezier(p0, p1, p2, p3, particleT);
    
    // Particle size
    float particleSize = 0.015;
    pos = vec3(particlePos, pos.z);
    pos *= particleSize;
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

