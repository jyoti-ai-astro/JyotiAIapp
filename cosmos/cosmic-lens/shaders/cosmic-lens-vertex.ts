/**
 * Cosmic Lens Vertex Shader
 * 
 * Phase 2 — Section 49: COSMIC LENS ENGINE
 * Cosmic Lens Engine (E53)
 * 
 * Primary curved space lens, light arc refractions, lens dust & photon particles, breath pulse, scroll gravity, bass jitter, high shimmer, cameraFOV
 */

export const cosmicLensVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float lensIndex;
attribute float arcIndex;
attribute float photonIndex;

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
varying float vLensIndex;
varying float vArcIndex;
varying float vPhotonIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWarpHeight;
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
// WARP DISTORTION FUNCTION
// ============================================
float warpDistortion(vec2 xz, float time) {
  // Strong warping equation:
  // warp1 = sin(x*0.5 + time*0.4)*0.12
  // warp2 = fbm(uv*3.0 + time*0.2)*0.15
  // radial = sin(dist*2.0 - time*0.3)*0.08
  // combined = warp1 + warp2 + radial
  float warp1 = sin(xz.x * 0.5 + time * 0.4) * 0.12;
  float warp2 = fbm(xz * 3.0 + time * 0.2) * 0.15;
  float dist = length(xz);
  float radial = sin(dist * 2.0 - time * 0.3) * 0.08;
  
  return warp1 + warp2 + radial;
}

// ============================================
// ARC FUNCTION
// ============================================
float arcFunction(float angle, float radius, float time, float rotationSync) {
  // Equation:
  // arc = sin(angle*2.2 + time*1.2)*0.1
  // noise = fbm(vec2(angle*3.0, radius*0.7)+time*0.3)*0.07
  float arc = sin(angle * 2.2 + time * 1.2) * 0.1;
  float noise = fbm(vec2(angle * 3.0, radius * 0.7) + time * 0.3) * 0.07;
  
  // RotationSync → arc bending skew
  float skew = rotationSync * 0.4;
  arc += sin(angle * 1.8 + time * 0.9 + skew) * 0.03;
  
  return arc + noise;
}

void main() {
  vUv = uv;
  vLensIndex = lensIndex;
  vArcIndex = arcIndex;
  vPhotonIndex = photonIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY CURVED SPACE LENS
  // ============================================
  if (lensIndex >= 0.0) {
    // Massive curved-space distortion plane
    // Dimensions: 24 × 14 units, 48×48 grid
    float planeWidth = 24.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample warp distortion
    float baseWarp = warpDistortion(xz, uTime);
    
    // Breath → distortion amplitude boost
    float breathAmplitude = 1.0 + uBreathStrength * 0.2;
    baseWarp *= breathAmplitude;
    
    // Scroll → gravitational pull-in effect (center gravity)
    float distFromCenter = length(xz);
    float scrollGravity = uScroll * 0.3;
    float gravityPull = -scrollGravity * (1.0 / (distFromCenter + 0.5)) * 0.1;
    xz += normalize(xz) * gravityPull;
    baseWarp += gravityPull * 2.0;
    
    // Bass → ripple jitter around center
    float bassRipple = sin(uTime * 3.5 + distFromCenter * 2.0) * uBass * 0.02;
    xz += normalize(xz) * bassRipple;
    baseWarp += bassRipple * 1.5;
    
    // High → micro-lens shimmer (handled in fragment)
    
    // Position with warp displacement
    pos = vec3(xz.x, baseWarp, xz.y - 7.5);
    
    vWarpHeight = baseWarp;
    vGradientProgress = (baseWarp + 0.2) / 0.4; // Normalize to 0-1
    vRadius = distFromCenter;
  }
  
  // ============================================
  // LAYER B: LIGHT ARC REFRACTIONS
  // ============================================
  if (arcIndex >= 0.0) {
    // 3-6 crescent light arcs bending around center
    // Angle: 0 → 2π
    // Radius: 1.8 → 6.0
    float baseRadius = 1.8 + (arcIndex / 5.0) * 4.2; // 1.8 to 6.0
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.2;
    
    // Sample arc
    float baseArc = arcFunction(angle, baseRadius, uTime, uRotationSync);
    
    // Breath → arc width expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    baseArc *= breathExpansion;
    
    // Mid → turbulence injection (already in arcFunction)
    float midTurbulence = fbm(vec2(angle * 3.0, baseRadius * 0.7) + uTime * 0.3) * uMid * 0.03;
    baseArc += midTurbulence;
    
    // High → refraction shimmer (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * (baseRadius + baseArc);
    float z = sin(angle) * (baseRadius + baseArc);
    float y = 0.0;
    
    pos = vec3(x, y, z - 7.5);
    
    vWarpHeight = baseArc;
    vGradientProgress = (baseArc + 0.15) / 0.3; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER C: LENS DUST & PHOTON PARTICLES
  // ============================================
  if (photonIndex >= 0.0) {
    // 200-320 drifting photon particles (mobile: 150)
    // Spiral orbit equation:
    // angle = time*speed + offset
    // radius = baseRadius + sin(time*1.3 + index*0.6)*0.18
    
    float speed = 0.1 + (photonIndex / 320.0) * 0.08; // Varying speeds
    float offset = photonIndex * 0.04;
    float angle = (uTime * speed) + offset;
    
    // Base radius around lens
    float baseRadius = 1.5 + (photonIndex / 320.0) * 4.5; // 1.5 to 6.0
    float radiusVariation = sin(uTime * 1.3 + photonIndex * 0.6) * 0.18;
    float radius = baseRadius + radiusVariation;
    
    // Breath → spiral expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // Bass → jitter flicker
    float bassJitter = sin(uTime * 4.0 + photonIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → photon sparkle noise (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.8) * 0.1; // Slight vertical variation
    
    // Radius: 0.01-0.015
    float photonRadius = 0.0125;
    
    pos = vec3(x, y, z - 7.5);
    pos *= photonRadius; // Scale particle size
    
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

