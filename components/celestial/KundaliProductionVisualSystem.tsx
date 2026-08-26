'use client'

export function KundaliProductionVisualSystem() {
  return (
    <style jsx global>{`
      /*
       * ================================================================
       * JYOTIAI — K5.2 PRODUCTION KUNDALI SYSTEM
       * Route scoped. Presentation only.
       * ================================================================
       */

      [data-kundali-product='true'] {
        --k-bg: #03090d;
        --k-panel: rgba(8, 17, 21, 0.92);
        --k-panel-2: rgba(16, 24, 27, 0.96);
        --k-border: rgba(206, 157, 66, 0.19);
        --k-border-strong: rgba(215, 165, 69, 0.32);
        --k-text: #f1ead9;
        --k-muted: rgba(226, 220, 205, 0.61);
        --k-gold: #e4a344;
      }

      /*
       * ------------------------------------------------
       * 1. PAGE ATMOSPHERE
       * ------------------------------------------------
       */

      [data-kundali-product='true'] {
        background:
          radial-gradient(
            circle at 84% 13%,
            rgba(174, 92, 27, 0.10),
            transparent 27rem
          ),
          radial-gradient(
            circle at 12% 39%,
            rgba(41, 99, 102, 0.07),
            transparent 34rem
          ),
          var(--k-bg) !important;
      }

      /*
       * ------------------------------------------------
       * 2. GLOBAL PRODUCT TYPOGRAPHY
       * ------------------------------------------------
       */

      [data-kundali-product='true'] h1,
      [data-kundali-product='true'] h2,
      [data-kundali-product='true'] h3,
      [data-kundali-product='true'] h4 {
        color: var(--k-text);
      }

      [data-kundali-product='true'] p {
        color: var(--k-muted);
      }

      /*
       * ------------------------------------------------
       * 3. THE REPEATING BROKEN BUTTON PROBLEM
       *
       * Every disabled button now becomes an intentional
       * dark disabled control — NEVER cream + white again.
       * ------------------------------------------------
       */

      [data-kundali-product='true'] button:disabled,
      [data-kundali-product='true'] button[disabled],
      [data-kundali-product='true'] a[aria-disabled='true'] {
        background: rgba(19, 26, 29, 0.98) !important;
        color: rgba(226, 220, 205, 0.44) !important;
        border-color: rgba(210, 163, 74, 0.14) !important;
        opacity: 1 !important;
        box-shadow: none !important;
        cursor: not-allowed !important;
      }

      [data-kundali-product='true'] button:disabled *,
      [data-kundali-product='true'] button[disabled] * {
        color: inherit !important;
        opacity: 1 !important;
      }

      /*
       * Normalize old white / secondary utility controls
       * that survived the dashboard theme.
       */

      [data-kundali-product='true'] button[class*='bg-white'],
      [data-kundali-product='true'] a[class*='bg-white'] {
        background: rgba(18, 25, 28, 0.96) !important;
        color: var(--k-text) !important;
        border-color: var(--k-border) !important;
      }

      /*
       * ------------------------------------------------
       * 4. BADGES / CREDITS
       * Fix the nearly-black "3 Kundali credits" badge.
       * ------------------------------------------------
       */

      [data-kundali-product='true']
        [class*='bg-secondary'],
      [data-kundali-product='true']
        [class*='bg-muted'] {
        color: rgba(239, 225, 191, 0.88) !important;
      }

      [data-kundali-product='true']
        [class*='bg-secondary'][class*='text-'],
      [data-kundali-product='true']
        [class*='bg-muted'][class*='text-'] {
        color: rgba(239, 225, 191, 0.88) !important;
      }

      /*
       * ------------------------------------------------
       * 5. DARK PRODUCT PANELS
       * ------------------------------------------------
       */

      [data-kundali-product='true']
        [data-kundali-panel='true'],
      [data-kundali-product='true']
        [data-kundali-dasha='true'],
      [data-kundali-product='true']
        [data-kundali-advanced='true'] {
        background: rgba(7, 15, 18, 0.91) !important;
        border-color: var(--k-border) !important;
        box-shadow: none !important;
      }

      /*
       * ------------------------------------------------
       * 6. D1 — USE THE ACTUAL DESKTOP WIDTH
       * ------------------------------------------------
       */

      [data-kundali-product='true']
        [data-kundali-d1='true'] {
        width: 100% !important;
        max-width: none !important;
      }

      [data-kundali-product='true']
        [data-kundali-d1='true']
        > * {
        width: 100% !important;
        max-width: none !important;
      }

      [data-kundali-product='true']
        [data-kundali-d1='true']
        [class*='max-w-'] {
        max-width: none !important;
      }

      [data-kundali-product='true']
        [data-kundali-d1='true']
        svg,
      [data-kundali-product='true']
        [data-kundali-d1='true']
        canvas {
        width: 100% !important;
        max-width: none !important;
      }

      /*
       * D1 still contains legacy light chart cells.
       * Suppress them only inside the D1 product region.
       */

      [data-kundali-product='true']
        [data-kundali-d1='true']
        [class*='bg-white'],
      [data-kundali-product='true']
        [data-kundali-d1='true']
        [class*='bg-background'],
      [data-kundali-product='true']
        [data-kundali-d1='true']
        [class*='bg-card'] {
        background-color: rgba(18, 26, 29, 0.96) !important;
        color: var(--k-text) !important;
      }

      /*
       * Some central D1 cells are plain DOM elements with
       * old theme variables rather than explicit bg classes.
       */

      [data-kundali-product='true']
        [data-kundali-d1='true']
        [style*='background'] {
        background-color: rgba(18, 26, 29, 0.96) !important;
        color: var(--k-text) !important;
      }

      /*
       * ------------------------------------------------
       * 7. CURRENT DASHA
       * ------------------------------------------------
       */

      [data-kundali-product='true']
        [data-kundali-dasha='true']
        [class*='bg-white'],
      [data-kundali-product='true']
        [data-kundali-dasha='true']
        [class*='bg-background'],
      [data-kundali-product='true']
        [data-kundali-dasha='true']
        [class*='bg-card'],
      [data-kundali-product='true']
        [data-kundali-dasha-card='true'] {
        background: rgba(18, 26, 29, 0.98) !important;
        color: var(--k-text) !important;
        border-color: var(--k-border) !important;
      }

      [data-kundali-product='true']
        [data-kundali-dasha='true']
        [class*='text-muted'] {
        color: var(--k-muted) !important;
      }

      [data-kundali-product='true']
        [data-kundali-dasha='true']
        [class*='text-primary'],
      [data-kundali-product='true']
        [data-kundali-dasha='true']
        [class*='text-foreground'] {
        color: var(--k-text) !important;
      }

      /*
       * ------------------------------------------------
       * 8. ADVANCED DATA
       * ------------------------------------------------
       */

      [data-kundali-product='true']
        [data-kundali-advanced='true']
        table {
        width: 100%;
      }

      [data-kundali-product='true']
        [data-kundali-advanced='true']
        th {
        color: rgba(226, 220, 205, 0.64) !important;
      }

      [data-kundali-product='true']
        [data-kundali-advanced='true']
        td {
        color: rgba(241, 234, 217, 0.87) !important;
      }

      /*
       * ------------------------------------------------
       * 9. SPACING / DESKTOP SCALE
       * ------------------------------------------------
       */

      @media (min-width: 1200px) {
        [data-kundali-product='true']
          [data-kundali-d1='true'] {
          padding-left: 32px;
          padding-right: 32px;
        }
      }

      /*
       * ------------------------------------------------
       * 10. HERO CELESTIAL GUARANTEE
       * ------------------------------------------------
       */

      [data-kundali-celestial-stage='true'] {
        min-height: 100%;
        opacity: 1 !important;
      }
    `}</style>
  )
}
