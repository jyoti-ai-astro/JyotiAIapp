'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Sparkles,
  Send,
  Lock,
  ArrowRight,
  Zap,
  Crown,
  Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useUserStore } from '@/store/user-store'
import { useRouter } from 'next/navigation'
import { useGuruChat } from '@/lib/hooks/useGuruChat'
import { cn } from '@/lib/utils'

export const GuruChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [input, setInput] = useState('')

  // UI State: 'guest' | 'chat' | 'blocked'
  const [viewState, setViewState] = useState<'guest' | 'chat' | 'blocked'>('guest')

  const { user, canChat, consumeGuruCredit } = useUserStore()
  const router = useRouter()
  const { messages, sendMessage, isLoading, isTyping } = useGuruChat(
    user && viewState === 'chat' ? `session-${user.uid}` : undefined
  )

  // Determine State
  useEffect(() => {
    if (!user) {
      setViewState('guest')
    } else if (canChat()) {
      setViewState('chat')
    } else {
      setViewState('blocked')
    }
  }, [user, canChat, isOpen])

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('pending_lead', JSON.stringify({ name: guestName, email: guestEmail }))
    setIsOpen(false)
    router.push('/pricing?ref=chat_lead')
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (canChat()) {
      const msg = input
      setInput('')
      consumeGuruCredit() // Decrement ticket or daily count
      await sendMessage(msg)
    } else {
      setViewState('blocked')
    }
  }

  const getRemainingCount = (): number | string => {
    if (!user) return 0
    if (['advanced', 'supreme'].includes(user.subscription)) return '∞'
    if (user.tickets > 0) return user.tickets
    if (user.subscription === 'starter') {
      const today = new Date().toISOString().split('T')[0]
      const isNewDay = user.dailyUsage?.date !== today
      const currentCount = isNewDay ? 0 : user.dailyUsage?.count || 0
      return Math.max(0, 5 - currentCount)
    }
    return 0
  }

  const getPlanLabel = () => {
    if (!user) return 'Standard'
    if (user.subscription === 'advanced') return 'Unlimited'
    if (user.tickets > 0) return `${user.tickets} Tickets`
    if (user.subscription === 'starter') return 'Daily Plan'
    return 'Standard'
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
            <MessageCircle className="w-8 h-8" />

            {/* Counter Badge */}
            {user && getRemainingCount() !== 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-purple-900">
                {getRemainingCount()}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[90vw] md:w-[380px] h-[550px] flex flex-col"
          >
            <Card className="flex-1 flex flex-col bg-cosmic-navy/95 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden rounded-3xl border">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">AI Guru</h3>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">
                      {getPlanLabel()}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-white/50 hover:text-white transition-colors" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-hidden relative">
                {/* 1. GUEST MODE */}
                {viewState === 'guest' && (
                  <div className="h-full p-6 flex flex-col justify-center text-center space-y-6">
                    <h4 className="text-xl font-display font-bold text-gold">
                      Unlock Your Destiny
                    </h4>
                    <p className="text-sm text-white/70">
                      Connect with the AI Guru to reveal insights about your career, love, and life
                      path.
                    </p>
                    <form onSubmit={handleGuestSubmit} className="space-y-3">
                      <Input
                        placeholder="Your Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        required
                      />
                      <Button className="w-full bg-gold text-black font-bold hover:bg-yellow-500">
                        Start Chatting
                      </Button>
                    </form>
                  </div>
                )}

                {/* 2. CHAT MODE */}
                {viewState === 'chat' && (
                  <div className="flex-1 flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {messages.length === 0 && (
                        <div className="text-center text-white/40 mt-8 text-xs">
                          <p>Ask about:</p>
                          <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {["Tomorrow's luck", 'Love compatibility', 'Career switch'].map((t) => (
                              <span
                                key={t}
                                className="border border-white/10 px-2 py-1 rounded-full bg-white/5"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {messages.map((msg, i) => (
                        <div
                          key={msg.id || i}
                          className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] p-3 rounded-2xl text-sm',
                              msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-white/10 text-white/90 rounded-bl-none backdrop-blur-md'
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {(isLoading || isTyping) && (
                        <div className="text-xs text-white/40 p-2 animate-pulse flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                          <span>Guru is thinking...</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-black/20 border-t border-white/5">
                      {/* Show remaining count for non-unlimited users */}
                      {user &&
                        !['advanced', 'supreme'].includes(user.subscription) &&
                        getRemainingCount() !== 0 && (
                          <div className="mb-2 text-xs text-white/60 text-center">
                            {getRemainingCount()}{' '}
                            {typeof getRemainingCount() === 'number' &&
                              getRemainingCount() === 1
                              ? 'question'
                              : 'questions'}{' '}
                            remaining
                          </div>
                        )}
                      <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type a message..."
                          disabled={isLoading || !canChat()}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-purple-500 disabled:opacity-50"
                        />
                        <Button
                          size="icon"
                          type="submit"
                          disabled={!input.trim() || isLoading || !canChat()}
                          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 3. BLOCKED / UPGRADE MODE */}
                {viewState === 'blocked' && (
                  <div className="h-full p-6 flex flex-col justify-center text-center space-y-6 relative">
                    <div className="absolute inset-0 bg-[url('/hero/hero-cosmos.png')] bg-cover opacity-20 blur-sm" />

                    <div className="relative z-10 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Limit Reached</h4>
                        <p className="text-xs text-white/60 mt-1">Get more answers instantly.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => {
                            setIsOpen(false)
                            router.push('/pay/99?ref=chat_widget')
                          }}
                          variant="outline"
                          className="border-white/20 hover:bg-white/10 flex-col h-auto py-3 gap-1"
                        >
                          <span className="text-xs font-bold text-white">Quick</span>
                          <span className="text-[10px] text-white/50">1 Q (₹99)</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setIsOpen(false)
                            router.push('/pay/199?ref=chat_widget')
                          }}
                          variant="outline"
                          className="border-white/20 hover:bg-white/10 flex-col h-auto py-3 gap-1"
                        >
                          <span className="text-xs font-bold text-white">Deep</span>
                          <span className="text-[10px] text-white/50">3 Q (₹199)</span>
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          setIsOpen(false)
                          router.push('/pricing')
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                      >
                        Go Unlimited <Crown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
