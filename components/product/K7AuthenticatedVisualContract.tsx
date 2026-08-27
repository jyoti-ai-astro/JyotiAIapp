export function K7AuthenticatedVisualContract() {
  return (
    <style jsx global>{`
      body:has([data-jyoti-product-shell="true"]) {
        --jyoti-dark-canvas: #050d11;
        --jyoti-dark-panel: #071218;
        --jyoti-dark-panel-2: #09161d;

        --jyoti-ivory: #eee7dc;
        --jyoti-ivory-soft: #d8d0c5;
        --jyoti-muted-dark: #92999b;

        --jyoti-light-card: #fbf7ed;
        --jyoti-light-card-2: #f7f0e2;

        --jyoti-ink: #0d1a24;
        --jyoti-ink-soft: #33424b;
        --jyoti-muted-light: #66757b;

        --jyoti-gold: #e59a3b;
        --jyoti-gold-soft: #c6903f;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"] {
        min-height: 100%;
        background:
          radial-gradient(
            circle at 82% 0%,
            rgba(229, 154, 59, 0.065),
            transparent 28rem
          ),
          var(--jyoti-dark-canvas);
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        main
        h1,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        main
        h2,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        main
        h3 {
        color: var(--jyoti-ivory);
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-\\[\\#fffdf7\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-\\[\\#fffaf0\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-\\[\\#fbf7ed\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-\\[\\#fdf8ee\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-\\[\\#f8f1e4\\] {
        color: var(--jyoti-ink);
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        h1,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        h2,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        h3,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        h4 {
        color: var(--jyoti-ink) !important;
        opacity: 1 !important;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        p,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        dt,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        dd,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        li {
        color: var(--jyoti-muted-light);
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        .text-\\[\\#eee7dc\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        .text-\\[\\#efe7db\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        .text-\\[\\#f0e8dc\\],
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        .text-amber-50,
      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        .bg-white
        .text-stone-100 {
        color: var(--jyoti-ink) !important;
        opacity: 1 !important;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        aside {
        align-self: flex-start;
        max-height: calc(100vh - 9.25rem);
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: rgba(229, 154, 59, 0.28) transparent;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        aside::-webkit-scrollbar {
        width: 7px;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        aside::-webkit-scrollbar-track {
        background: transparent;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        aside::-webkit-scrollbar-thumb {
        background: rgba(229, 154, 59, 0.24);
        border-radius: 999px;
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        aside::-webkit-scrollbar-thumb:hover {
        background: rgba(229, 154, 59, 0.38);
      }

      @media (min-width: 1024px) {
        body:has([data-jyoti-product-shell="true"])
          [data-dashboard-content-canvas="true"]
          aside {
          position: sticky;
          top: 1rem;
        }
      }

      body:has([data-jyoti-product-shell="true"])
        [data-visual-reading-product="true"]
        h1,
      body:has([data-jyoti-product-shell="true"])
        [data-visual-reading-product="true"]
        h2,
      body:has([data-jyoti-product-shell="true"])
        [data-visual-reading-product="true"]
        h3 {
        color: var(--jyoti-ivory);
      }

      body:has([data-jyoti-product-shell="true"])
        [data-visual-reading-product="true"]
        p {
        color: var(--jyoti-muted-dark);
      }

      body:has([data-jyoti-product-shell="true"])
        [data-dashboard-content-canvas="true"]
        button {
        opacity: 1;
      }
    `}</style>
  );
}
