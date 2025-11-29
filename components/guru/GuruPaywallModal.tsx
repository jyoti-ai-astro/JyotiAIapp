'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, Lock, Sparkles } from 'lucide-react'

interface GuruPaywallModalProps {
  onClose: () => void
  isOpen: boolean
}

export function GuruPaywallModal({ onClose, isOpen }: GuruPaywallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-cosmic-navy/95 border border-gold/30 rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4">
                <Lock className="w-8 h-8 text-gold" />
              </div>

              <h2 className="text-gold text-3xl font-display font-bold mb-2">Unlock AI Guru</h2>
              <p className="text-white/70 mb-6 text-sm">
                You've used all available questions. Choose a quick option to continue:
              </p>

              <div className="space-y-3">
                <Link href="/pay/99" onClick={onClose}>
                  <Button
                    variant="outline"
                    className="w-full bg-gold/10 border-gold/40 text-gold hover:bg-gold/20 py-6 text-base"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask 1 Question – ₹99
                  </Button>
                </Link>

                <Link href="/pay/199" onClick={onClose}>
                  <Button className="w-full bg-gold text-cosmic-navy hover:bg-gold/90 py-6 text-base font-bold">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask 3 Questions – ₹199 (Recommended)
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-xs text-white/50">
                No subscription required. Unlock instantly.
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

