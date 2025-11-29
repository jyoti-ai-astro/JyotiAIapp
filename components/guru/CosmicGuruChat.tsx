'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, RefreshCw, AlertCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useGuruChat } from '@/lib/hooks/useGuruChat'
import { useUserStore } from '@/store/user-store'
import {
  getRemainingTickets,
  canAccessFeature,
  decrementTicket,
} from '@/lib/access/ticket-access'
import { GuruPaywallModal } from '@/components/guru/GuruPaywallModal'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const CosmicGuruChat = () => {
  const [input, setInput] = useState('')
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user, decrementLocalTicket } = useUserStore()
  
  // Check if user is admin (simple check - can be enhanced)
  const isAdmin = user?.email?.endsWith('@jyoti.ai') || user?.email?.includes('admin')

  // Use the existing hook for logic
  const { messages, sendMessage, loading, error, isTyping } = useGuruChat()

  // Check if user has access
  const hasSubscription = user?.subscription === 'pro' && user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()
  const remainingQuestions = getRemainingTickets(
    {
      hasSubscription: !!hasSubscription,
      tickets: user?.tickets,
    },
    'ai_question'
  )
  const canAskQuestion = canAccessFeature(
    {
      hasSubscription: !!hasSubscription,
      tickets: user?.tickets,
    },
    'ai_question'
  )

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    // Check access before sending
    if (!canAskQuestion) {
      // Show paywall modal
      setShowPaywallModal(true)
      return
    }

    const message = input
    setInput('') // Clear input immediately

    // Send message
    const success = await sendMessage(message)

    // Decrement ticket if message was sent successfully and user has tickets (not subscription)
    if (success && !hasSubscription && remainingQuestions > 0) {
      // Optimistically update local state
      decrementLocalTicket('ai_questions')

      // Decrement on server
      const decrementResult = await decrementTicket('ai_questions')
      if (decrementResult?.success && decrementResult.tickets) {
        // Update user store with server response
        useUserStore.getState().updateUser({
          tickets: decrementResult.tickets,
        })
      }
    }
  }

  // Convert messages to display format
  const displayMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role === 'guru' ? 'assistant' : 'user',
    content: msg.content,
    timestamp: msg.timestamp,
    metadata: msg.metadata,
  }))

  return (
    <>
      <GuruPaywallModal isOpen={showPaywallModal} onClose={() => setShowPaywallModal(false)} />
      <Card className="flex-1 flex flex-col bg-cosmic-indigo/30 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl relative">
        {/* Admin Debug Toggle */}
        {isAdmin && (
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs px-2 py-1 bg-black/50 text-white/60 hover:text-white rounded border border-white/10"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </button>
          </div>
        )}
      {/* Chat Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {/* Welcome Message if empty */}
        {displayMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
            <Sparkles className="w-12 h-12 text-purple-400" />
            <p className="max-w-xs text-sm">
              "Namaste. I have studied your charts. What seeks clarity today? Career, Love, or
              Destiny?"
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {displayMessages.map((msg, index) => (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm md:text-base leading-relaxed relative',
                  msg.role === 'user'
                    ? 'bg-purple-600/80 text-white rounded-br-none border border-purple-500/30'
                    : 'bg-white/10 text-white/90 rounded-bl-none border border-white/10 backdrop-blur-md'
                )}
              >
                {/* Avatar Icon */}
                <div
                  className={cn(
                    'absolute -bottom-6 w-6 h-6 rounded-full flex items-center justify-center border text-[10px]',
                    msg.role === 'user'
                      ? 'right-0 bg-purple-900 border-purple-500 text-purple-200'
                      : 'left-0 bg-indigo-900 border-indigo-500 text-indigo-200'
                  )}
                >
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : '🕉️'}
                </div>

                {/* Message Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Badges for Astro/RAG usage */}
                {msg.role === 'assistant' && msg.metadata && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {msg.metadata.usedAstroContext && (
                      <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                        ✨ Astro-aligned
                      </span>
                    )}
                    {msg.metadata.usedRag && (
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                        📜 Sacred texts
                      </span>
                    )}
                    {/* Debug info for admin */}
                    {showDebug && isAdmin && (
                      <div className="w-full mt-2 p-2 bg-black/30 rounded text-[10px] text-white/50 border border-white/5">
                        <div>Mode: {msg.metadata.mode || 'general'}</div>
                        <div>Astro: {msg.metadata.usedAstroContext ? 'Yes' : 'No'}</div>
                        <div>RAG: {msg.metadata.usedRag ? 'Yes' : 'No'}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-[10px] opacity-40 mt-2 text-right">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading / Typing Indicator */}
        {(isTyping || loading) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
            <div className="bg-white/5 rounded-2xl rounded-bl-none p-4 border border-white/5 flex gap-1 items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center w-full"
          >
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-4 py-2 rounded-full flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              <span>{error.message || 'The cosmic connection was interrupted.'}</span>
              <button onClick={() => window.location.reload()} className="hover:text-white underline ml-1">
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Paywall Buttons - Show if no access */}
      {!canAskQuestion && (
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2 text-gold text-sm mb-2">
              <Lock className="w-4 h-4" />
              <span>Unlock AI Guru Questions</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/pay/99" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gold/30 text-gold hover:bg-gold/10"
                >
                  Ask 1 Question — ₹99
                </Button>
              </Link>
              <Link href="/pay/199" className="block">
                <Button className="w-full bg-gold text-cosmic-navy hover:bg-gold/90">
                  Ask 3 Questions — ₹199
                </Button>
              </Link>
            </div>
            {hasSubscription && (
              <p className="text-xs text-white/50 text-center">
                Your subscription may have expired. Renew or purchase one-time questions.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5 relative z-20">
        {canAskQuestion && (
          <>
            {remainingQuestions > 0 && !hasSubscription && (
              <div className="mb-2 text-xs text-white/60 text-center">
                {remainingQuestions} question{remainingQuestions !== 1 ? 's' : ''} remaining
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your destiny..."
                disabled={loading || isTyping}
                className="bg-white/5 border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50 pr-12 h-12 text-base text-white placeholder:text-white/40"
              />
              <Button
                type="submit"
                disabled={!input.trim() || loading || isTyping}
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || isTyping ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            <div className="text-center mt-2">
              <p className="text-[10px] text-white/30">
                AI can make mistakes. Trust your intuition and consult ancient scriptures.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
    </>
  )
}

