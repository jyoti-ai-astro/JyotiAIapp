/**
 * PDF Styles
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 * 
 * Style tokens for cosmic PDF generation
 */

export const PDFColors = {
  gold: '#F7D774',
  violet: '#9B4DFF',
  cosmicNavy: '#0A0E27',
  white: '#FFFFFF',
  black: '#000000',
  chakras: {
    root: '#FF0000',
    sacral: '#FF8C00',
    solarPlexus: '#FFD700',
    heart: '#00FF00',
    throat: '#0000FF',
    thirdEye: '#4B0082',
    crown: '#8B00FF',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    muted: '#A0A0A0',
  },
} as const;

export const PDFFonts = {
  title: {
    size: 32,
    weight: 'bold' as const,
    family: 'Helvetica-Bold',
  },
  subtitle: {
    size: 20,
    weight: 'bold' as const,
    family: 'Helvetica-Bold',
  },
  sectionTitle: {
    size: 18,
    weight: 'bold' as const,
    family: 'Helvetica-Bold',
  },
  body: {
    size: 12,
    weight: 'normal' as const,
    family: 'Helvetica',
  },
  small: {
    size: 10,
    weight: 'normal' as const,
    family: 'Helvetica',
  },
} as const;

export const PDFLayout = {
  page: {
    width: 595, // A4 width in points
    height: 842, // A4 height in points
    margin: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72,
    },
  },
  content: {
    width: 451, // 595 - 72*2
    padding: 20,
    lineSpacing: 1.5,
  },
  section: {
    spacing: 30,
    dividerHeight: 2,
  },
} as const;

export const PDFWatermark = {
  opacity: 0.05,
  size: 300,
  position: {
    x: 297.5, // Center X
    y: 421, // Center Y
  },
} as const;

