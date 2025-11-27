/**
 * Cosmic ColorGrade v1 Shader
 * 
 * Phase 3 — Section 13: COSMIC COLORGRADE ENGINE v1
 * Cosmic ColorGrade Engine v1 (F13)
 * 
 * Cosmic ACES + LUT-Based Color Grading with:
 * - ACES-like tone mapping curve
 * - Gold-violet cosmic color LUT blend (param: lutStrength)
 * - Temperature (warm/cool shift)
 * - Tint (green-magenta shift)
 * - Contrast + lift + gamma + gain
 * - Vibrance boost (audio-reactive: high → vibrance)
 * - Saturation
 * - Highlight rolloff and filmic shoulder
 * - Lifted blacks (filmic fade)
 * - BlessingWave → white-gold wash pulse
 * - CameraFOV compensation
 * - Mobile fallback: reduced LUT strength, reduced vibrance
 */

export const cosmicColorGradeShader = {
  uniforms: {
    uTime: { value: 0 },
    uLutStrength: { value: 0.3 },
    uTemperature: { value: 0.0 },
    uTint: { value: 0.0 },
    uContrast: { value: 1.0 },
    uGamma: { value: 1.0 },
    uSaturation: { value: 1.0 },
    uVibrance: { value: 1.0 },
    uFade: { value: 0.0 },
    uRolloff: { value: 0.5 },
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
    uniform float uLutStrength;
    uniform float uTemperature;
    uniform float uTint;
    uniform float uContrast;
    uniform float uGamma;
    uniform float uSaturation;
    uniform float uVibrance;
    uniform float uFade;
    uniform float uRolloff;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    
    // ============================================
    // ACES-LIKE TONE MAPPING CURVE
    // ============================================
    vec3 acesToneMap(vec3 color) {
      // ACES-like approximation
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      
      return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
    }
    
    // ============================================
    // GOLD-VIOLET COSMIC COLOR LUT BLEND
    // ============================================
    vec3 cosmicLUT(vec3 color) {
      // Gold-violet cosmic color grading
      // Gold tint for warm areas
      vec3 goldTint = vec3(1.0, 0.95, 0.85);
      // Violet tint for cool areas
      vec3 violetTint = vec3(0.9, 0.85, 1.0);
      
      // Blend based on luminance
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      float blendFactor = smoothstep(0.3, 0.7, luminance);
      
      // Mix gold and violet
      vec3 cosmicTint = mix(goldTint, violetTint, blendFactor);
      
      // Apply LUT blend
      return mix(color, color * cosmicTint, uLutStrength);
    }
    
    // ============================================
    // TEMPERATURE (Warm/Cool Shift)
    // ============================================
    vec3 applyTemperature(vec3 color, float temp) {
      // Temperature shift: positive = warm, negative = cool
      vec3 warm = vec3(1.0, 0.95, 0.9);
      vec3 cool = vec3(0.9, 0.95, 1.0);
      
      float t = temp * 0.5 + 0.5; // -1 to 1 → 0 to 1
      vec3 tempTint = mix(cool, warm, t);
      
      return color * tempTint;
    }
    
    // ============================================
    // TINT (Green-Magenta Shift)
    // ============================================
    vec3 applyTint(vec3 color, float tint) {
      // Tint shift: positive = magenta, negative = green
      vec3 green = vec3(0.9, 1.0, 0.9);
      vec3 magenta = vec3(1.0, 0.9, 1.0);
      
      float t = tint * 0.5 + 0.5; // -1 to 1 → 0 to 1
      vec3 tintShift = mix(green, magenta, t);
      
      return color * tintShift;
    }
    
    // ============================================
    // CONTRAST + LIFT + GAMMA + GAIN
    // ============================================
    vec3 applyContrastLiftGammaGain(vec3 color) {
      // Lift (black point adjustment)
      float lift = uFade * 0.1;
      color = color + lift;
      
      // Gain (white point adjustment)
      float gain = 1.0 + uRolloff * 0.2;
      color = color * gain;
      
      // Contrast
      color = (color - 0.5) * uContrast + 0.5;
      
      // Gamma
      color = pow(color, vec3(1.0 / uGamma));
      
      return color;
    }
    
    // ============================================
    // VIBRANCE BOOST (Audio-Reactive: High → Vibrance)
    // ============================================
    vec3 applyVibrance(vec3 color) {
      // Audio-reactive vibrance: high → vibrance
      float vibrance = uVibrance * (1.0 + uHigh * 0.2);
      
      // Vibrance: boost saturation of less saturated colors
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      vec3 saturated = color;
      
      // Calculate saturation
      float maxChannel = max(max(color.r, color.g), color.b);
      float minChannel = min(min(color.r, color.g), color.b);
      float saturation = (maxChannel - minChannel) / max(maxChannel, 0.001);
      
      // Boost less saturated colors
      float vibranceFactor = (1.0 - saturation) * vibrance;
      saturated = mix(color, mix(vec3(luminance), color, 1.0 + vibranceFactor), 1.0);
      
      return saturated;
    }
    
    // ============================================
    // SATURATION
    // ============================================
    vec3 applySaturation(vec3 color) {
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(vec3(luminance), color, uSaturation);
    }
    
    // ============================================
    // HIGHLIGHT ROLLOFF AND FILMIC SHOULDER
    // ============================================
    vec3 applyHighlightRolloff(vec3 color) {
      // Filmic shoulder for highlight rolloff
      float shoulder = uRolloff;
      
      // Apply shoulder curve to highlights
      vec3 shoulderCurve = color / (color + shoulder);
      
      // Blend with original
      float highlightMask = smoothstep(0.7, 1.0, max(max(color.r, color.g), color.b));
      color = mix(color, shoulderCurve, highlightMask * 0.5);
      
      return color;
    }
    
    // ============================================
    // LIFTED BLACKS (Filmic Fade)
    // ============================================
    vec3 applyLiftedBlacks(vec3 color) {
      // Lift blacks (filmic fade)
      float fade = uFade;
      
      // Lift black point
      color = color + fade * 0.1;
      
      return color;
    }
    
    // ============================================
    // BLESSING WAVE WHITE-GOLD WASH PULSE
    // ============================================
    vec3 blessingWhiteGoldWash(vec3 color) {
      if (uBlessingWaveProgress <= 0.0) return color;
      
      // White-gold wash pulse
      float wash = uBlessingWaveProgress;
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 3.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      wash *= pulse;
      
      // White-gold tint
      vec3 whiteGold = vec3(1.0, 0.98, 0.92);
      
      // Apply wash
      color = mix(color, color * whiteGold, wash * 0.3);
      
      return color;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec3 color = inputColor.rgb;
      
      // Apply ACES-like tone mapping curve
      color = acesToneMap(color);
      
      // Apply gold-violet cosmic color LUT blend
      color = cosmicLUT(color);
      
      // Apply temperature (warm/cool shift)
      color = applyTemperature(color, uTemperature);
      
      // Apply tint (green-magenta shift)
      color = applyTint(color, uTint);
      
      // Apply contrast + lift + gamma + gain
      color = applyContrastLiftGammaGain(color);
      
      // Apply vibrance boost (audio-reactive: high → vibrance)
      color = applyVibrance(color);
      
      // Apply saturation
      color = applySaturation(color);
      
      // Apply highlight rolloff and filmic shoulder
      color = applyHighlightRolloff(color);
      
      // Apply lifted blacks (filmic fade)
      color = applyLiftedBlacks(color);
      
      // Blessing wave white-gold wash pulse
      color = blessingWhiteGoldWash(color);
      
      // FOV compensation (subtle)
      float fovFactor = uCameraFOV / 75.0;
      color = mix(color, color * fovFactor, 0.1);
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      outputColor = vec4(color, inputColor.a);
    }
  `,
};

