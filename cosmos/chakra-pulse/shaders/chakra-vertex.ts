/**
 * Chakra Pulse Vertex Shader
 * 
 * Phase 2 — Section 35: CHAKRA PULSE ENGINE
 * Chakra Pulse Engine (E39)
 * 
 * 7 chakra discs, pulse rings, vertical spine beam, breath pulse, bass flicker, mid turbulence, high shimmer, scroll brightness, cameraFOV
 */

export const chakraVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float chakraIndex;
attribute float pulseRingIndex;
attribute float spineIndex;

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
varying float vChakraIndex;
varying float vPulseRingIndex;
varying float vSpineIndex;
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

// Chakra Y positions
float getChakraY(int index) {
  if (index == 0) return -0.9; // root
  if (index == 1) return -0.55; // sacral
  if (index == 2) return -0.2; // solar
  if (index == 3) return 0.2; // heart
  if (index == 4) return 0.55; // throat
  if (index == 5) return 0.85; // third-eye
  return 1.15; // crown
}

void main() {
  vUv = uv;
  vChakraIndex = chakraIndex;
  vPulseRingIndex = pulseRingIndex;
  vSpineIndex = spineIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: ROOT TO CROWN CHAKRA NODES
  // ============================================
  if (chakraIndex >= 0.0) {
    // 7 chakras: root, sacral, solar, heart, throat, third-eye, crown
    int chakraIdx = int(chakraIndex);
    float chakraY = getChakraY(chakraIdx);
    
    // Base radius: 0.11
    float chakraRadius = 0.11;
    
    // Breath pulse: radius *= (1 + uBreathStrength * 0.2)
    float breathPulse = 1.0 + uBreathStrength * 0.2;
    chakraRadius *= breathPulse;
    
    // Bass flicker: sin(time*5 + chakraIndex*2)*uBass*0.03
    float bassFlicker = sin(uTime * 5.0 + chakraIndex * 2.0) * uBass * 0.03;
    chakraRadius += bassFlicker * 0.01;
    
    // High shimmer (handled in fragment)
    
    // Blessing flash (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * chakraRadius;
    float y = sin(angle) * dist * chakraRadius + chakraY;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: PULSE WAVE RINGS
  // ============================================
  if (pulseRingIndex >= 0.0) {
    // Expanding rings emitted from each chakra
    int chakraIdx = int(mod(pulseRingIndex, 7.0));
    float chakraY = getChakraY(chakraIdx);
    
    // Ring expansion: radius += time*0.6
    float ringRadius = 0.11 + uTime * 0.6;
    ringRadius = mod(ringRadius, 1.5); // Loop rings
    
    // Breath → thickness pulse
    float breathThickness = 1.0 + uBreathStrength * 0.1;
    
    // Bass → radial vibration
    float bassVibration = sin(uTime * 4.0 + pulseRingIndex) * uBass * 0.02;
    ringRadius += bassVibration * 0.05;
    
    // High → shimmering edges (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * ringRadius;
    float y = sin(angle) * dist * ringRadius + chakraY;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER C: CHAKRA LINKING COLUMN (ENERGY SPINE)
  // ============================================
  if (spineIndex >= 0.0) {
    // Vertical energy beam connecting chakras
    // Spine goes from root (-0.9) to crown (1.15)
    float spineY = -0.9 + (uv.y - 0.5) * 2.05; // Map UV to spine Y range
    
    // Scroll → column brightness surge (handled in fragment)
    
    // Breath → thickness oscillation
    float breathThickness = 0.03 * (1.0 + uBreathStrength * 0.15);
    
    // Bass → ripple distortion along beam
    float bassRipple = sin(uTime * 4.0 + spineY * 5.0) * uBass * 0.02;
    float x = (uv.x - 0.5) * breathThickness + bassRipple;
    
    // Mid → turbulence waves
    float midTurbulence = fbm(vec2(spineY * 2.0 + uTime * 0.3, uTime * 0.2)) * uMid * 0.03;
    x += midTurbulence;
    
    // High → shimmer streaks (handled in fragment)
    
    pos = vec3(x, spineY, pos.z);
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

