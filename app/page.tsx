"use client";

import React from "react";

import { CosmicBackground } from "@/components/cosmic/CosmicBackground";

import { PageTransitionWrapper } from "@/components/global/PageTransitionWrapper";

// Sections

import { CosmicHero } from "@/components/sections/Hero/CosmicHero";

import { CosmicFeatures } from "@/components/sections/Features/CosmicFeatures";

import { TestimonialsSection } from "@/components/sections/Testimonials/TestimonialsSection";

import { ModulesSection } from "@/components/sections/Modules/ModulesSection";

import { PricingCards } from "@/components/sections/Pricing/PricingCards";

import { AstrologicalWheel3D } from "@/components/sections/AstrologicalWheel/AstrologicalWheel3D";

import { RoadmapTimeline } from "@/components/sections/Roadmap/RoadmapTimeline";

export default function HomePage() {

  return (

    <PageTransitionWrapper>

      {/* Global background (non-R3F, clean gradient) */}

      <CosmicBackground intensity={1.0} />

      {/* Foreground content */}

      <div className="relative z-10">

        {/* Hero Section */}
        <CosmicHero
          variant="home"
          title="Your Personal Spiritual OS"
          subtitle="Astrology, Numerology, Aura, Palmistry and AI Guru — unified into one intelligent platform."
          primaryCTA={{
            label: 'Start Your Reading',
            href: '/login',
          }}
          secondaryCTA={{
            label: 'View Plans',
            href: '/pricing',
          }}
        />

        {/* Other Sections */}
        <div className="flex flex-col gap-12 md:gap-16">

        <section id="features">

          <CosmicFeatures
            variant="home"
            title="Cosmic Features"
            subtitle="Powered by the Universe. Driven by Precision."
          />

        </section>

        <section id="testimonials">

          <TestimonialsSection />

        </section>

        <section id="modules">

          <ModulesSection />

        </section>

        <section id="pricing">

          <PricingCards />

        </section>

        <section id="wheel">

          <AstrologicalWheel3D />

        </section>

        <section id="roadmap">

          <RoadmapTimeline />

        </section>

        </div>

      </div>

    </PageTransitionWrapper>

  );

}
