/**
 * Kundalini Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 */

export const kundaliniVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uBreath;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uChakraPulse;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWaveHeight;
varying float vChakraIntensity;

// Noise functions
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // ============================================
  // LAYER 1: BASE SINE WAVE DISPLACEMENT
  // ============================================
  float baseWave = sin(pos.y * 2.2 + uTime * 1.4) * 0.3;
  baseWave *= (1.0 + uBass * 0.5);  // uBass increases wave height
  pos.x += baseWave;
  
  // ============================================
  // LAYER 2: CHAKRA SERPENTINE MOTION (8 harmonic layers)
  // ============================================
  float serpentine = 0.0;
  float frequency = 2.2;
  float speed = 1.4;
  
  // 8 harmonic layers
  for (int i = 0; i < 8; i++) {
    float harmonic = float(i + 1);
    float amp = 0.3 / harmonic;
    float freq = frequency * harmonic;
    float spd = speed * (1.0 + float(i) * 0.1);
    
    serpentine += sin(pos.y * freq + uTime * spd) * amp;
    
    // uHigh increases serpentine frequency
    serpentine += sin(pos.y * freq * (1.0 + uHigh * 0.3) + uTime * spd) * amp * 0.5;
  }
  
  pos.x += serpentine;
  
  // ============================================
  // LAYER 3: FRACTAL FBM DISTORTION
  // ============================================
  float fbmDistortion = fbm(pos * 0.1 + uTime * 0.1);
  // uMid increases turbulence
  fbmDistortion *= (1.0 + uMid * 0.4);
  pos += normal * fbmDistortion * 0.5;
  
  // ============================================
  // LAYER 4: BREATH SWELLING DISTORTION
  // ============================================
  float breathWave = sin(uBreath) * 0.2;
  pos.y += breathWave;
  pos.x += breathWave * 0.3;
  
  // ============================================
  // LAYER 5: ORBIT-SWAY DISTORTION
  // ============================================
  float orbitSway = sin(uTime * 0.3) * 0.1;
  pos.x += orbitSway;
  
  // ============================================
  // PARALLAX WARP FROM MOUSE
  // ============================================
  float parallaxX = uMouse.x * 0.1;
  float parallaxY = uMouse.y * 0.1;
  pos.xy += vec2(parallaxX, parallaxY);
  
  // ============================================
  // SCROLL AFFECTS FORWARD MOTION
  // ============================================
  pos.z += uScroll * 0.5;
  
  // ============================================
  // CHAKRA PULSE INTENSITY
  // ============================================
  vChakraIntensity = uChakraPulse;
  vWaveHeight = abs(baseWave + serpentine);
  
  vPosition = pos;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

