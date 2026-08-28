'use client';

import PricingHero from '@/src/ui/sections/pricing/PricingHero';
import PricingFAQ from '@/src/ui/sections/pricing/PricingFAQ';
import PricingSection6 from '@/components/sections/Pricing/PricingSection6';

export default function PricingPage() {
  return (
    <div
      data-pricing-experience="true"
      className="relative min-h-screen overflow-hidden bg-[#050d11] text-[#eee7dc]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_78%_4%,rgba(229,154,59,0.10),transparent_30rem),radial-gradient(circle_at_14%_26%,rgba(72,137,140,0.07),transparent_26rem)]"
      />

      <div className="relative z-10">
        <section className="page-container pt-10 md:pt-16">
          <PricingHero />
        </section>

        <section className="page-container pt-10 md:pt-16">
          <PricingSection6 />
        </section>

        <section className="page-container pb-16 pt-12 md:pb-24 md:pt-20">
          <PricingFAQ />
        </section>
      </div>

      <style jsx global>{`
        body:has([data-pricing-experience="true"]) header {
          background: rgba(3, 10, 14, 0.975) !important;
          border-bottom-color: rgba(224, 170, 82, 0.14) !important;
          color: #f5eee2 !important;
          backdrop-filter: blur(18px) saturate(115%) !important;
          -webkit-backdrop-filter: blur(18px) saturate(115%) !important;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.20) !important;
        }

        body:has([data-pricing-experience="true"]) header a,
        body:has([data-pricing-experience="true"]) header button {
          color: #e9e3d8;
        }

        [data-pricing-experience="true"] > div h1,
        [data-pricing-experience="true"] > div h2 {
          color: #f3ecdf;
        }

        [data-pricing-experience="true"] > div > section:first-of-type p {
          color: #aeb8b5;
        }

        [data-pricing-experience="true"]
          > div
          > section:first-of-type
          [class*="text-saffron"] {
          color: #e5a24a;
        }
      `}</style>
    </div>
  );
}

