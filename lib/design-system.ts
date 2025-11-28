/**
 * Cosmic Design System Tokens
 * 
 * Centralized design tokens for consistent styling across the app
 */

export const cosmicColors = {
  navy: '#020916',
  indigo: '#0A0F2B',
  purple: '#6E2DEB',
  cyan: '#17E8F6',
  gold: '#F2C94C',
  'gold-light': '#F4CE65',
  white: '#FFFFFF',
  'white-90': 'rgba(255, 255, 255, 0.9)',
  'white-80': 'rgba(255, 255, 255, 0.8)',
  'white-70': 'rgba(255, 255, 255, 0.7)',
  'white-60': 'rgba(255, 255, 255, 0.6)',
  'white-50': 'rgba(255, 255, 255, 0.5)',
  'white-30': 'rgba(255, 255, 255, 0.3)',
  'white-20': 'rgba(255, 255, 255, 0.2)',
  'white-10': 'rgba(255, 255, 255, 0.1)',
  'white-5': 'rgba(255, 255, 255, 0.05)',
  'purple-50': 'rgba(110, 45, 235, 0.5)',
  'purple-30': 'rgba(110, 45, 235, 0.3)',
  'purple-20': 'rgba(110, 45, 235, 0.2)',
  'gold-30': 'rgba(242, 201, 76, 0.3)',
  'gold-20': 'rgba(242, 201, 76, 0.2)',
  'cyan-50': 'rgba(23, 232, 246, 0.5)',
  'cyan-30': 'rgba(23, 232, 246, 0.3)',
} as const;

export const cosmicSpacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const;

export const cosmicShadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  glow: '0 0 30px rgba(110, 45, 235, 0.3)',
  'glow-gold': '0 0 20px rgba(242, 201, 76, 0.4)',
  'glow-cyan': '0 0 20px rgba(23, 232, 246, 0.4)',
  cosmic: '0 0 30px rgba(110, 45, 235, 0.3), 0 0 60px rgba(23, 232, 246, 0.2)',
} as const;

export const cosmicTypography = {
  fontFamily: {
    display: ['var(--font-display)', 'serif'],
    heading: ['var(--font-heading)', 'sans-serif'],
    body: ['var(--font-body)', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

export const cosmicBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const cosmicTransitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '800ms',
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const cosmicZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  cosmic: 10,
  r3f: 0,
} as const;

export const cosmicBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

export const cosmicBackdrop = {
  blur: 'blur(12px)',
  'blur-sm': 'blur(4px)',
  'blur-md': 'blur(8px)',
  'blur-lg': 'blur(16px)',
  opacity: {
    light: 'rgba(10, 15, 43, 0.5)',
    medium: 'rgba(10, 15, 43, 0.7)',
    heavy: 'rgba(10, 15, 43, 0.9)',
  },
} as const;

