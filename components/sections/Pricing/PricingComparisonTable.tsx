'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  { name: 'Basic Kundali Chart', starter: true, advanced: true, supreme: true, quick: false, deep: true },
  { name: 'Full Kundali Analysis', starter: false, advanced: true, supreme: true, quick: false, deep: true },
  { name: 'Daily Horoscope', starter: true, advanced: true, supreme: true, quick: true, deep: false },
  { name: 'AI Guru Questions', starter: '5/day', advanced: 'Unlimited', supreme: 'Unlimited', quick: '1', deep: '3' },
  { name: 'Palmistry & Face Reading', starter: false, advanced: true, supreme: true, quick: false, deep: true },
  { name: 'Aura Scan', starter: false, advanced: true, supreme: true, quick: false, deep: true },
  { name: '12-Month Predictions', starter: false, advanced: true, supreme: true, quick: false, deep: false },
  { name: 'Career & Business Engine', starter: false, advanced: false, supreme: true, quick: false, deep: true },
  { name: 'Pregnancy Insights', starter: false, advanced: false, supreme: true, quick: false, deep: false },
  { name: 'Compatibility Analysis', starter: false, advanced: false, supreme: true, quick: false, deep: true },
  { name: 'Advanced Reports (PDF)', starter: false, advanced: false, supreme: true, quick: false, deep: false },
  { name: 'Priority Support', starter: false, advanced: false, supreme: true, quick: false, deep: false },
]

export function PricingComparisonTable() {
  return (
    <div className="mt-16 md:mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gold mb-4">
          Compare Plans
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Choose the plan that best fits your spiritual journey
        </p>
      </motion.div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-heading">Feature</th>
                <th className="text-center p-4 text-gold font-heading">Starter</th>
                <th className="text-center p-4 text-gold font-heading">Advanced</th>
                <th className="text-center p-4 text-gold font-heading">Supreme</th>
                <th className="text-center p-4 text-purple-300 font-heading">Quick (₹99)</th>
                <th className="text-center p-4 text-purple-300 font-heading">Deep (₹199)</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <motion.tr
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-white/90">{feature.name}</td>
                  <td className="p-4 text-center">
                    {typeof feature.starter === 'boolean' ? (
                      feature.starter ? (
                        <Check className="w-5 h-5 text-aura-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 mx-auto" />
                      )
                    ) : (
                      <span className="text-gold font-semibold">{feature.starter}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.advanced === 'boolean' ? (
                      feature.advanced ? (
                        <Check className="w-5 h-5 text-aura-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 mx-auto" />
                      )
                    ) : (
                      <span className="text-gold font-semibold">{feature.advanced}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.supreme === 'boolean' ? (
                      feature.supreme ? (
                        <Check className="w-5 h-5 text-aura-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 mx-auto" />
                      )
                    ) : (
                      <span className="text-gold font-semibold">{feature.supreme}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.quick === 'boolean' ? (
                      feature.quick ? (
                        <Check className="w-5 h-5 text-aura-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 mx-auto" />
                      )
                    ) : (
                      <span className="text-purple-300 font-semibold">{feature.quick}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.deep === 'boolean' ? (
                      feature.deep ? (
                        <Check className="w-5 h-5 text-aura-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 mx-auto" />
                      )
                    ) : (
                      <span className="text-purple-300 font-semibold">{feature.deep}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

