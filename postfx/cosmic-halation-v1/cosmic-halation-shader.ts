/**
 * Cosmic Halation v1 Shader
 * 
 * Phase 3 — Section 8: COSMIC HALATION ENGINE v1
 * Cosmic Halation Engine v1 (F8)
 * 
 * Cinematic Halation Glow + Red-Channel Bloom + Film Halo Diffusion with:
 * - Red-channel halation diffusion (film-style)
 * - Color-channel bleed (R→G, R→B)
 * - Lens diffusion halo around bright areas
 * - Warm film halo (golden tint)
 * - Bloom mask interaction (reads bright buffer)
 * - BlessingWave → warm film flash
 * - Audio-reactive halo width + tint strength
 * - CameraFOV compensation
 * - Mobile fallback: reduce diffusion radius
 */

export const cosmicHalationShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uHalationIntensity: { value: 0.2 },
    uRadius: { value: 0.3 },
    uTintStrength: { value: 0.15 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
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
    uniform float uHalationIntensity;
    uniform float uRadius;
    uniform float uTintStrength;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform sampler2D inputTexture;
    
    varying vec2 vUv;
    
    // ============================================
    // BRIGHT PIXEL EXTRACTION (Bloom Mask)
    // ============================================
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - 0.7);
    }
    
    // ============================================
    // GAUSSIAN BLUR (for diffusion)
    // ============================================
    vec4 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction, float radius) {
      vec4 color = vec4(0.0);
      float weights[9];
      weights[0] = 0.01621622;
      weights[1] = 0.05405405;
      weights[2] = 0.12162162;
      weights[3] = 0.19459459;
      weights[4] = 0.22702703;
      weights[5] = 0.19459459;
      weights[6] = 0.12162162;
      weights[7] = 0.05405405;
      weights[8] = 0.01621622;
      
      vec2 texelSize = 1.0 / uResolution;
      vec2 offset = direction * texelSize * radius;
      
      for (int i = 0; i < 9; i++) {
        float weight = weights[i];
        vec2 sampleUV = uv + offset * (float(i) - 4.0);
        color += texture2D(tex, sampleUV) * weight;
      }
      
      return color;
    }
    
    // ============================================
    // RED-CHANNEL HALATION DIFFUSION (Film-Style)
    // ============================================
    vec3 redChannelHalation(vec2 uv, float brightness) {
      if (brightness <= 0.0) return vec3(0.0);
      
      // Audio-reactive halo width: bass → wider halation
      float haloWidth = uRadius * (1.0 + uBass * 0.3);
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      haloWidth *= fovFactor;
      
      // Blur red channel
      vec4 blurH = gaussianBlur(inputTexture, uv, vec2(1.0, 0.0), haloWidth);
      vec4 blurV = gaussianBlur(inputTexture, uv, vec2(0.0, 1.0), haloWidth);
      vec4 blurred = (blurH + blurV) * 0.5;
      
      // Extract red channel halation
      float redHalation = blurred.r * brightness;
      
      return vec3(redHalation, 0.0, 0.0) * uHalationIntensity;
    }
    
    // ============================================
    // COLOR-CHANNEL BLEED (R→G, R→B)
    // ============================================
    vec3 colorChannelBleed(vec2 uv, float brightness) {
      if (brightness <= 0.0) return vec3(0.0);
      
      // Sample input
      vec4 inputColor = texture2D(inputTexture, uv);
      
      // Red channel bleed to green and blue
      float redBleed = inputColor.r * brightness;
      
      // R→G bleed (warm)
      float greenBleed = redBleed * 0.3;
      
      // R→B bleed (cool)
      float blueBleed = redBleed * 0.2;
      
      return vec3(0.0, greenBleed, blueBleed) * uHalationIntensity * 0.5;
    }
    
    // ============================================
    // LENS DIFFUSION HALO (Around Bright Areas)
    // ============================================
    vec3 lensDiffusionHalo(vec2 uv, float brightness) {
      if (brightness <= 0.0) return vec3(0.0);
      
      // Audio-reactive halo width: mid → halo width
      float haloWidth = uRadius * (1.0 + uMid * 0.2);
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      haloWidth *= fovFactor;
      
      // Radial blur for halo
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Sample in radial direction
      vec2 direction = normalize(offset);
      vec2 sampleUV = uv + direction * haloWidth;
      
      if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) {
        return vec3(0.0);
      }
      
      vec4 haloColor = texture2D(inputTexture, sampleUV);
      float haloBrightness = extractBrightness(haloColor);
      
      // Radial falloff
      float halo = 1.0 / (1.0 + distance * 5.0);
      halo *= haloBrightness * brightness;
      
      return haloColor.rgb * halo * uHalationIntensity * 0.4;
    }
    
    // ============================================
    // WARM FILM HALO (Golden Tint)
    // ============================================
    vec3 warmFilmHalo(vec2 uv, float brightness) {
      if (brightness <= 0.0) return vec3(0.0);
      
      // Audio-reactive tint strength: high → tint strength
      float tint = uTintStrength * (1.0 + uHigh * 0.15);
      
      // Golden tint
      vec3 goldenTint = vec3(1.0, 0.95, 0.85);
      
      // Apply warm halo
      vec3 halo = goldenTint * brightness * tint;
      
      return halo;
    }
    
    // ============================================
    // BLESSING WAVE WARM FILM FLASH
    // ============================================
    vec3 blessingFilmFlash(vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      // Sample input
      vec4 inputColor = texture2D(inputTexture, uv);
      float brightness = extractBrightness(inputColor);
      
      // Warm film flash
      float flash = uBlessingWaveProgress;
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 3.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      flash *= pulse;
      
      // Warm golden flash
      vec3 warmFlash = vec3(1.0, 0.9, 0.7) * flash * brightness;
      
      return warmFlash * 0.5;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      vec3 color = inputColor.rgb;
      
      // Extract brightness for bloom mask interaction
      float brightness = extractBrightness(inputColor);
      
      // Red-channel halation diffusion
      vec3 redHalation = redChannelHalation(uv, brightness);
      
      // Color-channel bleed (R→G, R→B)
      vec3 colorBleed = colorChannelBleed(uv, brightness);
      
      // Lens diffusion halo
      vec3 diffusionHalo = lensDiffusionHalo(uv, brightness);
      
      // Warm film halo
      vec3 warmHalo = warmFilmHalo(uv, brightness);
      
      // Blessing wave warm film flash
      vec3 blessingFlash = blessingFilmFlash(uv);
      
      // Combine all halation effects
      vec3 halation = redHalation + colorBleed + diffusionHalo + warmHalo + blessingFlash;
      
      // Apply intensity
      halation *= uIntensity;
      
      // Composite with input (additive blending)
      vec3 finalColor = color + halation;
      
      // Clamp
      finalColor = clamp(finalColor, 0.0, 1.0);
      
      gl_FragColor = vec4(finalColor, inputColor.a);
    }
  `,
};

