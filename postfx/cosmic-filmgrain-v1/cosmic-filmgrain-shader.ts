/**
 * Cosmic FilmGrain v1 Shader
 * 
 * Phase 3 — Section 6: COSMIC FILMGRAIN ENGINE v1
 * Cosmic FilmGrain Engine v1 (F6)
 * 
 * Analog Film Grain + Dithering + Chroma Noise + Cosmic Flicker with:
 * - Luma grain (film-style)
 * - Chromatic grain (separate RGB noisy grains)
 * - Gold-violet micro speckle (cosmic tint)
 * - Dither pattern (Bayer 8×8)
 * - Flicker noise (sin + noise)
 * - Audio-reactive grain density (bass → intensity)
 * - BlessingWave → golden flicker pulse
 * - CameraFOV compensation
 * - Mobile fallback: reduce grain size & disable chroma-noise
 */

export const cosmicFilmGrainShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uGrainIntensity: { value: 0.15 },
    uChromaIntensity: { value: 0.1 },
    uFlickerStrength: { value: 0.05 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uGrainSize: { value: 1.0 },
    uDisableChroma: { value: 0.0 }, // 1.0 = disable chroma noise (mobile)
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    precision highp float;
    
    uniform float uTime;
    uniform float uIntensity;
    uniform float uGrainIntensity;
    uniform float uChromaIntensity;
    uniform float uFlickerStrength;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uGrainSize;
    uniform float uDisableChroma;
    uniform sampler2D inputTexture;
    
    varying vec2 vUv;
    
    // ============================================
    // HASH FUNCTION (for noise)
    // ============================================
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    // ============================================
    // NOISE FUNCTION
    // ============================================
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    // ============================================
    // BAYER 8×8 DITHER PATTERN
    // ============================================
    float bayerDither(vec2 uv) {
      // 8×8 Bayer matrix
      float bayerMatrix[64];
      bayerMatrix[0] = 0.0 / 64.0;   bayerMatrix[1] = 32.0 / 64.0;  bayerMatrix[2] = 8.0 / 64.0;   bayerMatrix[3] = 40.0 / 64.0;
      bayerMatrix[4] = 2.0 / 64.0;   bayerMatrix[5] = 34.0 / 64.0;  bayerMatrix[6] = 10.0 / 64.0;  bayerMatrix[7] = 42.0 / 64.0;
      bayerMatrix[8] = 48.0 / 64.0;   bayerMatrix[9] = 16.0 / 64.0;  bayerMatrix[10] = 56.0 / 64.0; bayerMatrix[11] = 24.0 / 64.0;
      bayerMatrix[12] = 50.0 / 64.0; bayerMatrix[13] = 18.0 / 64.0; bayerMatrix[14] = 58.0 / 64.0; bayerMatrix[15] = 26.0 / 64.0;
      bayerMatrix[16] = 12.0 / 64.0; bayerMatrix[17] = 44.0 / 64.0;  bayerMatrix[18] = 4.0 / 64.0;  bayerMatrix[19] = 36.0 / 64.0;
      bayerMatrix[20] = 14.0 / 64.0; bayerMatrix[21] = 46.0 / 64.0;  bayerMatrix[22] = 6.0 / 64.0;  bayerMatrix[23] = 38.0 / 64.0;
      bayerMatrix[24] = 60.0 / 64.0; bayerMatrix[25] = 28.0 / 64.0; bayerMatrix[26] = 52.0 / 64.0; bayerMatrix[27] = 20.0 / 64.0;
      bayerMatrix[28] = 62.0 / 64.0; bayerMatrix[29] = 30.0 / 64.0; bayerMatrix[30] = 54.0 / 64.0; bayerMatrix[31] = 22.0 / 64.0;
      bayerMatrix[32] = 3.0 / 64.0;  bayerMatrix[33] = 35.0 / 64.0;  bayerMatrix[34] = 11.0 / 64.0; bayerMatrix[35] = 43.0 / 64.0;
      bayerMatrix[36] = 1.0 / 64.0;  bayerMatrix[37] = 33.0 / 64.0;  bayerMatrix[38] = 9.0 / 64.0;  bayerMatrix[39] = 41.0 / 64.0;
      bayerMatrix[40] = 51.0 / 64.0; bayerMatrix[41] = 19.0 / 64.0; bayerMatrix[42] = 59.0 / 64.0; bayerMatrix[43] = 27.0 / 64.0;
      bayerMatrix[44] = 49.0 / 64.0; bayerMatrix[45] = 17.0 / 64.0; bayerMatrix[46] = 57.0 / 64.0; bayerMatrix[47] = 25.0 / 64.0;
      bayerMatrix[48] = 15.0 / 64.0; bayerMatrix[49] = 47.0 / 64.0; bayerMatrix[50] = 7.0 / 64.0;  bayerMatrix[51] = 39.0 / 64.0;
      bayerMatrix[52] = 13.0 / 64.0; bayerMatrix[53] = 45.0 / 64.0; bayerMatrix[54] = 5.0 / 64.0;  bayerMatrix[55] = 37.0 / 64.0;
      bayerMatrix[56] = 63.0 / 64.0; bayerMatrix[57] = 31.0 / 64.0; bayerMatrix[58] = 55.0 / 64.0; bayerMatrix[59] = 23.0 / 64.0;
      bayerMatrix[60] = 61.0 / 64.0; bayerMatrix[61] = 29.0 / 64.0; bayerMatrix[62] = 53.0 / 64.0; bayerMatrix[63] = 21.0 / 64.0;
      
      vec2 scaledUV = uv * uResolution / uGrainSize;
      ivec2 coord = ivec2(mod(scaledUV, 8.0));
      int index = coord.x + coord.y * 8;
      
      return bayerMatrix[index];
    }
    
    // ============================================
    // LUMA GRAIN (Film-Style)
    // ============================================
    float lumaGrain(vec2 uv) {
      vec2 grainUV = uv * uResolution / uGrainSize;
      float grain = noise(grainUV + uTime * 0.1);
      grain = grain * 2.0 - 1.0; // -1 to 1
      
      // Audio-reactive grain density: bass → intensity
      float density = uGrainIntensity * (1.0 + uBass * 0.3);
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      density *= fovFactor;
      
      return grain * density;
    }
    
    // ============================================
    // CHROMATIC GRAIN (Separate RGB Noisy Grains)
    // ============================================
    vec3 chromaGrain(vec2 uv) {
      if (uDisableChroma > 0.5) return vec3(0.0);
      
      vec2 grainUV = uv * uResolution / uGrainSize;
      
      // Separate noise for each channel
      float rGrain = noise(grainUV + vec2(0.0, uTime * 0.1));
      float gGrain = noise(grainUV + vec2(1.0, uTime * 0.1));
      float bGrain = noise(grainUV + vec2(2.0, uTime * 0.1));
      
      rGrain = rGrain * 2.0 - 1.0;
      gGrain = gGrain * 2.0 - 1.0;
      bGrain = bGrain * 2.0 - 1.0;
      
      // Audio-reactive chroma intensity
      float chromaDensity = uChromaIntensity * (1.0 + uMid * 0.2);
      
      return vec3(rGrain, gGrain, bGrain) * chromaDensity;
    }
    
    // ============================================
    // GOLD-VIOLET MICRO SPECKLE (Cosmic Tint)
    // ============================================
    vec3 cosmicSpeckle(vec2 uv) {
      vec2 speckleUV = uv * uResolution / (uGrainSize * 2.0);
      float speckle = noise(speckleUV + uTime * 0.05);
      
      // Gold-violet tint
      vec3 gold = vec3(1.0, 0.9, 0.7);
      vec3 violet = vec3(0.8, 0.7, 1.0);
      
      float tintMix = sin(uTime * 0.5) * 0.5 + 0.5;
      vec3 tint = mix(gold, violet, tintMix);
      
      return tint * speckle * 0.05;
    }
    
    // ============================================
    // FLICKER NOISE (Sin + Noise)
    // ============================================
    float flickerNoise() {
      // Sin-based flicker
      float sinFlicker = sin(uTime * 3.0) * 0.5 + 0.5;
      
      // Noise-based flicker
      float noiseFlicker = noise(vec2(uTime * 0.5, 0.0));
      
      // Combine
      float flicker = mix(sinFlicker, noiseFlicker, 0.5);
      flicker = flicker * 2.0 - 1.0; // -1 to 1
      
      return flicker * uFlickerStrength;
    }
    
    // ============================================
    // BLESSING WAVE GOLDEN FLICKER PULSE
    // ============================================
    float blessingFlicker() {
      if (uBlessingWaveProgress <= 0.0) return 0.0;
      
      // Golden flicker pulse
      float pulse = sin(uTime * 5.0 + uBlessingWaveProgress * 6.28318) * 0.5 + 0.5;
      pulse *= uBlessingWaveProgress;
      
      return pulse * 0.3;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      vec3 color = inputColor.rgb;
      
      // Luma grain
      float luma = lumaGrain(uv);
      color += luma;
      
      // Chromatic grain
      vec3 chroma = chromaGrain(uv);
      color += chroma;
      
      // Gold-violet micro speckle
      vec3 speckle = cosmicSpeckle(uv);
      color += speckle;
      
      // Dither pattern
      float dither = bayerDither(uv);
      dither = dither * 2.0 - 1.0; // -1 to 1
      color += dither * 0.02;
      
      // Flicker noise
      float flicker = flickerNoise();
      color += flicker;
      
      // Blessing wave golden flicker pulse
      float blessingFlick = blessingFlicker();
      vec3 goldenFlick = vec3(1.0, 0.9, 0.6) * blessingFlick;
      color += goldenFlick;
      
      // Apply intensity
      color = mix(inputColor.rgb, color, uIntensity);
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, inputColor.a);
    }
  `,
};

