'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

const faqs = [
  {
    question: 'Is JyotiAI replacing real astrologers?',
    answer:
      'No. JyotiAI is a tool that augments traditional astrology with AI precision. Many users consult both JyotiAI and traditional astrologers for a complete perspective.',
  },
  {
    question: "Can I use this if I don't know my birth time?",
    answer:
      'Yes, but accuracy improves with exact birth time. If you only know your date of birth, we can still provide insights based on your sun sign and general planetary positions.',
  },
  {
    question: 'What happens when I hit my free question limit?',
    answer:
      'You can upgrade to Premium for unlimited questions, or wait for your monthly free questions to reset. We also offer one-time question packs.',
  },
  {
    question: 'How is my data stored?',
    answer:
      'All birth details and conversations are encrypted end-to-end. We never share your data with third parties. Your privacy is sacred to us.',
  },
  {
    question: 'Do you support multiple birth charts?',
    answer:
      'Yes! Premium users can create and manage multiple profiles (family members, friends) and compare compatibility between charts.',
  },
  {
    question: 'What makes JyotiAI different from other astrology apps?',
    answer:
      'JyotiAI combines Vedic-grade calculations (Brihat Parashara Hora Shastra) with real-time AI guidance. Our Guru understands context, remembers your chart, and provides personalized insights—not generic horoscopes.',
  },
];

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={staggerChildren(0.1)}
      className="space-y-8"
    >
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">
          Frequently asked{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            questions
          </span>
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Everything you need to know about JyotiAI plans and features.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            variants={fadeUp}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0A0F1F]/80 to-[#1A2347]/60 backdrop-blur-sm overflow-hidden hover:border-[#FFD57A]/30 transition-all duration-300"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white pr-4">
                {faq.question}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-[#FFD57A] flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-6 pb-6"
              >
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

