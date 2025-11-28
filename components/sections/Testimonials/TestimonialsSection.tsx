/**
 * Testimonials Section Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * 6 testimonials + stats block (50K+ Users, 100K+ Predictions, 4.9/5 Rating)
 */

'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    text: 'More accurate than any astrologer I\'ve consulted. The AI Guru understands context and gives practical advice.',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Business Owner',
    text: 'Career Engine changed my life. The business compatibility checker helped me choose the right venture.',
    rating: 5,
  },
  {
    name: 'Ananya Patel',
    role: 'Homemaker',
    text: 'Pregnancy prediction beautifully explained. The timeline feature helped me prepare for my baby\'s arrival.',
    rating: 5,
  },
  {
    name: 'Vikram Malhotra',
    role: 'Marketing Director',
    text: 'AI Guru is like talking to a wise friend. The RAG-powered insights are incredibly detailed and helpful.',
    rating: 5,
  },
  {
    name: 'Meera Reddy',
    role: 'Student',
    text: 'Palmistry reading incredibly detailed. The AI vision analysis caught details I never noticed in my palms.',
    rating: 5,
  },
  {
    name: 'Arjun Singh',
    role: 'Architect',
    text: 'Vastu AI helped redesign office. The compatibility engine suggested perfect layout changes.',
    rating: 5,
  },
];

const stats = {
  users: 50000,
  predictions: 100000,
  rating: 4.9,
};

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative py-20 md:py-32"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white">
            Trusted by Thousands
          </h2>
          <p className="text-xl md:text-2xl text-gold font-heading">
            Real stories from people who found their path
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white h-full">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-gold/50 mb-4" />
                  <p className="text-white/80 mb-4 italic">{testimonial.text}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gold">{testimonial.name}</p>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Block */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center">
            <motion.div
              className="text-5xl md:text-6xl font-display font-bold text-gold mb-2"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 0.8, type: 'spring' }}
            >
              {stats.users.toLocaleString()}+
            </motion.div>
            <p className="text-white/70 text-lg">Active Users</p>
          </div>
          <div className="text-center">
            <motion.div
              className="text-5xl md:text-6xl font-display font-bold text-aura-cyan mb-2"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 0.9, type: 'spring' }}
            >
              {stats.predictions.toLocaleString()}+
            </motion.div>
            <p className="text-white/70 text-lg">Predictions Generated</p>
          </div>
          <div className="text-center">
            <motion.div
              className="text-5xl md:text-6xl font-display font-bold text-gold mb-2 flex items-center justify-center gap-2"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 1.0, type: 'spring' }}
            >
              {stats.rating}
              <Star className="h-8 w-8 fill-gold text-gold" />
            </motion.div>
            <p className="text-white/70 text-lg">Average Rating</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

