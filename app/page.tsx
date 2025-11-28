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

import { CosmicFooter } from "@/components/sections/Footer/CosmicFooter";

export default function HomePage() {

  return (

    <PageTransitionWrapper>

      {/* Global background (non-R3F, clean gradient) */}

      <CosmicBackground intensity={1.0} />

      {/* Foreground content */}

      <div className="relative z-10 flex flex-col gap-16 md:gap-24">

        <section className="pt-24 md:pt-32">

          <CosmicHero
            variant="home"
            title="Your Destiny, Decoded by AI + Ancient Wisdom"
            subtitle="Astrology • Numerology • Aura • Palmistry • Remedies • Predictions"
            description="Experience the perfect fusion of ancient Indian spiritual sciences and cutting-edge AI technology. Get personalized insights, predictions, and guidance tailored to your unique cosmic blueprint."
            primaryCTA={{
              label: 'Start Free Reading',
              href: '/login',
            }}
            secondaryCTA={{
              label: 'Explore Features',
              href: '/features',
            }}
          />

        </section>

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

        <footer>

          <CosmicFooter />

        </footer>

      </div>

    </PageTransitionWrapper>

  );

}
