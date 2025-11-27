/**
 * Jyoti AI Design Tokens
 * 
 * Master design system tokens based on UI/UX Master Plan v1.0
 * Phase 1 - Section 1: Visual Identity Principles
 */

export const designTokens = {
  // ============================================
  // COLOR PALETTE
  // ============================================
  colors: {
    // Dark Spiritual Canvas
    cosmic: {
      navy: '#020916',      // Deep Navy - Primary dark background
      indigo: '#0A0F2B',    // Mystic Indigo - Secondary dark
      purple: '#6E2DEB',    // Cosmic Purple - Accent
      cyan: '#17E8F6',      // Aura Cyan - Highlight
      gold: '#F2C94C',      // Ethereal Gold - Premium accent
    },
    
    // Semantic Colors
    aura: {
      blue: '#17E8F6',      // Aura Cyan
      green: '#4ECB71',     // Aura Green
      orange: '#FF8C42',    // Aura Orange
      red: '#FF6B6B',       // Aura Red
      violet: '#9D4EDD',    // Aura Violet
    },
    
    // Status Colors
    status: {
      success: '#4ECB71',
      warning: '#FF8C42',
      error: '#FF6B6B',
      info: '#17E8F6',
    },
    
    // Neutral Grays (for text, borders)
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      heading: ['var(--font-heading)', 'serif'],
      body: ['var(--font-body)', 'sans-serif'],
      display: ['var(--font-display)', 'serif'],
      mono: ['var(--font-mono)', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',    // 128px
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
    pill: '9999px',
  },

  // ============================================
  // SHADOWS & GLOWS
  // ============================================
  shadows: {
    // Standard shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    
    // Cosmic glows (aura-like, not harsh neon)
    cosmic: {
      cyan: '0 0 20px rgba(23, 232, 246, 0.3)',
      purple: '0 0 30px rgba(110, 45, 235, 0.4)',
      gold: '0 0 25px rgba(242, 201, 76, 0.3)',
      soft: '0 0 40px rgba(110, 45, 235, 0.15)',
    },
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    // Timing functions (subtle, meditative)
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      cosmic: 'cubic-bezier(0.4, 0, 0.2, 1)',
      breathe: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    
    // Durations (slow, calming)
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
      slowest: '1200ms',
    },
    
    // Keyframe animations
    keyframes: {
      fadeIn: {
        from: { opacity: '0', transform: 'translateY(10px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      fadeOut: {
        from: { opacity: '1', transform: 'translateY(0)' },
        to: { opacity: '0', transform: 'translateY(10px)' },
      },
      slideIn: {
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0)' },
      },
      slideOut: {
        from: { transform: 'translateX(0)' },
        to: { transform: 'translateX(-100%)' },
      },
      scaleIn: {
        from: { opacity: '0', transform: 'scale(0.95)' },
        to: { opacity: '1', transform: 'scale(1)' },
      },
      pulse: {
        '0%, 100%': { opacity: '0.8' },
        '50%': { opacity: '1' },
      },
      breathe: {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.02)' },
      },
      rotate: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
    },
  },

  // ============================================
  // Z-INDEX LAYERS
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    cosmic: 1070,  // For cosmic effects that should be above everything
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Export individual token groups for convenience
export const colors = designTokens.colors;
export const typography = designTokens.typography;
export const spacing = designTokens.spacing;
export const borderRadius = designTokens.borderRadius;
export const shadows = designTokens.shadows;
export const animations = designTokens.animations;
export const zIndex = designTokens.zIndex;
export const breakpoints = designTokens.breakpoints;

