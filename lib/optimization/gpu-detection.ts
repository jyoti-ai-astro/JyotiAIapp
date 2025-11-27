/**
 * GPU Detection & Performance Tier (Phase 30 - F45)
 * 
 * Detects GPU capabilities and sets performance tier
 */

export type PerformanceTier = 'low' | 'mid' | 'high';

interface GPUInfo {
  tier: PerformanceTier;
  renderer?: string;
  vendor?: string;
  isMobile: boolean;
  hardwareConcurrency: number;
}

let cachedGPUInfo: GPUInfo | null = null;

/**
 * Detect GPU and performance tier
 */
export function detectGPU(): GPUInfo {
  if (cachedGPUInfo) {
    return cachedGPUInfo;
  }

  if (typeof window === 'undefined') {
    return {
      tier: 'mid',
      isMobile: false,
      hardwareConcurrency: 4,
    };
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  let tier: PerformanceTier = 'mid';
  let renderer: string | undefined;
  let vendor: string | undefined;
  
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      
      // Phase 30 - F45: Determine tier based on GPU
      const rendererLower = renderer.toLowerCase();
      if (
        rendererLower.includes('intel') ||
        rendererLower.includes('mali') ||
        rendererLower.includes('adreno 3') ||
        rendererLower.includes('adreno 4') ||
        rendererLower.includes('powerVR')
      ) {
        tier = 'low';
      } else if (
        rendererLower.includes('nvidia') ||
        rendererLower.includes('amd') ||
        rendererLower.includes('radeon') ||
        rendererLower.includes('geforce') ||
        rendererLower.includes('rtx') ||
        rendererLower.includes('adreno 6') ||
        rendererLower.includes('adreno 7')
      ) {
        tier = 'high';
      }
    }
  }

  // Phase 30 - F45: Adjust based on hardware concurrency
  const cores = navigator.hardwareConcurrency || 4;
  if (cores < 4) {
    tier = 'low';
  } else if (cores >= 8 && tier === 'mid') {
    tier = 'high';
  }

  // Phase 30 - F45: Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isMobile && tier === 'high') {
    tier = 'mid'; // Cap mobile at mid tier
  }

  cachedGPUInfo = {
    tier,
    renderer,
    vendor,
    isMobile,
    hardwareConcurrency: cores,
  };

  return cachedGPUInfo;
}

/**
 * Get performance settings based on tier
 */
export function getPerformanceSettings(tier: PerformanceTier) {
  switch (tier) {
    case 'low':
      return {
        enableBloom: false,
        enableFilmGrain: false,
        particleDensity: 0.5,
        starCount: 20000,
        enablePostProcessing: false,
      };
    case 'mid':
      return {
        enableBloom: true,
        enableFilmGrain: false,
        particleDensity: 0.75,
        starCount: 30000,
        enablePostProcessing: true,
      };
    case 'high':
      return {
        enableBloom: true,
        enableFilmGrain: true,
        particleDensity: 1.0,
        starCount: 42500,
        enablePostProcessing: true,
      };
  }
}

