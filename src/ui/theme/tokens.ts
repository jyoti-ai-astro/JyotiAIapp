/**
 * Cosmic UI Theme Tokens
 * Super Cosmic UI - Option A
 * Based on 21st.dev style with cosmic-gold theme
 */

export const colors = {
  // Primary Gold Gradient
  gold: {
    50: '#FFF9E6',
    100: '#FFF3CC',
    200: '#FFE699',
    300: '#FFD966',
    400: '#FFCC33',
    500: '#FFD57A', // Primary Gold Start
    600: '#FFB347', // Primary Gold End
    700: '#E6A03D',
    800: '#CC8D33',
    900: '#B37A29',
  },
  // Cosmic Indigo
  cosmic: {
    50: '#1A2347',
    100: '#151B3A',
    200: '#0F142D',
    300: '#0A0F1F', // Primary Cosmic Indigo
    400: '#050A12',
    500: '#030508',
  },
  // Nebula Purple
  nebula: {
    50: '#8B5FCF',
    100: '#7A4FBF',
    200: '#6A3FAF',
    300: '#5A2F9F',
    400: '#4B1E92', // Primary Nebula Purple
    500: '#3D1A7A',
  },
  // Stardust Blue
  stardust: {
    50: '#3A4A6B',
    100: '#2E3A5A',
    200: '#222A49',
    300: '#1A2347', // Primary Stardust Blue
    400: '#141B38',
    500: '#0E1329',
  },
  // Aurora Green Accent
  aurora: {
    50: '#7FFFD4',
    100: '#6BFFC8',
    200: '#57FFBC',
    300: '#4DF3A3', // Primary Aurora Green
    400: '#3DE693',
    500: '#2DD983',
  },
  // Neutral
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
} as const;

export const gradients = {
  // Gold Gradients
  goldPrimary: 'linear-gradient(135deg, #FFD57A 0%, #FFB347 100%)',
  goldSoft: 'linear-gradient(135deg, rgba(255, 213, 122, 0.8) 0%, rgba(255, 179, 71, 0.8) 100%)',
  goldSubtle: 'linear-gradient(135deg, rgba(255, 213, 122, 0.2) 0%, rgba(255, 179, 71, 0.2) 100%)',
  
  // Cosmic Gradients
  cosmicPrimary: 'linear-gradient(135deg, #0A0F1F 0%, #050A12 100%)',
  cosmicNebula: 'linear-gradient(135deg, #0A0F1F 0%, #4B1E92 50%, #1A2347 100%)',
  cosmicDeep: 'linear-gradient(180deg, #05050A 0%, #0A0F1F 100%)',
  
  // Gold to Cosmic
  goldToCosmic: 'linear-gradient(135deg, #FFD57A 0%, #FFB347 50%, #0A0F1F 100%)',
  
  // Aurora Accents
  auroraGlow: 'linear-gradient(135deg, rgba(77, 243, 163, 0.3) 0%, rgba(77, 243, 163, 0.1) 100%)',
  
  // Text Gradients
  textGold: 'linear-gradient(135deg, #FFD57A 0%, #FFB347 100%)',
  textCosmic: 'linear-gradient(135deg, #4DF3A3 0%, #FFD57A 100%)',
} as const;

export const radii = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  full: '9999px',
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  64: '16rem',     // 256px
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Marcellus', 'serif'],
    display: ['Playfair Display', 'serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
    '8xl': ['6rem', { lineHeight: '1' }],         // 96px
    '9xl': ['8rem', { lineHeight: '1' }],         // 128px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const container = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1350px', // Primary container width
  full: '100%',
} as const;

export const shadows = {
  // Soft Gold Glow
  goldSoft: '0 4px 20px rgba(255, 213, 122, 0.15), 0 0 40px rgba(255, 179, 71, 0.1)',
  goldMedium: '0 8px 32px rgba(255, 213, 122, 0.25), 0 0 60px rgba(255, 179, 71, 0.15)',
  goldStrong: '0 12px 48px rgba(255, 213, 122, 0.35), 0 0 80px rgba(255, 179, 71, 0.2)',
  
  // Neon Edges
  neonGold: '0 0 20px rgba(255, 213, 122, 0.5), inset 0 0 20px rgba(255, 179, 71, 0.1)',
  neonAurora: '0 0 20px rgba(77, 243, 163, 0.5), inset 0 0 20px rgba(77, 243, 163, 0.1)',
  neonPurple: '0 0 20px rgba(75, 30, 146, 0.5), inset 0 0 20px rgba(75, 30, 146, 0.1)',
  
  // Holographic
  holographic: '0 8px 32px rgba(255, 213, 122, 0.2), 0 0 40px rgba(77, 243, 163, 0.15), 0 0 60px rgba(75, 30, 146, 0.1)',
  
  // Glassmorphic
  glass: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  glassGold: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 213, 122, 0.2)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

