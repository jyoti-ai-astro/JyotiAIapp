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
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';
import { CosmicFooter } from '@/components/sections/Footer/CosmicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Calendar } from 'lucide-react';

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
    <PageTransitionWrapper>
      {/* R3F Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
          <Suspense fallback={null}>
            <NebulaShader intensity={1.0} />
            <ParticleField count={3000} intensity={1.0} />
            <RotatingMandala speed={0.1} intensity={0.8} />
          </Suspense>
        </Canvas>
      </div>

      <CosmicCursor />
      <SoundscapeController />

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 px-4"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="h-20 w-20 text-gold mx-auto" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white">Blog</h1>
          <p className="text-2xl md:text-3xl text-gold font-heading">Spiritual Insights & Wisdom</p>
        </motion.div>
      </div>

      {/* Blog Grid */}
      <div className="relative z-10 container mx-auto px-4 py-20">
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
      </div>

      <CosmicFooter />
    </PageTransitionWrapper>
  );
}

