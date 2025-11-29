'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Flame, Music, Scroll, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { useUserStore } from '@/store/user-store'
import type { Ritual } from '@/lib/engines/ritual/ai-ritual-engine'

export default function RitualsPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [problem, setProblem] = useState('')
  const [loading, setLoading] = useState(false)
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleGenerate = async () => {
    if (!problem.trim()) return

    setLoading(true)
    setRitual(null)
    setError(null)

    try {
      const response = await fetch('/api/ritual/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          purpose: problem,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 401) {
          router.push('/login')
          return
        }
        
        if (response.status === 404) {
          setError('Please complete your birth details and generate your Kundali first.')
          return
        }

        throw new Error(errorData.error || 'Failed to generate ritual')
      }

      const result = await response.json()
      if (result.success && result.ritual) {
        setRitual(result.ritual)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Ritual gen error:', error)
      setError(error.message || 'Failed to generate ritual. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      <CosmicBackground />

      <div className="relative z-10 container mx-auto px-6 py-24 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4">
            <Flame className="w-8 h-8 text-gold animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold">
            Vedic Ritual Engine
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Describe your current life challenge. Our AI, trained on ancient scriptures, will
            generate a precise remedial ritual (Puja) for you.
          </p>
        </motion.div>

        {/* Input Section */}
        <Card className="bg-cosmic-indigo/40 backdrop-blur-xl border-white/10 p-8 mb-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-4">
            <Input
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && problem.trim()) {
                  handleGenerate()
                }
              }}
              placeholder="E.g. I am facing constant obstacles in my career promotion..."
              className="bg-white/5 border-white/10 text-lg py-6 focus:ring-gold/50 text-white placeholder:text-white/40"
            />
            <Button
              onClick={handleGenerate}
              disabled={loading || !problem.trim()}
              className="h-auto px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Manifest <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold/5 blur-3xl -z-0" />
        </Card>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200"
            >
              <p>{error}</p>
              {error.includes('Kundali') && (
                <Button
                  onClick={() => router.push('/onboarding')}
                  variant="outline"
                  className="mt-3 border-red-500/40 text-red-200 hover:bg-red-500/20"
                >
                  Complete Birth Details
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {ritual && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Ritual Header Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 text-center">
                <h2 className="text-3xl font-display font-bold text-gold mb-2">{ritual.name}</h2>
                {ritual.deity && (
                  <p className="text-white/70 italic">Dedicated to {ritual.deity}</p>
                )}
                <p className="text-white/60 mt-2">{ritual.purpose}</p>

                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <div className="px-4 py-2 rounded-full bg-black/30 border border-white/10 flex items-center gap-2 text-sm">
                    <Scroll className="w-4 h-4 text-purple-400" />
                    <span>{ritual.type.toUpperCase()}</span>
                  </div>
                  {ritual.mantra && (
                    <div className="px-4 py-2 rounded-full bg-black/30 border border-white/10 flex items-center gap-2 text-sm">
                      <Music className="w-4 h-4 text-pink-400" />
                      <span>Mantra Chanting</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Steps */}
                <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gold rounded-full" />
                    Procedure
                  </h3>
                  <ul className="space-y-4">
                    {ritual.procedure.map((step, i) => (
                      <li key={i} className="flex gap-4 text-white/80">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gold">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Mantra & Materials */}
                <div className="space-y-8">
                  {ritual.mantra && (
                    <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30 p-6 backdrop-blur-md">
                      <h3 className="text-xl font-semibold text-purple-200 mb-4">Sacred Mantra</h3>
                      <p className="text-2xl font-display text-center text-white leading-relaxed">
                        "{ritual.mantra}"
                      </p>
                      <p className="text-center text-sm text-white/40 mt-4">Chant 108 times</p>
                    </Card>
                  )}

                  <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Required Materials</h3>
                    <div className="flex flex-wrap gap-2">
                      {ritual.materials.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-gold/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Timing & Benefits */}
              <div className="grid md:grid-cols-2 gap-8">
                {ritual.timing && (
                  <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-gold" />
                      Best Timing
                    </h3>
                    <div className="space-y-2 text-white/80">
                      <p>
                        <span className="text-gold font-semibold">Days:</span>{' '}
                        {ritual.timing.bestDays.join(', ')}
                      </p>
                      <p>
                        <span className="text-gold font-semibold">Time:</span> {ritual.timing.bestTime}
                      </p>
                      <p>
                        <span className="text-gold font-semibold">Duration:</span>{' '}
                        {ritual.timing.duration}
                      </p>
                    </div>
                  </Card>
                )}

                {ritual.benefits && ritual.benefits.length > 0 && (
                  <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-md">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold" />
                      Benefits
                    </h3>
                    <ul className="space-y-2">
                      {ritual.benefits.map((benefit, i) => (
                        <li key={i} className="flex gap-2 text-white/80">
                          <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Precautions */}
              {ritual.precautions && ritual.precautions.length > 0 && (
                <Card className="bg-amber-900/20 border-amber-500/30 p-6 backdrop-blur-md">
                  <h3 className="text-xl font-semibold text-amber-200 mb-4">Important Precautions</h3>
                  <ul className="space-y-2">
                    {ritual.precautions.map((precaution, i) => (
                      <li key={i} className="flex gap-2 text-amber-100/80">
                        <span className="text-amber-400">⚠</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

