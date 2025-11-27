/**
 * Celestial Horizon Vertex Shader
 * 
 * Phase 2 — Section 41: CELESTIAL HORIZON ENGINE
 * Celestial Horizon Engine (E45)
 * 
 * Deep space gradient plane, horizon light band, star fog particles, breath pulse, scroll parallax, bass ripple, high shimmer, cameraFOV
 */

export const horizonVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float planeIndex;
attribute float bandIndex;
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
uniform float uBlessingWaveProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vPlaneIndex;
varying float vBandIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vGradientProgress;

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
  vPlaneIndex = planeIndex;
  vBandIndex = bandIndex;
  vParticleIndex = particleIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: DEEP SPACE GRADIENT PLANE
  // ============================================
  if (planeIndex >= 0.0) {
    // Infinite horizontal plane behind all engines
    // Plane size: extremely large: 18 × 10 units
    float planeWidth = 18.0;
    float planeHeight = 10.0;
    
    // Apply gradient UVs
    float gradientT = uv.y; // Vertical gradient (0-1)
    vGradientProgress = gradientT;
    
    // Breath → slow gradient pulsation
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.05;
    gradientT *= breathPulse;
    gradientT = clamp(gradientT, 0.0, 1.0);
    
    // Scroll → parallax shift (slight X/Z movement)
    float scrollParallaxX = uScroll * 0.1;
    float scrollParallaxZ = uScroll * 0.05;
    
    // Bass → surface ripple wobble
    float bassRipple = sin(uTime * 2.0 + pos.x * 0.5) * uBass * 0.02;
    float rippleY = pos.y + bassRipple;
    
    // High → subtle noise shimmer (nebula pulses) - handled in fragment
    
    // Position plane
    pos = vec3(
      (uv.x - 0.5) * planeWidth + scrollParallaxX,
      (uv.y - 0.5) * planeHeight + rippleY,
      -6.0 + scrollParallaxZ
    );
  }
  
  // ============================================
  // LAYER B: HORIZON LIGHT BAND
  // ============================================
  if (bandIndex >= 0.0) {
    // Thin glowing band across the horizontal axis
    // Horizontal strip across center Y = ~0.0
    float bandWidth = 18.0; // Match plane width
    float bandThickness = 0.15;
    
    // Breath → band thickness pulse
    float breathThickness = 1.0 + uBreathStrength * 0.1;
    bandThickness *= breathThickness;
    
    // Scroll → band vertical drift (~0.1)
    float scrollDrift = uScroll * 0.1;
    
    // Bass → band wave distortion
    float bassWave = sin(uTime * 3.0 + pos.x * 0.3) * uBass * 0.03;
    float waveY = scrollDrift + bassWave;
    
    // High → shimmering edge (handled in fragment)
    
    // Position band
    float bandY = (uv.y - 0.5) * bandThickness + waveY;
    pos = vec3(
      (uv.x - 0.5) * bandWidth,
      bandY,
      -6.0
    );
  }
  
  // ============================================
  // LAYER C: STAR FOG PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 120-200 micro star specks (mobile: 80)
    // Gentle upward motion
    
    // Breath → parallax amplitude
    float breathAmplitude = 1.0 + uBreathStrength * 0.15;
    
    // Scroll → drift speed
    float scrollDrift = uScroll * 0.2;
    
    // Upward drift (slow)
    float baseSpeed = 0.1;
    float upwardY = mod(uTime * baseSpeed + particleIndex * 0.01 + scrollDrift, 10.0) - 5.0; // Loop across plane
    
    // Bass → flicker noise
    float bassFlicker = sin(uTime * 4.0 + particleIndex * 2.0) * uBass * 0.01;
    upwardY += bassFlicker;
    
    // High → sparkle jitter (handled in fragment)
    
    // Spread particles across X
    float particleX = (particleIndex / 200.0) * 18.0 - 9.0; // -9 to 9 range
    float particleZ = -6.0 + sin(particleIndex * 0.1) * 0.2; // Slight Z variation
    
    // Radius: 0.01-0.015
    float particleRadius = 0.0125;
    
    pos = vec3(particleX, upwardY * breathAmplitude, particleZ);
    pos *= particleRadius; // Scale particle size
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

