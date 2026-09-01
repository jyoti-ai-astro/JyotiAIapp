'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

const faqs = [
  {
    question: 'What can I use for free?',
    answer: 'A new user can complete onboarding and generate the first basic Kundali without buying a paid Kundali ticket.',
  },
  {
    question: 'When should I choose a one-time pack?',
    answer: 'Choose a one-time pack when you need a specific Guru question, Kundali use, or prediction credit without starting a monthly subscription.',
  },
  {
    question: 'When should I choose a subscription?',
    answer: 'Choose a subscription when you expect to use JyotiAI regularly. Access depends on the active subscription state confirmed by the server.',
  },
  {
    question: 'When is access added?',
    answer: 'Access is applied after payment verification. A checkout result alone does not grant tickets or subscription access; JyotiAI verifies the payment on the server first.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Subscription lifecycle and plan access are managed through the Payments experience and the verified Razorpay subscription state.',
  },
  {
    question: 'Do I need accurate birth details?',
    answer: 'Yes. Personalized Kundali, Guru context, predictions, timelines and reports depend on the birth details saved to your JyotiAI profile.',
  },
];

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={staggerChildren(0.08)} className="space-y-9">
      <motion.div variants={fadeUp} className="space-y-3 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">Before checkout</p>
        <h2 className="font-heading text-4xl font-medium text-[#fff6df] md:text-5xl">Payment questions</h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-[#aab5b2] md:text-lg">Clear answers about free onboarding, one-time credits, subscriptions and verified access.</p>
      </motion.div>

      <div className="mx-auto max-w-4xl divide-y divide-[#d9b75f]/15 overflow-hidden rounded-[28px] border border-[#d9b75f]/18 bg-[#07131f]/74">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <motion.div key={faq.question} variants={fadeUp} className="bg-transparent">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex min-h-20 w-full items-center justify-between gap-5 px-6 py-5 text-left transition hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#efaa4f] md:px-8"
                aria-expanded={open}
                aria-controls={`pricing-faq-${index}`}
              >
                <span className="font-heading text-xl text-[#fff6df] md:text-2xl">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[#efaa4f] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`pricing-faq-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl px-6 pb-7 text-base leading-7 text-[#aab5b2] md:px-8">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
