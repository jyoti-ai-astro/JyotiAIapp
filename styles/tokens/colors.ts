/**
 * Color Tokens
 * 
 * Phase 3 — Section 14.2: Core Theme Colors (Cosmic Hybrid)
 * Phase 3 — Section 9: THEMING & COLOR TOKENS
 */

// Base Core Colors (Spiritual)
export const launchV1 = {
  surfaces: {
    canvas: '#FFF8E6',
    raised: '#FFFDF4',
    sunken: '#F5EAD0',
  },
  text: {
    primary: '#07131F',
    muted: '#56666A',
    inverse: '#FFF7E8',
  },
  brand: {
    navy: '#07131F',
    indigo: '#0B1D2C',
    saffron: '#F28C28',
    gold: '#C9A24A',
    lotus: '#C9552B',
    teal: '#2F7D7E',
  },
  semantic: {
    success: '#3D9B72',
    warning: '#D9962E',
    danger: '#C04A3A',
  },
  border: '#D8B56A',
  focus: '#F28C28',
} as const;

export const colors = {
  navyDeep: launchV1.brand.navy,
  indigoAura: launchV1.brand.indigo,
  purpleCosmic: '#2F3B59',
  violetMystic: '#47536A',
  goldPrana: launchV1.brand.gold,
  whiteShakti: launchV1.surfaces.raised,
} as const;

// Nebula Gradient Tokens
export const nebula = {
  nebula1: '#1D0F3A',
  nebula2: '#493B8A',
  nebula3: '#7F5AD7',
  nebula4: '#CAA9FF',
  nebulaCore: '#FFD6FF',
} as const;

// Aurora Tokens
export const aurora = {
  green: '#3D9B72',
  blue: '#2F7D7E',
  purple: '#47536A',
  cyan: '#2F7D7E',
} as const;

// Chakra Spectrum
export const chakra = {
  root: '#B71C1C',
  sacral: '#E65100',
  solar: '#FDD835',
  heart: '#43A047',
  throat: '#1E88E5',
  thirdEye: '#8E24AA',
  crown: '#CE93D8',
} as const;

// Planetary Colors
export const planets = {
  sun: '#FFB347',
  moon: '#E0E7FF',
  mars: '#E57373',
  mercury: '#AED581',
  jupiter: '#FFD54F',
  venus: '#F8BBD0',
  saturn: '#90A4AE',
  rahu: '#7E57C2',
  ketu: '#B39DDB',
} as const;

// Utility Colors
export const utility = {
  success: launchV1.semantic.success,
  warning: launchV1.semantic.warning,
  error: launchV1.semantic.danger,
  info: launchV1.brand.indigo,
  muted: launchV1.text.muted,
} as const;

// State Colors (Phase 3 — Section 13.4)
export const states = {
  default: launchV1.text.primary,
  hover: launchV1.brand.navy,
  active: launchV1.brand.indigo,
  focusRing: launchV1.focus,
  loading: '#d0d0d0',
  success: launchV1.semantic.success,
  warning: launchV1.semantic.warning,
  error: launchV1.semantic.danger,
  disabled: '#9A8D72',
} as const;

// Accessibility Colors
export const a11y = {
  focusRing: launchV1.focus,
  focusRingDark: '#F2D488',
  contrastHighBg: '#000000',
  contrastHighText: '#ffffff',
} as const;
