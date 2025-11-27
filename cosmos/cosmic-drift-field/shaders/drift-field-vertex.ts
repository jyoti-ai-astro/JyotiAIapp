/**
 * Cosmic Drift Field Vertex Shader
 * 
 * Phase 2 — Section 45: COSMIC DRIFT FIELD ENGINE
 * Cosmic Drift Field Engine (E49)
 * 
 * Deep drift nebula layer, mid-depth drift currents, drift dust particles, breath pulse, scroll parallax, bass jitter, high shimmer, cameraFOV
 */

export const driftFieldVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float nebulaIndex;
attribute float flowIndex;
attribute float dustIndex;

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
varying float vNebulaIndex;
varying float vFlowIndex;
varying float vDustIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vNebulaHeight;
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

// ============================================
// NEBULA FBM FUNCTION
// ============================================
float nebulaFbm(vec2 xz, float time) {
  // Nebula fbm noise:
  // nebula1 = fbm(uv * 2.0 + time * 0.12)
  // nebula2 = fbm(uv * 4.0 + time * 0.06)
  // combined = nebula1 * 0.6 + nebula2 * 0.4
  float nebula1 = fbm(xz * 2.0 + time * 0.12);
  float nebula2 = fbm(xz * 4.0 + time * 0.06);
  
  return nebula1 * 0.6 + nebula2 * 0.4;
}

// ============================================
// FLOW FUNCTION
// ============================================
float flowFunction(vec2 xz, float time, float rotationSync) {
  // Flow equation:
  // flow = sin(x * 0.8 + time * 0.4) * 0.1 +
  //        sin(z * 0.6 + time * 0.25) * 0.07
  float flow1 = sin(xz.x * 0.8 + time * 0.4) * 0.1;
  float flow2 = sin(xz.y * 0.6 + time * 0.25) * 0.07;
  
  // RotationSync → direction tilt
  float tilt = rotationSync * 0.3;
  flow1 += tilt * 0.05;
  
  return flow1 + flow2;
}

void main() {
  vUv = uv;
  vNebulaIndex = nebulaIndex;
  vFlowIndex = flowIndex;
  vDustIndex = dustIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: DEEP DRIFT NEBULA LAYER
  // ============================================
  if (nebulaIndex >= 0.0) {
    // Huge plane: 24 × 14 units, grid 40×40
    float planeWidth = 24.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Apply parallax drift: pos.x += uScroll * 0.15
    float parallaxDriftX = uScroll * 0.15;
    float parallaxDriftZ = uScroll * 0.1;
    xz.x += parallaxDriftX;
    xz.y += parallaxDriftZ;
    
    // Sample nebula fbm
    float nebulaValue = nebulaFbm(xz, uTime);
    
    // Breath → slow brightness pulse (handled in fragment)
    
    // Bass → micro warp jitter
    float bassJitter = sin(uTime * 3.0 + xz.x * 0.5) * uBass * 0.01;
    xz.x += bassJitter;
    xz.y += bassJitter * 0.5;
    
    // High → nebula shimmer (handled in fragment)
    
    // Position with nebula displacement
    pos = vec3(xz.x, nebulaValue * 0.2, xz.y - 6.5);
    
    vNebulaHeight = nebulaValue;
    vGradientProgress = nebulaValue; // 0-1 based on nebula value
  }
  
  // ============================================
  // LAYER B: MID-DEPTH DRIFT CURRENTS
  // ============================================
  if (flowIndex >= 0.0) {
    // Transparent flow lines drifting diagonally
    float planeWidth = 24.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample flow
    float baseFlow = flowFunction(xz, uTime, uRotationSync);
    
    // Breath → amplitude broadening
    float breathBroadening = 1.0 + uBreathStrength * 0.15;
    baseFlow *= breathBroadening;
    
    // Scroll → flow acceleration
    float scrollAccel = 1.0 + uScroll * 0.2;
    baseFlow *= scrollAccel;
    
    // Bass → ripple vibration
    float bassRipple = sin(uTime * 4.0 + xz.x * 0.8) * uBass * 0.02;
    baseFlow += bassRipple;
    
    // High → edge streak noise (handled in fragment)
    
    // Position with flow displacement
    pos = vec3(xz.x, baseFlow, xz.y - 6.5);
    
    vNebulaHeight = baseFlow;
  }
  
  // ============================================
  // LAYER C: DRIFT DUST PARTICLES
  // ============================================
  if (dustIndex >= 0.0) {
    // 150-260 particles (mobile: 100)
    // Slow XZ drifting:
    // x = baseX + sin(time * speed + index * 0.3) * 0.6
    // z = baseZ + cos(time * speed + index * 0.4) * 0.6
    
    // Breath → vertical amplitude
    float breathAmplitude = 1.0 + uBreathStrength * 0.15;
    
    // Upward float:
    // y = mod(time * 0.1 + offset + scroll * 0.2, 8.0) - 4.0
    float offset = dustIndex * 0.05;
    float scrollDrift = uScroll * 0.2;
    float upwardY = mod(uTime * 0.1 + offset + scrollDrift, 8.0) - 4.0;
    upwardY *= breathAmplitude;
    
    // X/Z sinusoidal drift
    float speed = 0.15 + (dustIndex / 260.0) * 0.1; // Varying speeds
    float baseX = (dustIndex / 260.0) * 24.0 - 12.0; // Spread across X
    float baseZ = -6.5;
    
    float driftX = sin(uTime * speed + dustIndex * 0.3) * 0.6;
    float driftZ = cos(uTime * speed + dustIndex * 0.4) * 0.6;
    
    float x = baseX + driftX;
    float z = baseZ + driftZ;
    
    // Bass → flicker sparkle (handled in fragment)
    
    // High → shimmer noise (handled in fragment)
    
    // Radius: 0.01-0.015
    float dustRadius = 0.0125;
    
    pos = vec3(x, upwardY, z);
    pos *= dustRadius; // Scale particle size
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

