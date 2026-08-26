"use client";

/**
 * JyotiAI product-shell normalization.
 *
 * PURPOSE
 * -------
 * Shared presentation contract for authenticated/product pages.
 *
 * This intentionally fixes repeated legacy light-theme leakage at the
 * system level rather than reworking Guru / Predictions / Timeline /
 * Reports independently.
 *
 * No API, access, pricing, generation or persistence behavior lives here.
 */
export function ProductShellNormalizer() {
  return (
    <style>{`
      /*
       * ================================================================
       * JYOTIAI PRODUCT SHELL — G5
       * ================================================================
       */

      body:has([data-jyoti-product-shell="true"]) {
        background:
          radial-gradient(
            circle at 78% 10%,
            rgba(232, 165, 74, 0.065),
            transparent 31rem
          ),
          radial-gradient(
            circle at 14% 38%,
            rgba(74, 142, 148, 0.035),
            transparent 27rem
          ),
          #02090d !important;
        color: #f3ecdf;
      }

      /*
       * ------------------------------------------------
       * GLOBAL HEADER
       * ------------------------------------------------
       *
       * Product routes must NEVER switch to cream / white as the page
       * scrolls. We target structural header elements rather than route
       * business components.
       */

      body:has([data-jyoti-product-shell="true"]) header {
        background:
          linear-gradient(
            180deg,
            rgba(3, 10, 14, 0.985),
            rgba(3, 10, 14, 0.955)
          ) !important;

        border-color: rgba(224, 170, 82, 0.11) !important;

        color: #f5eee2 !important;

        box-shadow:
          0 1px 0 rgba(255,255,255,0.018),
          0 18px 46px rgba(0,0,0,0.20) !important;

        backdrop-filter: blur(18px) saturate(115%) !important;
        -webkit-backdrop-filter: blur(18px) saturate(115%) !important;
      }

      body:has([data-jyoti-product-shell="true"]) header::before,
      body:has([data-jyoti-product-shell="true"]) header::after {
        background-color: transparent !important;
      }

      body:has([data-jyoti-product-shell="true"]) header a:not([class*="bg-orange"]),
      body:has([data-jyoti-product-shell="true"]) header button:not([class*="bg-orange"]) {
        color: rgba(244, 237, 226, 0.80) !important;
      }

      body:has([data-jyoti-product-shell="true"]) header a:hover,
      body:has([data-jyoti-product-shell="true"]) header button:hover {
        color: #fff8eb !important;
      }

      /*
       * Prevent legacy light navigation wrappers from bleeding through
       * inside sticky/fixed header regions.
       */
      body:has([data-jyoti-product-shell="true"])
        header
        [class*="bg-white"],

      body:has([data-jyoti-product-shell="true"])
        header
        [class*="bg-card"],

      body:has([data-jyoti-product-shell="true"])
        header
        [class*="bg-background"],

      body:has([data-jyoti-product-shell="true"])
        header
        [class*="bg-surface"] {
        background-color: transparent !important;
        background-image: none !important;
      }

      /*
       * ------------------------------------------------
       * DASHBOARD SIDEBAR
       * ------------------------------------------------
       */

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-sidebar="true"],

      body:has([data-jyoti-product-shell="true"])
        [data-product-sidebar="true"] {
        background:
          linear-gradient(
            180deg,
            rgba(9, 19, 23, 0.985),
            rgba(6, 14, 18, 0.985)
          ) !important;

        border: 1px solid rgba(220, 168, 83, 0.14) !important;
        box-shadow:
          0 24px 60px rgba(0,0,0,0.28),
          inset 0 1px 0 rgba(255,255,255,0.025) !important;
        color: #eee7dc !important;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-sidebar="true"] a,

      body:has([data-jyoti-product-shell="true"])
        [data-product-sidebar="true"] a {
        background: transparent !important;
        color: rgba(224, 219, 208, 0.65) !important;
        border-color: transparent !important;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-sidebar="true"] a:hover,

      body:has([data-jyoti-product-shell="true"])
        [data-product-sidebar="true"] a:hover {
        background: rgba(255,255,255,0.035) !important;
        color: #fff8eb !important;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-sidebar="true"]
        [aria-current="page"],

      body:has([data-jyoti-product-shell="true"])
        [data-product-sidebar="true"]
        [aria-current="page"] {
        background:
          linear-gradient(
            90deg,
            rgba(227, 163, 70, 0.14),
            rgba(227, 163, 70, 0.045)
          ) !important;

        border-color: rgba(228, 169, 80, 0.18) !important;
        color: #f7eddb !important;
      }

      /*
       * ------------------------------------------------
       * GURU LEGACY LIGHT SURFACES
       * ------------------------------------------------
       */

      [data-guru-product="true"] [data-guru-status-strip="true"] {
        background:
          linear-gradient(
            90deg,
            rgba(14, 25, 28, 0.98),
            rgba(9, 18, 22, 0.98)
          ) !important;

        border: 1px solid rgba(221, 169, 82, 0.14) !important;
        color: #e9e2d6 !important;
      }

      [data-guru-product="true"] [data-guru-prompt-card="true"] {
        background:
          linear-gradient(
            145deg,
            rgba(16, 27, 30, 0.98),
            rgba(10, 20, 23, 0.98)
          ) !important;

        border: 1px solid rgba(221, 169, 82, 0.13) !important;
        color: #f3ecdf !important;

        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.02),
          0 18px 45px rgba(0,0,0,0.12) !important;
      }

      [data-guru-product="true"] [data-guru-prompt-card="true"]:hover {
        background:
          linear-gradient(
            145deg,
            rgba(20, 33, 36, 0.99),
            rgba(12, 23, 27, 0.99)
          ) !important;

        border-color: rgba(227, 172, 83, 0.26) !important;
        transform: translateY(-1px);
      }

      [data-guru-product="true"] [data-guru-prompt-card="true"] p,
      [data-guru-product="true"] [data-guru-prompt-card="true"] span {
        color: inherit;
      }

      /*
       * ------------------------------------------------
       * LEGACY LIGHT CARD GUARD
       * ------------------------------------------------
       *
       * Narrowly scoped to these product frames.
       * Does not touch public marketing pages.
       */

      [data-jyoti-product-shell="true"]
        [data-product-dark-surface="true"] {
        background-color: #081216 !important;
        color: #f1eadf !important;
        border-color: rgba(220, 170, 89, 0.13) !important;
      }

      /*
       * ------------------------------------------------
       * FOOTER SEPARATION
       * ------------------------------------------------
       */

      body:has([data-jyoti-product-shell="true"]) footer {
        background: #07111f !important;
        border-top-color: rgba(224, 170, 82, 0.11) !important;
      }

      /*
       * ------------------------------------------------
       * RESPONSIVE
       * ------------------------------------------------
       */

      @media (max-width: 1023px) {
        body:has([data-jyoti-product-shell="true"])
          [data-dashboard-sidebar="true"],

        body:has([data-jyoti-product-shell="true"])
          [data-product-sidebar="true"] {
          box-shadow: none !important;
        }
      }

      /*
       * ================================================================
       * G6 — SOURCE-LOCKED AUTHENTICATED SHELL
       * ================================================================
       */

      /*
       * ================================================================
       * G6 — SOURCE-LOCKED AUTHENTICATED SHELL
       * ================================================================
       *
       * G5 correctly tagged the aside but the legacy cream background
       * lives on an inner wrapper. G6 targets that exact wrapper.
       */

      [data-dashboard-sidebar="true"] {
        background: #061014 !important;
        border-right: 1px solid rgba(221, 170, 87, 0.11) !important;
        color: #e9e3d7 !important;
      }

      [data-dashboard-sidebar-surface="true"] {
        background:
          linear-gradient(
            180deg,
            rgba(10, 20, 24, 0.99),
            rgba(6, 15, 19, 0.99)
          ) !important;

        background-color: #081216 !important;

        border: 1px solid rgba(220, 168, 83, 0.14) !important;
        border-radius: 18px !important;

        box-shadow:
          0 24px 70px rgba(0,0,0,0.26),
          inset 0 1px 0 rgba(255,255,255,0.025) !important;
      }

      [data-dashboard-sidebar-surface="true"] nav,
      [data-dashboard-sidebar-surface="true"] ul {
        background: transparent !important;
      }

      [data-dashboard-sidebar-surface="true"] a,
      [data-dashboard-sidebar-surface="true"] button {
        background: transparent !important;
        color: rgba(223, 218, 208, 0.62) !important;
        border-color: transparent !important;
        box-shadow: none !important;
      }

      [data-dashboard-sidebar-surface="true"] a:hover,
      [data-dashboard-sidebar-surface="true"] button:hover {
        background: rgba(255,255,255,0.035) !important;
        color: #fff7e9 !important;
      }

      [data-dashboard-sidebar-surface="true"] [aria-current="page"] {
        background:
          linear-gradient(
            90deg,
            rgba(226, 163, 69, 0.16),
            rgba(226, 163, 69, 0.045)
          ) !important;

        border: 1px solid rgba(226, 166, 76, 0.16) !important;
        color: #f5ead8 !important;
      }

      /*
       * Kill remaining cream/white descendants only inside the actual
       * authenticated sidebar surface.
       */

      [data-dashboard-sidebar-surface="true"] [class*="bg-white"],
      [data-dashboard-sidebar-surface="true"] [class*="bg-card"],
      [data-dashboard-sidebar-surface="true"] [class*="bg-background"],
      [data-dashboard-sidebar-surface="true"] [class*="bg-surface"] {
        background-color: transparent !important;
        background-image: none !important;
      }

      /*
       * Guru's credit/context strip was not tagged by G5.
       * G6 targets its exact source container.
       */

      [data-guru-product="true"] [data-guru-status-strip="true"] {
        background:
          linear-gradient(
            90deg,
            rgba(13, 24, 28, 0.99),
            rgba(8, 17, 21, 0.99)
          ) !important;

        background-color: #0b171b !important;

        border: 1px solid rgba(220, 169, 83, 0.14) !important;

        color: #eae3d6 !important;

        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.02) !important;
      }

      [data-guru-product="true"]
      [data-guru-status-strip="true"]
      * {
        color: inherit;
      }

      [data-guru-product="true"]
      [data-guru-status-strip="true"]
      [class*="bg-white"],

      [data-guru-product="true"]
      [data-guru-status-strip="true"]
      [class*="bg-card"],

      [data-guru-product="true"]
      [data-guru-status-strip="true"]
      [class*="bg-background"] {
        background-color: transparent !important;
        background-image: none !important;
      }



      /*
       * ================================================================
       * H2D_AUTHENTICATED_DASHBOARD_CANVAS
       * ================================================================
       *
       * Shared authenticated product canvas.
       *
       * This removes the remaining legacy cream page field without
       * rewriting Career / Business / Compatibility / Numerology.
       *
       * Existing dark product cards, inputs, paywalls and business
       * components remain responsible for their own surfaces.
       */

      [data-jyoti-product-shell="true"] {
        min-height: 100%;
        background:
          radial-gradient(
            circle at 78% 7%,
            rgba(205, 139, 48, 0.075),
            transparent 30rem
          ),
          radial-gradient(
            circle at 18% 24%,
            rgba(63, 118, 120, 0.04),
            transparent 26rem
          ),
          #050d11 !important;
        color: #eee7dc !important;
      }

      [data-jyoti-product-shell="true"]
        [data-dashboard-content-canvas="true"] {
        min-height: 100%;
        background: transparent !important;
        color: #eee7dc !important;
      }

      body:has([data-jyoti-product-shell="true"]) main {
        background:
          radial-gradient(
            circle at 76% 8%,
            rgba(190, 124, 43, 0.055),
            transparent 32rem
          ),
          #050d11 !important;
        color: #eee7dc !important;
      }

      body:has([data-jyoti-product-shell="true"])
        main
        > [class*="bg-[#fff"],

      body:has([data-jyoti-product-shell="true"])
        main
        > [class*="bg-white"] {
        background-color: transparent !important;
      }

      :where([data-jyoti-product-shell="true"]) h1,
      :where([data-jyoti-product-shell="true"]) h2,
      :where([data-jyoti-product-shell="true"]) h3 {
        color: #f3ecdf;
      }

      [data-jyoti-product-shell="true"] input,
      [data-jyoti-product-shell="true"] textarea,
      [data-jyoti-product-shell="true"] select {
        color-scheme: dark;
      }

    

      /*
       * ================================================================
       * JYOTIAI VISUAL READING PRODUCTS — K4
       * Palmistry / Aura / Face family normalization.
       * Presentation only. No product or analysis behavior.
       * ================================================================
       */

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"] {
        background: transparent !important;
        color: #eee7dc;
        min-height: auto !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]::before,
      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]::after {
        opacity: 0.22 !important;
        pointer-events: none !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .cosmic-card {
        background: rgba(7, 19, 25, 0.72) !important;
        border-color: rgba(216, 181, 106, 0.18) !important;
        box-shadow:
          0 18px 50px rgba(0, 0, 0, 0.16),
          inset 0 1px 0 rgba(255, 255, 255, 0.015) !important;
        backdrop-filter: blur(12px);
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .text-cosmic-gold {
        color: #e0b75f !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .text-aura-cyan {
        color: #82afb0 !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .border-aura-cyan\/30,
      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .border-aura-cyan\/50 {
        border-color: rgba(95, 150, 152, 0.30) !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .bg-cosmic-indigo\/5,
      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .bg-cosmic-indigo\/10 {
        background: rgba(6, 17, 24, 0.44) !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      .cosmic-button {
        box-shadow: none !important;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      input[type="file"] {
        color-scheme: dark;
      }

      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      h1,
      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      h2,
      [data-jyoti-product-shell="true"]
      [data-visual-reading-product="true"]
      h3 {
        text-wrap: balance;
      }

      @media (min-width: 768px) {
        [data-jyoti-product-shell="true"]
        [data-visual-reading-product="true"] {
          width: 100%;
        }
      }

      `}</style>
  );
}
