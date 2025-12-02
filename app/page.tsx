'use client';

import React from 'react';
import HomeHero from '@/src/ui/sections/home/HomeHero';
import HomeValueProps from '@/src/ui/sections/home/HomeValueProps';
import HomeHowItWorks from '@/src/ui/sections/home/HomeHowItWorks';
import HomeSocialProof from '@/src/ui/sections/home/HomeSocialProof';
import HomePricingTeaser from '@/src/ui/sections/home/HomePricingTeaser';
import HomeFinalCTA from '@/src/ui/sections/home/HomeFinalCTA';

export default function HomePage() {
  return (
    <div className="relative">
      <section className="page-container pt-8 md:pt-16">
        <HomeHero />
      </section>

      <section className="page-container pt-8 md:pt-16">
        <HomeValueProps />
      </section>

      <section className="page-container pt-8 md:pt-20">
        <HomeHowItWorks />
      </section>

      <section className="page-container pt-12 md:pt-20">
        <HomeSocialProof />
      </section>

      <section className="page-container pt-12 md:pt-20">
        <HomePricingTeaser />
      </section>

      <section className="page-container pt-16 md:pt-24 pb-16 md:pb-24">
        <HomeFinalCTA />
      </section>
    </div>
  );
}
