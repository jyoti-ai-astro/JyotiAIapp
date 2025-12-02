/**
 * About Page
 * 
 * Batch 5 - Company Pages
 * 
 * Mission, Vision, Technology, Sacred Sources with R3F background
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Code, Book } from 'lucide-react';
import CompanyPageShell from '@/src/ui/layout/CompanyPageShell';
import { CompanyTimeline } from '@/components/sections/about/CompanyTimeline';
import { TestimonialsSection } from '@/components/sections/testimonials/TestimonialsSection';

export default function AboutPage() {
  return (
    <CompanyPageShell
      eyebrow="Our Story"
      title={
        <>
          JyotiAI is building the modern bridge between{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            code and cosmos
          </span>
        </>
      }
      description="We combine ancient Vedic wisdom with cutting-edge AI to make personalized astrological guidance accessible to everyone."
    >
      {/* 2-column intro block */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">What we believe</h2>
          <p className="text-white/70 leading-relaxed">
            Ancient wisdom holds timeless truths. By combining Vedic astrology, numerology, and palmistry with modern AI,
            we make these insights accessible to everyone, regardless of their background or location.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">What we&apos;re building</h2>
          <p className="text-white/70 leading-relaxed">
            A complete spiritual operating system that helps millions discover their true purpose and navigate life&apos;s
            challenges with confidence. From birth charts to real-time AI guidance, we&apos;re building the future of
            spiritual technology.
          </p>
        </div>
      </div>

      {/* Mission, Vision, Technology, Sacred Sources */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Target className="h-8 w-8 text-[#FFD57A]" />
                <CardTitle className="text-2xl font-heading text-white">Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-white/70 leading-relaxed">
              <p>
                To democratize access to ancient spiritual wisdom through modern AI technology, making personalized
                astrological guidance accessible to everyone, regardless of their background or location.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Eye className="h-8 w-8 text-cyan-400" />
                <CardTitle className="text-2xl font-heading text-white">Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-white/70 leading-relaxed">
              <p>
                To become the world&apos;s most trusted spiritual guidance platform, combining the timeless wisdom of
                Vedic astrology, numerology, and palmistry with cutting-edge AI to help millions discover their true
                purpose and navigate life&apos;s challenges with confidence.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Code className="h-8 w-8 text-green-400" />
                <CardTitle className="text-2xl font-heading text-white">Technology</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-white/70 leading-relaxed">
              <p>
                We leverage advanced AI models, Swiss Ephemeris for precise astronomical calculations, and modern
                web technologies to deliver accurate, personalized spiritual insights. Our platform uses React Three
                Fiber for immersive cosmic experiences and real-time data processing for instant results.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Book className="h-8 w-8 text-violet-400" />
                <CardTitle className="text-2xl font-heading text-white">Sacred Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-white/70 leading-relaxed">
              <p>
                Our calculations are based on ancient Vedic texts including Brihat Parashara Hora Shastra, Jaimini
                Sutras, and classical palmistry texts. We honor the traditional methods while making them accessible
                through modern technology.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Company Timeline */}
      <div className="mb-12">
        <CompanyTimeline
          entries={[
            {
              title: '2024 - Public Launch',
              content: 'JyotiAI launched publicly, bringing Vedic astrology and AI together for the first time.',
            },
            {
              title: '2024 - AI Guru Integration',
              content: 'Integrated advanced AI with RAG (Retrieval-Augmented Generation) for personalized cosmic guidance.',
            },
            {
              title: '2024 - Multi-Module Expansion',
              content: 'Added palmistry, face reading, aura scanning, and compatibility analysis modules.',
            },
          ]}
        />
      </div>

      {/* Testimonials */}
      <div>
        <TestimonialsSection
          title="What seekers are saying"
          description="Real people using JyotiAI every day in India & beyond."
          testimonials={[
            {
              author: {
                name: 'Priya Sharma',
                role: 'From Mumbai',
                avatar: undefined,
              },
              text: 'More accurate than any astrologer I&apos;ve consulted. The AI Guru understands context and remembers my chart.',
            },
            {
              author: {
                name: 'Rajesh Kumar',
                role: 'From Delhi',
                avatar: undefined,
              },
              text: 'Career Engine changed my life. I found my ideal path and the timing was perfect.',
            },
            {
              author: {
                name: 'Ananya Patel',
                role: 'From Bangalore',
                avatar: undefined,
              },
              text: 'Pregnancy prediction beautifully explained. The insights helped me prepare for this new phase.',
            },
          ]}
        />
      </div>
    </CompanyPageShell>
  );
}

