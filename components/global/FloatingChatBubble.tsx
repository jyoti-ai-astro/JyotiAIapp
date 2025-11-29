'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingChatBubble() {
  return (
    <Link href="/guru">
      <motion.div
        className={cn(
          'fixed bottom-6 right-6 z-[9000]',
          'bg-gradient-to-r from-gold to-gold/80',
          'text-cosmic-navy rounded-full p-4 shadow-2xl',
          'cursor-pointer hover:scale-110 transition-transform',
          'border-2 border-gold/50',
          'flex items-center gap-2 font-heading font-semibold'
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">Ask Jyoti</span>
        <MessageCircle className="w-5 h-5 sm:hidden" />
      </motion.div>
    </Link>
  )
}

