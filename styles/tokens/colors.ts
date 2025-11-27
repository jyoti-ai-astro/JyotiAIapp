/**
 * Color Tokens
 * 
 * Phase 3 — Section 14.2: Core Theme Colors (Cosmic Hybrid)
 * Phase 3 — Section 9: THEMING & COLOR TOKENS
 */

// Base Core Colors (Spiritual)
export const colors = {
  navyDeep: '#060B1B',
  indigoAura: '#1A1F3C',
  purpleCosmic: '#7B2CBF',
  violetMystic: '#9D4EDD',
  goldPrana: '#F4CE65',
  whiteShakti: '#F8F8FF',
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
  green: '#4ef3c3',
  blue: '#4e9df3',
  purple: '#b44ef3',
  cyan: '#4ef3e2',
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
  success: '#42d87c',
  warning: '#f7c948',
  error: '#e85555',
  info: '#4e9df3',
  muted: 'rgba(255,255,255,0.6)',
} as const;

// State Colors (Phase 3 — Section 13.4)
export const states = {
  default: 'rgba(255,255,255,0.9)',
  hover: 'rgba(255,255,255,1)',
  active: 'rgba(255,255,255,0.8)',
  focusRing: '#8ab4f8',
  loading: '#d0d0d0',
  success: '#42d87c',
  warning: '#f7c948',
  error: '#e85555',
  disabled: 'rgba(255,255,255,0.4)',
} as const;

// Accessibility Colors
export const a11y = {
  focusRing: '#8ab4f8',
  focusRingDark: '#d0e0ff',
  contrastHighBg: '#000000',
  contrastHighText: '#ffffff',
} as const;
