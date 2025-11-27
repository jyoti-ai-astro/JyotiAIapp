/**
 * Godray Pass
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Lens & Bloom Engine (E12)
 * 
 * Radial blur godray effect using Solar Rays as mask
 * Implemented as a custom Effect component
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const godrayFragmentShader = `
precision highp float;

uniform sampler2D inputTexture;
uniform vec2 uCenter;
uniform float uIntensity;
uniform float uScroll;
uniform float uHigh;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(inputTexture, vUv);
  
  // Radial blur centered at (0,0)
  vec2 dir = normalize(vUv - uCenter);
  
  // Scroll → increases ray length
  float rayLength = 0.1 + uScroll * 0.3;
  
  // High frequencies → ray flicker
  float flicker = sin(uTime * 10.0) * 0.5 + 0.5;
  flicker = 1.0 + (flicker - 0.5) * uHigh * 0.2;
  
  // Radial blur samples
  vec3 rayColor = vec3(0.0);
  float samples = 8.0;
  for (float i = 0.0; i < samples; i += 1.0) {
    vec2 sampleUV = vUv - dir * rayLength * (i / samples) * flicker;
    rayColor += texture2D(inputTexture, sampleUV).rgb;
  }
  rayColor /= samples;
  
  // Blend with original
  vec3 finalColor = color.rgb + rayColor * uIntensity;
  
  gl_FragColor = vec4(finalColor, color.a);
}
`;

export class GodrayPass extends Effect {
  constructor({
    intensity = 0.3,
    center = new Vector2(0.5, 0.5),
    scroll = 0,
    high = 0,
  } = {}) {
    super('GodrayPass', godrayFragmentShader, {
      blendFunction: BlendFunction.SCREEN,
      uniforms: new Map([
        ['uCenter', new Uniform(center)],
        ['uIntensity', new Uniform(intensity)],
        ['uScroll', new Uniform(scroll)],
        ['uHigh', new Uniform(high)],
        ['uTime', new Uniform(0)],
      ]),
    });
  }

  setIntensity(value: number) {
    this.uniforms.get('uIntensity')!.value = value;
  }

  setScroll(value: number) {
    this.uniforms.get('uScroll')!.value = value;
  }

  setHigh(value: number) {
    this.uniforms.get('uHigh')!.value = value;
  }

  update(renderer: any, inputBuffer: any, deltaTime: number) {
    const timeUniform = this.uniforms.get('uTime');
    if (timeUniform) {
      timeUniform.value += deltaTime;
    }
  }
}

