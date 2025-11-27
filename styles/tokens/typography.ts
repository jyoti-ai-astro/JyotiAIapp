/**
 * Typography Tokens
 * 
 * Phase 3 — Section 10: TYPOGRAPHY SYSTEM
 * Phase 3 — Section 14.3: Typography Tokens
 */

export const fonts = {
  primary: "'Inter', sans-serif",
  secondary: "'Poppins', sans-serif",
  cosmic: "'Cinzel', serif",
  guru: "'Marcellus', serif",
} as const;

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

export const lineHeights = {
  tight: 1.1,
  normal: 1.4,
  loose: 1.6,
} as const;
