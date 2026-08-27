'use client'

export function ProductVisualSystem() {
  return (
    <style jsx global>{`
      /*
       * JYOTIAI PRODUCT SYSTEM — G2
       *
       * Scoped deliberately to product routes.
       * Does not modify Kundali.
       * Does not modify marketing pages.
       * Does not modify business logic.
       */

      [data-jyoti-product-system='true'] {
        --jyoti-product-bg: #03090d;
        --jyoti-product-surface: rgba(10, 18, 22, 0.94);
        --jyoti-product-surface-raised: rgba(15, 24, 27, 0.96);
        --jyoti-product-surface-soft: rgba(22, 28, 27, 0.88);

        --jyoti-product-cream: #f5eee2;
        --jyoti-product-muted: #a9a49b;

        --jyoti-product-gold: #e5a44a;
        --jyoti-product-gold-soft: #c99445;
        --jyoti-product-teal: #66a5a5;

        --jyoti-product-border: rgba(219, 168, 76, 0.17);
        --jyoti-product-border-strong: rgba(226, 175, 83, 0.30);

        position: relative;
        min-height: 100vh;
        color: var(--jyoti-product-cream);
        background:
          radial-gradient(
            circle at 80% 2%,
            rgba(224, 145, 48, 0.08),
            transparent 28rem
          ),
          radial-gradient(
            circle at 10% 25%,
            rgba(66, 128, 132, 0.055),
            transparent 32rem
          ),
          linear-gradient(
            180deg,
            #03090d 0%,
            #050b0e 48%,
            #060d10 100%
          );
      }

      [data-jyoti-product-system='true']::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.18;
        background-image:
          linear-gradient(
            rgba(222, 174, 87, 0.035) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(222, 174, 87, 0.025) 1px,
            transparent 1px
          );
        background-size: 96px 96px;
        mask-image: linear-gradient(
          to bottom,
          black,
          transparent 62%
        );
      }

      /*
       * Typography
       */

      [data-jyoti-product-system='true'] h1,
      [data-jyoti-product-system='true'] h2,
      [data-jyoti-product-system='true'] h3 {
        color: var(--jyoti-product-cream);
      }

      [data-jyoti-product-system='true'] h1 {
        letter-spacing: -0.035em;
      }

      [data-jyoti-product-system='true']
        [class*='text-[#07131F]'],
      [data-jyoti-product-system='true']
        [class*='text-[#8A5A16]'] {
        color: var(--jyoti-product-cream) !important;
      }

      [data-jyoti-product-system='true']
        [class*='text-[#56666A]'] {
        color: var(--jyoti-product-muted) !important;
      }

      /*
       * Cards
       */

      [data-jyoti-product-system='true']
        [class*='bg-[#FFFDF4]'],
      [data-jyoti-product-system='true']
        [class*='bg-card'] {
        background:
          linear-gradient(
            145deg,
            rgba(17, 25, 27, 0.97),
            rgba(9, 17, 20, 0.97)
          ) !important;

        border-color: var(--jyoti-product-border) !important;

        box-shadow:
          0 18px 55px rgba(0, 0, 0, 0.16),
          inset 0 1px rgba(255, 255, 255, 0.018);
      }

      [data-jyoti-product-system='true']
        [class*='hover:border-[#C9A24A]']:hover {
        border-color: var(--jyoti-product-border-strong) !important;
      }

      /*
       * General Card primitive
       */

      [data-jyoti-product-system='true']
        [class*='rounded-xl'][class*='border'],
      [data-jyoti-product-system='true']
        [class*='rounded-lg'][class*='border'] {
        border-color: var(--jyoti-product-border);
      }

      /*
       * Muted / secondary surfaces
       */

      [data-jyoti-product-system='true']
        [class*='bg-muted'],
      [data-jyoti-product-system='true']
        [class*='bg-secondary'] {
        background-color: rgba(18, 27, 30, 0.92) !important;
      }

      /*
       * Primary controls
       */

      [data-jyoti-product-system='true']
        button[class*='bg-primary'],
      [data-jyoti-product-system='true']
        a[class*='bg-primary'] {
        background: #e99532 !important;
        color: #160d04 !important;
        border-color: rgba(239, 172, 78, 0.72) !important;
        box-shadow: none !important;
      }

      [data-jyoti-product-system='true']
        button[class*='bg-primary']:hover,
      [data-jyoti-product-system='true']
        a[class*='bg-primary']:hover {
        background: #efa345 !important;
      }

      /*
       * Existing teal product buttons
       */

      [data-jyoti-product-system='true']
        [class*='bg-[#2F7D7E]'] {
        background: #255f61 !important;
        color: #f7f1e7 !important;
      }

      /*
       * Outline / ghost controls
       */

      [data-jyoti-product-system='true']
        button[class*='border'],
      [data-jyoti-product-system='true']
        a[class*='border'] {
        border-color: rgba(220, 170, 80, 0.22);
      }

      [data-jyoti-product-system='true']
        button[class*='hover:bg-[#F5EAD0]']:hover,
      [data-jyoti-product-system='true']
        a[class*='hover:bg-[#F5EAD0]']:hover {
        background: rgba(220, 165, 70, 0.08) !important;
      }

      /*
       * Destructive/error surfaces remain clearly distinct.
       */

      [data-jyoti-product-system='true']
        [class*='border-destructive'],
      [data-jyoti-product-system='true']
        [class*='border-[#C04A3A]'] {
        background: rgba(121, 45, 37, 0.13) !important;
      }

      /*
       * Premium section separation
       */

      [data-jyoti-product-system='true']
        section + section {
        border-top-color: rgba(218, 168, 76, 0.08);
      }

      /*
       * Scrollbar — restrained desktop treatment
       */

      [data-jyoti-product-system='true'] ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      [data-jyoti-product-system='true'] ::-webkit-scrollbar-thumb {
        background: rgba(218, 168, 76, 0.18);
        border-radius: 999px;
      }

      /*
       * Responsive
       */

      @media (max-width: 767px) {
        [data-jyoti-product-system='true'] {
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(224, 145, 48, 0.07),
              transparent 19rem
            ),
            #03090d;
        }
      }
    `}</style>
  )
}
