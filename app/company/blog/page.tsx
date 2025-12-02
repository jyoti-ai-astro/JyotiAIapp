/**
 * Blog Page
 * 
 * Batch 5 - Company Pages
 * 
 * Grid of blog posts (placeholder cards)
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';

export default function BlogPage() {
  const posts = [
    {
      title: 'Understanding Your Kundali: A Beginner\'s Guide',
      description: 'Learn the basics of reading your birth chart and understanding planetary positions.',
      date: '2024-01-15',
      category: 'Astrology',
    },
    {
      title: 'The Power of Numerology in Daily Life',
      description: 'Discover how numbers influence your life path and decision-making.',
      date: '2024-01-10',
      category: 'Numerology',
    },
    {
      title: 'Palmistry: Reading Your Life Lines',
      description: 'Explore the ancient art of palm reading and what your hands reveal.',
      date: '2024-01-05',
      category: 'Palmistry',
    },
    {
      title: 'AI and Spirituality: The Future of Guidance',
      description: 'How artificial intelligence is revolutionizing spiritual guidance and astrology.',
      date: '2023-12-28',
      category: 'Technology',
    },
    {
      title: 'Understanding Dasha Periods',
      description: 'A comprehensive guide to Vimshottari Dasha and its impact on your life.',
      date: '2023-12-20',
      category: 'Astrology',
    },
    {
      title: 'Chakra Balancing Through Aura Reading',
      description: 'Learn how to balance your chakras using aura analysis techniques.',
      date: '2023-12-15',
      category: 'Aura',
    },
  ];

  return (
    <CompanyPageShell
      eyebrow="Blog"
      title={
        <>
          Stories from the{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            JyotiAI universe
          </span>
        </>
      }
      description="Spiritual insights, wisdom, and updates from our team"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-[0_0_30px_rgba(110,45,235,0.3)] h-full">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gold mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-2xl font-display text-gold">{post.title}</CardTitle>
                  <CardDescription className="text-white/60">{post.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">{post.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>
    </CompanyPageShell>
  );
}

