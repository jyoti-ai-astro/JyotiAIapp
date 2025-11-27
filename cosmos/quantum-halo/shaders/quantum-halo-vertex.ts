/**
 * Quantum Halo Vertex Shader
 * 
 * Phase 2 — Section 48: QUANTUM HALO ENGINE
 * Quantum Halo Engine (E52)
 * 
 * Primary quantum rings, quantum phase echo rings, quantum halo sparks, breath pulse, scroll rotation, bass jitter, high shimmer, cameraFOV
 */

export const quantumHaloVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float ringIndex;
attribute float echoRingIndex;
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
varying float vRingIndex;
varying float vEchoRingIndex;
varying float vSparkIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vRingPulse;
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
// RING PULSE FUNCTION
// ============================================
float ringPulseFunction(float angle, float radius, float time) {
  // Equation:
  // ringPulse = sin(time*0.8 + radius*1.5) * 0.08
  // noise = fbm(vec2(angle*3.0, radius*1.2)+time*0.2)*0.06
  // combined = ringPulse + noise
  float ringPulse = sin(time * 0.8 + radius * 1.5) * 0.08;
  float noise = fbm(vec2(angle * 3.0, radius * 1.2) + time * 0.2) * 0.06;
  
  return ringPulse + noise;
}

// ============================================
// ECHO RING FUNCTION
// ============================================
float echoRingFunction(float angle, float radius, float time, float rotationSync) {
  // Phase delay: angleShift = time*0.2 + radius*0.4
  float angleShift = time * 0.2 + radius * 0.4;
  
  // Equation:
  // echo = sin(angle*2.2 + angleShift)*0.1
  // turbulence = fbm(vec2(radius*0.9, angle*4.0)+time*0.3)*0.08
  float echo = sin(angle * 2.2 + angleShift) * 0.1;
  float turbulence = fbm(vec2(radius * 0.9, angle * 4.0) + time * 0.3) * 0.08;
  
  // RotationSync → skew offset
  float skew = rotationSync * 0.3;
  echo += sin(angle * 1.5 + angleShift + skew) * 0.03;
  
  return echo + turbulence;
}

void main() {
  vUv = uv;
  vRingIndex = ringIndex;
  vEchoRingIndex = echoRingIndex;
  vSparkIndex = sparkIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY QUANTUM RINGS
  // ============================================
  if (ringIndex >= 0.0) {
    // 3-5 concentric luminous rings
    // Radius: 2.0 → 6.0 units
    // Angle: 0 → 2π
    // Thickness: 0.2
    
    float baseRadius = 2.0 + (ringIndex / 4.0) * 4.0; // 2.0 to 6.0
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.2;
    
    // Sample ring pulse
    float baseRingPulse = ringPulseFunction(angle, baseRadius, uTime);
    
    // Breath → ring expansion (scale pulse)
    float breathExpansion = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
    baseRadius *= breathExpansion;
    baseRingPulse *= breathExpansion;
    
    // Scroll → rotational drift (clockwise)
    float scrollRotation = -uScroll * 1.2; // Clockwise (negative)
    angle += scrollRotation;
    
    // Bass → jitter vibration
    float bassJitter = sin(uTime * 3.5 + angle * 2.5) * uBass * 0.02;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → shimmer scattering (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * (baseRadius + baseRingPulse);
    float z = sin(angle) * (baseRadius + baseRingPulse);
    float y = 0.0;
    
    pos = vec3(x, y, z - 7.2);
    
    vRingPulse = baseRingPulse;
    vGradientProgress = (baseRingPulse + 0.1) / 0.2; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER B: QUANTUM PHASE ECHO RINGS
  // ============================================
  if (echoRingIndex >= 0.0) {
    // Secondary delayed rings behind primary
    float baseRadius = 2.5 + (echoRingIndex / 2.0) * 3.5; // 2.5 to 6.0
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.2;
    
    // Sample echo ring
    float baseEcho = echoRingFunction(angle, baseRadius, uTime, uRotationSync);
    
    // Breath → echo broadening
    float breathBroadening = 1.0 + uBreathStrength * 0.12;
    baseEcho *= breathBroadening;
    
    // Mid → turbulence injection (already in echoRingFunction)
    float midTurbulence = fbm(vec2(baseRadius * 0.9, angle * 4.0) + uTime * 0.3) * uMid * 0.03;
    baseEcho += midTurbulence;
    
    // High → quantum flicker (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * (baseRadius + baseEcho);
    float z = sin(angle) * (baseRadius + baseEcho);
    float y = -0.1; // Slightly behind primary rings
    
    pos = vec3(x, y, z - 7.2);
    
    vRingPulse = baseEcho;
    vGradientProgress = (baseEcho + 0.15) / 0.3; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER C: QUANTUM HALO SPARKS
  // ============================================
  if (sparkIndex >= 0.0) {
    // 200-320 micro sparks (mobile: 150)
    // Orbiting motion around all rings
    
    // Equations:
    // angle = (time*speed)+offset
    // radius = baseRadius + sin(time*1.2 + index*0.5)*0.25
    
    float speed = 0.12 + (sparkIndex / 320.0) * 0.08; // Varying speeds
    float offset = sparkIndex * 0.03;
    float angle = (uTime * speed) + offset;
    
    // Base radius around rings
    float baseRadius = 2.0 + (sparkIndex / 320.0) * 4.0; // 2.0 to 6.0
    float radiusVariation = sin(uTime * 1.2 + sparkIndex * 0.5) * 0.25;
    float radius = baseRadius + radiusVariation;
    
    // Breath → radial expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // Bass → flicker jitter
    float bassJitter = sin(uTime * 4.0 + sparkIndex * 2.5) * uBass * 0.01;
    angle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → spark noise (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.5) * 0.08; // Slight vertical variation
    
    // Radius: 0.01-0.015
    float sparkRadius = 0.0125;
    
    pos = vec3(x, y, z - 7.2);
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

