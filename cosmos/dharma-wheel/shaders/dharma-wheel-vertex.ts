/**
 * Dharma Wheel Vertex Shader
 * 
 * Phase 2 — Section 24: DHARMA WHEEL ENGINE
 * Dharma Wheel Engine (E28)
 * 
 * Wheel geometry, flame rings, jewel quad with scroll rotation, breath radial scale, bass wobble, flame noise distortions
 */

export const dharmaWheelVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float wheelIndex;
attribute float flameRingIndex;
attribute float jewelIndex;

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
uniform float uRotationSync;
uniform float uCameraFOV;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWheelIndex;
varying float vFlameRingIndex;
varying float vJewelIndex;
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

void main() {
  vUv = uv;
  vWheelIndex = wheelIndex;
  vFlameRingIndex = flameRingIndex;
  vJewelIndex = jewelIndex;
  
  vec3 pos = position;
  
  // Radial distance from center
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  vRadialDistance = length(toCenter);
  
  // ============================================
  // LAYER A: OUTER CHAKRA WHEEL
  // ============================================
  if (wheelIndex >= 0.0) {
    // Circular ring subdivided into spokes
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter);
    
    // Scroll → rotation: baseRotation + uScroll * 2π
    float baseRotation = uTime * 0.1; // Slow base rotation
    float scrollRotation = uScroll * 6.28318; // 2π
    float totalRotation = baseRotation + scrollRotation;
    angle += totalRotation;
    
    // Breath → expansion/soft contraction: 1.0 + uBreathStrength * 0.08
    float breathScale = 1.0 + uBreathStrength * 0.08;
    radius *= breathScale;
    
    // Bass → rotation wobble: sin(time*3.0) * uBass * 0.02
    float bassWobble = sin(uTime * 3.0) * uBass * 0.02;
    angle += bassWobble;
    
    // Convert back to cartesian
    float x = cos(angle) * radius;
    float y = sin(angle) * radius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: INNER FLAME RINGS
  // ============================================
  if (flameRingIndex >= 0.0) {
    // 3 rotating flame rings
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter);
    
    // Counter-rotation pattern
    float ringRotationSpeed = 0.0;
    if (flameRingIndex == 0.0) {
      // Ring 1 rotates CW
      ringRotationSpeed = uTime * 0.3;
    } else if (flameRingIndex == 1.0) {
      // Ring 2 rotates CCW
      ringRotationSpeed = -uTime * 0.4;
    } else if (flameRingIndex == 2.0) {
      // Ring 3 rotates CW slower
      ringRotationSpeed = uTime * 0.2;
    }
    
    angle += ringRotationSpeed;
    
    // Scroll → flame size modulation: 1.0 + uScroll * 0.1
    float scrollSize = 1.0 + uScroll * 0.1;
    radius *= scrollSize;
    
    // Mid → flame turbulence: fbm(uv*10 + time*0.5) * uMid * 0.3
    float flameTurbulence = fbm(uv * 10.0 + uTime * 0.5) * uMid * 0.3;
    radius += flameTurbulence;
    
    // Convert back to cartesian
    float x = cos(angle) * radius;
    float y = sin(angle) * radius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER C: CORE MANDALA JEWEL
  // ============================================
  if (jewelIndex >= 0.0) {
    // Jewel quad → centered plane
    // Pulse synced to breath: 1.0 + uBreathStrength * 0.2
    float breathPulse = 1.0 + uBreathStrength * 0.2;
    pos *= breathPulse;
  }
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.2) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.2) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

