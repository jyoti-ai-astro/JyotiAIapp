'use client';

import PricingHero from '@/src/ui/sections/pricing/PricingHero';
import PricingFAQ from '@/src/ui/sections/pricing/PricingFAQ';
import PricingSection6 from '@/components/sections/Pricing/PricingSection6';

export default function PricingPage() {
  return (
    <div className="relative">
      <section className="page-container pt-8 md:pt-16">
        <PricingHero />
      </section>

      <section className="page-container pt-10 md:pt-16">
        <PricingSection6 />
      </section>

      <section className="page-container pt-12 md:pt-20 pb-16 md:pb-24">
        <PricingFAQ />
      </section>
    </div>
  );
}

