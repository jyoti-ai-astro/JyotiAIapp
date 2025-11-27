/**
 * UI Raymarch Vertex Shader
 * 
 * Phase 2 — Section 15: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Cosmic UI Raymarch Overlay Engine (E19)
 * 
 * Fullscreen quad with parallax warp
 */

export const uiRaymarchVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform vec2 uMouse;
uniform float uCameraFOV;

varying vec2 vUv;
varying vec2 vScreenPos;

void main() {
  vUv = uv;
  
  // Screen position (-1 to 1)
  vScreenPos = (uv - 0.5) * 2.0;
  
  // Parallax warp using mouse and camera FOV
  vec2 parallaxOffset = uMouse * 0.02 * (uCameraFOV / 50.0);
  vec3 pos = position;
  pos.xy += parallaxOffset;
  
  gl_Position = vec4(pos, 1.0);
}
`;

