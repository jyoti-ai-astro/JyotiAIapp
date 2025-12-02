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
  const inputRef = useRef<HTMLInputElement>(null) // Super Phase C
  const { user, decrementLocalTicket } = useUserStore()
  
  // Check if user is admin (simple check - can be enhanced)
  const isAdmin = user?.email?.endsWith('@jyoti.ai') || user?.email?.includes('admin')

  // Use the existing hook for logic (Super Phase C - Enhanced)
  const {
    messages,
    sendMessage,
    loading,
    error,
    isTyping,
    status,
    errorCode,
    errorMessage,
    reconnect,
  } = useGuruChat()

  // Check if user has access
  const hasSubscription = user?.subscription === 'pro' && user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()
  // Phase G: Use aiGuruTickets from new ticket system
  const aiGuruTickets = user?.aiGuruTickets || 0
  const remainingQuestions = hasSubscription ? Infinity : aiGuruTickets
  const canAskQuestion = hasSubscription || aiGuruTickets > 0

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

    // Phase N: Optimistically decrement ticket count on client after successful send
    if (success && !hasSubscription && remainingQuestions > 0) {
      // Optimistically update local state
      const { user, updateUser } = useUserStore.getState()
      if (user) {
        updateUser({
          ...user,
          aiGuruTickets: Math.max(0, (user.aiGuruTickets || 0) - 1),
          tickets: Math.max(0, (user.tickets || 0) - 1),
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
      <Card className="glass-card flex-1 flex flex-col overflow-hidden relative">
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
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar"
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

                {/* Badges for Astro/RAG usage and Mode - Super Phase C */}
                {msg.role === 'assistant' && msg.metadata && (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {/* Super Phase B - Mode badge */}
                      {msg.metadata.mode && (
                        <span className="text-[10px] px-2 py-0.5 bg-gold/20 text-gold rounded-full border border-gold/30">
                          Mode: {msg.metadata.mode === 'CareerGuide' ? 'Career Guide' :
                                 msg.metadata.mode === 'RelationshipGuide' ? 'Relationship Guide' :
                                 msg.metadata.mode === 'RemedySpecialist' ? 'Remedy Specialist' :
                                 msg.metadata.mode === 'TimelineExplainer' ? 'Timeline Explainer' :
                                 msg.metadata.mode === 'GeneralSeer' ? 'General Seer' :
                                 msg.metadata.mode}
                        </span>
                      )}
                      {msg.metadata.usedAstroContext && (
                        <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                          ✨ Astro-aligned
                        </span>
                      )}
                      {/* Super Phase C - Knowledge Vault badge */}
                      {msg.metadata.usedRag ? (
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                          📚 Knowledge Vault: ON
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30">
                          📚 Knowledge Vault: OFF (pure intuition mode)
                        </span>
                      )}
                    </div>

                    {/* Super Phase C - Sources Panel (Collapsible) */}
                    {msg.metadata.ragChunks && msg.metadata.ragChunks.length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-gold/80 hover:text-gold">
                          📖 View Sources ({msg.metadata.ragChunks.length})
                        </summary>
                        <div className="mt-2 space-y-2 pl-4 border-l border-gold/20">
                          {msg.metadata.ragChunks.map((chunk, idx) => (
                            <div key={idx} className="bg-white/5 p-2 rounded border border-white/10">
                              {chunk.title && (
                                <div className="font-semibold text-gold mb-1">{chunk.title}</div>
                              )}
                              <p className="text-white/70 text-[10px] line-clamp-2">{chunk.snippet}</p>
                              {chunk.source && (
                                <div className="text-white/50 text-[9px] mt-1">Source: {chunk.source}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Debug info for admin - Super Phase C */}
                    {showDebug && isAdmin && (
                      <div className="w-full mt-2 p-2 bg-black/30 rounded text-[10px] text-white/50 border border-white/5">
                        <div>Mode: {msg.metadata.mode || 'general'}</div>
                        <div>Astro: {msg.metadata.usedAstroContext ? 'Yes' : 'No'}</div>
                        <div>RAG: {msg.metadata.usedRag ? 'Yes' : 'No'}</div>
                        <div>Status: {msg.metadata.status || 'ok'}</div>
                        {msg.metadata.ragChunks && (
                          <div>RAG Chunks: {msg.metadata.ragChunks.length}</div>
                        )}
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
            <div                 className="bg-white/5 rounded-2xl rounded-bl-none p-4 border border-white/5 flex gap-1 items-center">
              <motion.span 
                className="w-2 h-2 bg-gold rounded-full" 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              />
              <motion.span 
                className="w-2 h-2 bg-gold rounded-full" 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              />
              <motion.span 
                className="w-2 h-2 bg-gold rounded-full" 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
              />
            </div>
          </motion.div>
        )}

        {/* Error State - Super Phase C */}
        {status === 'error' && errorCode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center w-full mb-4"
          >
            {errorCode === 'NO_TICKETS' ? (
              <div className="bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-3 rounded-lg flex flex-col gap-3 max-w-md w-full">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">You've used all your AI Guru credits</span>
                </div>
                <p className="text-white/70 text-xs">Unlock more for instant access:</p>
                <div className="flex gap-2">
                  <Link href="/pay/99" className="flex-1">
                    <Button size="sm" className="w-full gold-btn text-xs">
                      Ask 1 Question — ₹99
                    </Button>
                  </Link>
                  <Link href="/pay/199" className="flex-1">
                    <Button size="sm" className="w-full gold-btn text-xs">
                      Ask 3 Questions — ₹199
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-lg flex flex-col gap-2 max-w-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">
                    {errorCode === 'UNAUTHENTICATED'
                      ? 'Please log in again'
                      : errorCode === 'GURU_TIMEOUT'
                      ? 'The Guru is overloaded'
                      : errorCode === 'RAG_UNAVAILABLE'
                      ? 'Knowledge vault is temporarily offline'
                      : errorCode === 'NETWORK'
                      ? 'Network error'
                      : 'Something went wrong'}
                  </span>
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-300/80">{errorMessage}</p>
                )}
                <div className="flex gap-2 mt-1">
                  {errorCode === 'UNAUTHENTICATED' ? (
                    <Link href="/login">
                      <Button size="sm" variant="outline" className="text-xs">
                        Go to Login
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        reconnect()
                        // Clear error state and allow retry
                        setStatus('idle')
                        setErrorCode(undefined)
                        setErrorMessage(undefined)
                        inputRef.current?.focus()
                      }}
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Degraded Mode Notice - Super Phase C */}
        {status !== 'error' && messages.some((m) => m.metadata?.status === 'degraded') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center w-full mb-4"
          >
            <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 text-xs px-4 py-2 rounded-lg">
              Knowledge vault is temporarily offline; basic guidance is still available.
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
            {!hasSubscription && (
              <div className="mb-2 text-xs text-white/60 text-center">
                {remainingQuestions > 0 ? (
                  <>Credits left: {remainingQuestions}</>
                ) : (
                  <>No credits remaining</>
                )}
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 relative">
              <Input
                ref={inputRef}
                disabled={!canAskQuestion || loading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your spiritual question..."
                disabled={loading || isTyping || status === 'error'}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors pr-12 h-12 text-base"
              />
              <Button
                type="submit"
                disabled={!input.trim() || loading || isTyping}
                size="icon"
                className="gold-btn absolute right-1 top-1 h-10 w-10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

