'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

const faqs = [
  {
    question: 'What can I use for free?',
    answer:
      'A new user can complete onboarding and generate the first basic Kundali without buying a paid Kundali ticket.',
  },
  {
    question: 'When should I choose a one-time pack?',
    answer:
      'Choose a one-time pack when you need a specific Guru question, Kundali use, or prediction credit without starting a monthly subscription.',
  },
  {
    question: 'When should I choose a subscription?',
    answer:
      'Choose a subscription when you expect to use JyotiAI regularly. Access is based on the active subscription state confirmed by the server.',
  },
  {
    question: 'When is access added?',
    answer:
      'Access is applied after payment verification. The checkout page may receive a payment result, but JyotiAI grants tickets or subscription access only after server verification.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Plan management is handled through the Payments page and Razorpay subscription lifecycle. The app should only show access for active subscription states.',
  },
  {
    question: 'Do I need accurate birth details?',
    answer:
      'Yes. Personalized Kundali, Guru context, predictions, timelines, and reports depend on verified birth details and generated Kundali data.',
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
        <h2 className="font-heading text-3xl font-semibold text-primary md:text-4xl lg:text-5xl">
          Payment questions
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Clear answers about free onboarding, one-time credits, subscriptions, and verified access.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            variants={fadeUp}
            className="overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-saffron/50"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex min-h-14 w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-expanded={openIndex === index}
            >
              <h3 className="pr-4 text-lg font-semibold text-primary">
                {faq.question}
              </h3>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-saffron transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
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
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
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
