'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/src/ui/theme/global-motion';
import { TestimonialsSection } from '@/components/sections/testimonials/TestimonialsSection';
import { IndiaCustomersWidget } from '@/components/sections/marketing/IndiaCustomersWidget';
import type { TestimonialItem } from '@/components/sections/testimonials/TestimonialsSection';

const testimonials: TestimonialItem[] = [
  {
    author: {
      name: 'A user from Mumbai',
      location: 'Mumbai, India',
    },
    text: 'JyotiAI helped me understand my career path through dasha predictions. The Guru AI answered all my questions with incredible depth.',
  },
  {
    author: {
      name: 'A user from Delhi',
      location: 'Delhi, India',
    },
    text: 'The kundali generator is so accurate! I compared it with my traditional astrologer and the calculations matched perfectly.',
  },
  {
    author: {
      name: 'A user from Bengaluru',
      location: 'Bengaluru, India',
    },
    text: 'Real-time predictions and personalized guidance. This is the future of spiritual consultation. Highly recommended!',
  },
  {
    author: {
      name: 'A user from Hyderabad',
      location: 'Hyderabad, India',
    },
    text: 'The numerology and compatibility analysis helped me make better life decisions. The AI Guru is incredibly insightful.',
  },
];

export default function HomeSocialProof() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={fadeUp}
      className="space-y-12"
    >
      {/* India Customers Widget */}
      <div className="lg:hidden">
        <IndiaCustomersWidget />
      </div>

      {/* Desktop: Two Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <IndiaCustomersWidget />
        </div>
        <div>
          <TestimonialsSection
            title="What seekers are saying"
            description="Real people using JyotiAI every day in India & beyond."
            testimonials={testimonials}
            className="bg-transparent py-0"
          />
        </div>
      </div>

      {/* Mobile: Stacked Layout */}
      <div className="lg:hidden">
        <TestimonialsSection
          title="What seekers are saying"
          description="Real people using JyotiAI every day in India & beyond."
          testimonials={testimonials}
          className="bg-transparent py-0"
        />
      </div>
    </motion.div>
  );
}

