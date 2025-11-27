/**
 * Cosmic Orbit Vertex Shader
 * 
 * Phase 2 — Section 37: COSMIC ORBIT ENGINE
 * Cosmic Orbit Engine (E41)
 * 
 * Elliptical rings, satellite quads, nexus core, breath expansion, scroll rotation, bass wobble, mid turbulence, rotationSync, cameraFOV
 */

export const orbitVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float orbitRingIndex;
attribute float satelliteIndex;
attribute float coreIndex;

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
varying float vOrbitRingIndex;
varying float vSatelliteIndex;
varying float vCoreIndex;
varying float vDistance;
varying float vRadialDistance;

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

// Orbit radii: [0.9, 1.2, 1.5, 1.8]
float getOrbitRadius(int index) {
  if (index == 0) return 0.9;
  if (index == 1) return 1.2;
  if (index == 2) return 1.5;
  return 1.8;
}

void main() {
  vUv = uv;
  vOrbitRingIndex = orbitRingIndex;
  vSatelliteIndex = satelliteIndex;
  vCoreIndex = coreIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: PRIMARY ORBIT RINGS
  // ============================================
  if (orbitRingIndex >= 0.0) {
    // 2-4 elliptical orbits (mobile: 2)
    int ringIdx = int(orbitRingIndex);
    float orbitRadius = getOrbitRadius(ringIdx);
    
    // Breath → orbit expansion pulse: radius *= (1 + uBreathStrength*0.1)
    float breathExpansion = 1.0 + uBreathStrength * 0.1;
    orbitRadius *= breathExpansion;
    
    // Scroll → orbit rotational speed: angle += uScroll * 2π * ringSpeed
    float ringSpeed = 0.08 + float(ringIdx) * 0.04; // Different speeds per ring
    angle += uScroll * 6.28318 * ringSpeed;
    
    // Bass → harmonic wobble: sin(time*4 + segIndex*2)*uBass*0.03
    float segIndex = dist * 48.0; // Approximate segment index
    float bassWobble = sin(uTime * 4.0 + segIndex * 2.0) * uBass * 0.03;
    angle += bassWobble;
    
    // High → shimmering nodes along ellipse (handled in fragment)
    
    // Elliptical orbit (slightly elliptical)
    float ellipseRatio = 0.95; // Slight flattening
    float x = cos(angle) * dist * orbitRadius;
    float y = sin(angle) * dist * orbitRadius * ellipseRatio;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: SATELLITE SOULS
  // ============================================
  if (satelliteIndex >= 0.0) {
    // 6-12 orbiting particles (mobile: 6)
    float satelliteAngle = (satelliteIndex / 12.0) * 6.28318; // 12 satellites max
    
    // Orbit radius = per-ring radius + offset
    // Each satellite is linked to a random orbit ring
    int linkedRing = int(mod(satelliteIndex, 4.0));
    float baseRadius = getOrbitRadius(linkedRing);
    float orbitOffset = 0.1; // Offset from ring
    float satelliteRadius = baseRadius + orbitOffset;
    
    // RotationSync → orbit inclination shift
    float inclination = uRotationSync * 0.3;
    satelliteAngle += inclination;
    
    // BlessingWave → satellite glow burst (handled in fragment)
    
    // Bass → jitter wobble: sin(time*5 + satelliteIndex*3)*uBass*0.02
    float bassJitter = sin(uTime * 5.0 + satelliteIndex * 3.0) * uBass * 0.02;
    satelliteAngle += bassJitter;
    
    // Mid → turbulence drift: fbm(uv*5 + time*0.3)*uMid*0.05
    float midDrift = fbm(uv * 5.0 + uTime * 0.3) * uMid * 0.05;
    satelliteAngle += midDrift * 0.1;
    
    // Particle radius: 0.03
    float particleRadius = 0.03;
    
    // Position satellite
    float x = cos(satelliteAngle) * satelliteRadius;
    float y = sin(satelliteAngle) * satelliteRadius;
    
    pos = vec3(x, y, pos.z);
    
    // Particle size
    pos *= particleRadius;
  }
  
  // ============================================
  // LAYER C: COSMIC NEXUS CORE
  // ============================================
  if (coreIndex >= 0.0) {
    // Glowing rotating disc behind Guru
    float coreRadius = 0.25;
    
    // Breath → core pulse
    float breathPulse = 1.0 + uBreathStrength * 0.15;
    coreRadius *= breathPulse;
    
    // Bass → radial flicker: sin(time*6 + dist*20)*uBass*0.04
    float bassFlicker = sin(uTime * 6.0 + dist * 20.0) * uBass * 0.04;
    coreRadius += bassFlicker * 0.02;
    
    // High → cosmic shimmering texture (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * coreRadius;
    float y = sin(angle) * dist * coreRadius;
    
    pos = vec3(x, y, pos.z);
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

