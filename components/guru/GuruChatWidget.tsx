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
import { usePathname, useRouter } from 'next/navigation'
import { useGuruChat } from '@/lib/hooks/useGuruChat'
import { cn } from '@/lib/utils'

export const GuruChatWidget = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [input, setInput] = useState('')

  // UI State: 'guest' | 'chat' | 'blocked'
  const [viewState, setViewState] = useState<'guest' | 'chat' | 'blocked'>('guest')

  const { user, canChat, updateUser } = useUserStore()
  const router = useRouter()
  const { messages, sendMessage, isLoading, isTyping } = useGuruChat(
    user && viewState === 'chat' ? `session-${user.uid}` : undefined
  )

  const hiddenRoutes = [
    '/login',
    '/signup',
    '/magic-link',
    '/onboarding',
    '/onboarding',
    '/guru',
    '/report',
    '/reports/',
    '/pay/',
    '/payments',
    '/thanks',
  ]

  const shouldHideWidget = hiddenRoutes.some((route) =>
    route.endsWith('/') ? pathname.startsWith(route) : pathname === route
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
      const success = await sendMessage(msg)
      if (success) {
        await refreshCanonicalTickets()
      }
    } else {
      setViewState('blocked')
    }
  }

  const refreshCanonicalTickets = async () => {
    try {
      const response = await fetch('/api/user/tickets', { credentials: 'include' })
      if (!response.ok) return
      const data = await response.json().catch(() => null)
      if (!data?.tickets) return

      updateUser({
        tickets: data.tickets.aiGuruTickets || 0,
        aiGuruTickets: data.tickets.aiGuruTickets || 0,
        kundaliTickets: data.tickets.kundaliTickets || 0,
        lifetimePredictions: data.tickets.lifetimePredictions || 0,
      })
    } catch (error) {
      console.error('Guru widget ticket refresh failed:', error)
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

  if (shouldHideWidget) {
    return null
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
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(24,33,63,0.22)] transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
            <MessageCircle className="w-8 h-8" />

            {/* Counter Badge */}
            {user && getRemainingCount() !== 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-raised bg-jyoti-gold text-[10px] font-bold text-primary">
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
            <Card className="flex-1 flex flex-col overflow-hidden border-border bg-surface-raised shadow-[0_18px_44px_rgba(24,33,63,0.18)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-secondary/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-jyoti-gold/40 bg-jyoti-gold/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">AI Guru</h3>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {getPlanLabel()}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground transition-colors hover:text-primary" />
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
                    <p className="text-sm text-muted-foreground">
                      Connect with the AI Guru to reveal insights about your career, love, and life
                      path.
                    </p>
                    <form onSubmit={handleGuestSubmit} className="space-y-3">
                      <Input
                        placeholder="Your Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                      />
                      <Button className="w-full font-bold">
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
                        <div className="mt-8 text-center text-xs text-muted-foreground">
                          <p>Ask about:</p>
                          <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {["Tomorrow's luck", 'Love compatibility', 'Career switch'].map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-border bg-secondary px-2 py-1"
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
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-secondary text-primary rounded-bl-none'
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {(isLoading || isTyping) && (
                        <div className="flex animate-pulse items-center gap-2 p-2 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                          <span>Guru is thinking...</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border bg-surface-sunken/70 p-3">
                      {/* Show remaining count for non-unlimited users */}
                      {user &&
                        !['advanced', 'supreme'].includes(user.subscription) &&
                        getRemainingCount() !== 0 && (
                          <div className="mb-2 text-center text-xs text-muted-foreground">
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
                          />
                        <Button
                          size="icon"
                          type="submit"
                          disabled={!input.trim() || isLoading || !canChat()}
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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--jyoti-gold)/0.16),transparent_60%)]" />

                    <div className="relative z-10 space-y-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary">Limit Reached</h4>
                        <p className="mt-1 text-xs text-muted-foreground">Get more answers instantly.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => {
                            setIsOpen(false)
                            router.push('/pay/99?ref=chat_widget')
                          }}
                          variant="outline"
                          className="h-auto flex-col gap-1 py-3"
                        >
                          <span className="text-xs font-bold text-primary">Quick</span>
                          <span className="text-[10px] text-muted-foreground">1 Q (₹99)</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setIsOpen(false)
                            router.push('/pay/199?ref=chat_widget')
                          }}
                          variant="outline"
                          className="h-auto flex-col gap-1 py-3"
                        >
                          <span className="text-xs font-bold text-primary">Deep</span>
                          <span className="text-[10px] text-muted-foreground">3 Q (₹199)</span>
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          setIsOpen(false)
                          router.push('/pricing')
                        }}
                        className="w-full"
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
